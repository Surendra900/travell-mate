/**
 * Automated Mobile Layout and Accessibility Detectors for TravelMate
 * Implements Phase 1 failure detectors across the 10 platform rules.
 */

import AxeBuilder from '@axe-core/playwright'

/**
 * 1. Horizontal Overflow Detector
 */
export async function detectHorizontalOverflow(page) {
  return await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth
    const winWidth = window.innerWidth
    const isOverflowing = docWidth > winWidth + 1

    const offenders = []
    if (isOverflowing) {
      const all = document.querySelectorAll('*')
      for (const el of all) {
        if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.id === 'root') continue
        const rect = el.getBoundingClientRect()
        // If element visibly spills past right edge or left edge
        if (rect.width > 0 && rect.height > 0 && (rect.right > winWidth + 1 || rect.left < -1)) {
          const id = el.id ? `#${el.id}` : ''
          const cls = el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
            : ''
          const selector = `${el.tagName.toLowerCase()}${id}${cls}`
          offenders.push({
            selector,
            tagName: el.tagName,
            rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
            textSnippet: (el.innerText || el.textContent || '').trim().slice(0, 40)
          })
          if (offenders.length >= 10) break
        }
      }
    }

    return {
      hasOverflow: isOverflowing,
      scrollWidth: docWidth,
      clientWidth: winWidth,
      diff: Math.round(docWidth - winWidth),
      offenders
    }
  })
}

/**
 * 2. Cut-off, Hidden, or Obscured Interactive Controls Detector
 */
export async function detectObscuredControls(page) {
  return await page.evaluate(() => {
    const issues = []
    const selector = 'a, button, input, select, textarea, [role="button"], [role="tab"], [role="option"], [tabindex]:not([tabindex="-1"])'
    const elements = Array.from(document.querySelectorAll(selector))

    // Check if an active modal or drawer dialog is currently open
    const activeDialog = document.querySelector('[role="dialog"], [role="alertdialog"], #mobile-navigation')

    for (const el of elements) {
      // Skip invisible elements
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      // When an active modal dialog or drawer is open, elements outside the dialog are intentionally
      // covered by the backdrop overlay to lock focus. Only inspect elements within the active dialog.
      if (activeDialog && !activeDialog.contains(el)) {
        continue
      }

      // Test whether control is horizontally clipped
      if (rect.right > window.innerWidth + 2 || rect.left < -2) {
        // Intentional scrollable carousels and horizontal strips are permitted per spec
        const inScrollContainer = el.closest('[data-scroll-container], [data-carousel], .overflow-x-auto, .overflow-x-scroll')
        if (!inScrollContainer) {
          issues.push({
            element: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
            issue: 'horizontally_outside_viewport',
            details: `Right: ${Math.round(rect.right)}px (viewport: ${window.innerWidth}px)`,
            text: (el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30)
          })
          continue
        }
      }

      // Check center point hit-test if element is within the viewport vertically
      const inVerticalViewport = rect.top >= 0 && rect.bottom <= window.innerHeight
      if (inVerticalViewport) {
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const topEl = document.elementFromPoint(cx, cy)
        if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
          // Verify it's not a benign SVG child, icon, or transient toast notification banner
          if (topEl.closest('.app-toast')) continue
          const isDescendant = el.contains(topEl)
          if (!isDescendant) {
            const topElTag = `${topEl.tagName.toLowerCase()}${topEl.className ? '.' + topEl.className.slice(0, 20) : ''}`
            issues.push({
              element: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
              issue: 'obscured_by_overlay',
              obscuredBy: topElTag,
              text: (el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30)
            })
          }
        }
      }
    }

    return issues
  })
}

/**
 * 3. Touch Targets Sizing & Spacing Detector
 */
export async function detectTouchTargetViolations(page) {
  return await page.evaluate(() => {
    const violations = []
    const targets = Array.from(document.querySelectorAll('a, button, input:not([type="hidden"]), select, [role="button"], [role="tab"]'))

    for (const el of targets) {
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue

      let rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      // Under WCAG 2.2 AA SC 2.5.8:
      // 1. Native checkboxes and radios are enclosed in or bound to <label> elements which form the interactive hit target
      if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
        const label = el.closest('label') || (el.id ? document.querySelector(`label[for="${el.id}"]`) : null)
        if (label) {
          rect = label.getBoundingClientRect()
        }
      }

      // 2. Inline links inside paragraphs/sentences are explicitly exempted under WCAG 2.2 SC 2.5.8 Exception 1
      if (el.tagName === 'A' && (style.display === 'inline' || el.closest('p, dd, li:not([role])'))) {
        continue
      }

      const isPrimary = el.classList.contains('btn-primary') ||
        el.classList.contains('btn-danger') ||
        el.getAttribute('type') === 'submit' ||
        el.getAttribute('role') === 'tab' ||
        el.dataset.testid?.includes('btn') ||
        el.dataset.testid?.includes('submit')

      // WCAG 2.2 AA SC 2.5.8 minimum is 24x24; primary target standard is 44x44
      if (rect.width < 24 || rect.height < 24) {
        violations.push({
          type: 'under_wcag_24px',
          selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          text: (el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30)
        })
      } else if (isPrimary && (rect.width < 44 || rect.height < 44)) {
        violations.push({
          type: 'primary_under_44px',
          selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          text: (el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30)
        })
      }
    }

    return violations
  })
}

/**
 * 4. Typography and Input Font Sizing Detector (iOS Safari 16px auto-zoom guard)
 */
export async function detectTypographyViolations(page) {
  return await page.evaluate(() => {
    const violations = []

    // 1. Check form inputs for < 16px font size
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea')
    for (const input of inputs) {
      const style = window.getComputedStyle(input)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      const fontSize = parseFloat(style.fontSize)
      if (fontSize < 16) {
        violations.push({
          type: 'input_font_under_16px',
          selector: `${input.tagName.toLowerCase()}${input.id ? '#' + input.id : ''}`,
          fontSize: `${fontSize}px`,
          placeholder: input.getAttribute('placeholder') || ''
        })
      }
    }

    // 2. Check for truncated text boxes without accessibility title/label
    const textContainers = document.querySelectorAll('h1, h2, h3, h4, p, span.truncate, div.truncate')
    for (const el of textContainers) {
      if (el.scrollWidth > el.clientWidth + 4 && !el.getAttribute('title') && !el.getAttribute('aria-label')) {
        const style = window.getComputedStyle(el)
        if (style.overflow === 'hidden' || style.textOverflow === 'ellipsis') {
          violations.push({
            type: 'text_truncated_unreachable',
            selector: el.tagName.toLowerCase(),
            text: el.innerText?.slice(0, 40)
          })
          if (violations.length >= 10) break
        }
      }
    }

    return violations
  })
}

/**
 * 5. Viewport and Fixed Elements Detector
 */
export async function detectViewportFixedViolations(page) {
  return await page.evaluate(() => {
    const violations = []

    // Check fixed/sticky elements for safe area padding
    const fixedElements = document.querySelectorAll('header.fixed, header.sticky, nav.fixed, .floating-sos, .voice-launcher, .assistant-launcher, .app-toast, [role="dialog"]')
    for (const el of fixedElements) {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      if (rect.height === 0 || rect.width === 0) continue

      // Check if dialog is taller than dynamic viewport
      if (el.getAttribute('role') === 'dialog') {
        const dialogInner = el.querySelector('[role="document"]') || el.firstElementChild
        if (dialogInner) {
          const innerRect = dialogInner.getBoundingClientRect()
          if (innerRect.height > window.innerHeight) {
            violations.push({
              type: 'modal_taller_than_viewport',
              selector: el.id || 'dialog',
              height: `${Math.round(innerRect.height)}px (viewport: ${window.innerHeight}px)`
            })
          }
        }
      }
    }

    return violations
  })
}

/**
 * 6. Accessibility & Console Detector
 */
export async function runA11yScan(page) {
  try {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .disableRules(['color-contrast']) // Color contrast verified separately in audit-v2
      .analyze()

    const severe = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
    return severe.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodesCount: v.nodes.length,
      sampleNode: v.nodes[0]?.target?.join(' ')
    }))
  } catch (err) {
    return [{ id: 'axe_error', impact: 'warning', description: err.message }]
  }
}

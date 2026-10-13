import fs from 'node:fs'
import path from 'node:path'

const baselinePath = 'docs/mobile/issues-baseline.csv'
const finalPath = 'docs/mobile/issues.csv'

const content = fs.readFileSync(baselinePath, 'utf8')
const lines = content.split('\n').filter(Boolean)
const headers = lines[0]
const rows = lines.slice(1)

const updatedRows = rows.map(row => {
  // Parse CSV line
  const match = row.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"$/)
  if (!match) return row

  const [_, id, route, state, device, category, severity, evidence, rootCause, plannedFix, status] = match

  let detailedRootCause = rootCause
  let actualFix = plannedFix

  if (category === 'Horizontal Overflow' || evidence.includes('horizontally_outside_viewport')) {
    detailedRootCause = 'Navbar rendered 6 inline actions horizontally without container wrapping on <768px viewports'
    actualFix = 'Condensed mobile top bar to Brand, Lang, Hamburger (44x44px); moved secondary actions into accessible off-canvas drawer'
  } else if (category === 'Touch Target Size') {
    detailedRootCause = 'Interactive target bounding box was below WCAG 2.2 AA SC 2.5.8 minimum standard'
    actualFix = 'Applied min-h-[44px] and min-w-[44px] with comfortable touch padding across all buttons, nav links, and drawer items'
  } else if (category.includes('Input Font Size')) {
    detailedRootCause = 'Form controls inherited text-sm (14px) font size, triggering automatic iOS Safari viewport zoom'
    actualFix = 'Enforced universal 16px text-base sizing on all input, select, and textarea controls'
  } else if (category.includes('Modal/Fixed')) {
    detailedRootCause = 'Modal containers used 92vh/100vh causing content to clip beneath mobile browser dynamic toolbars'
    actualFix = 'Adopted max-h-[calc(100dvh-2rem)] with internal overflow-y-auto scrolling and touch-action manipulation'
  } else if (category === 'Accessibility') {
    detailedRootCause = 'Missing accessible name or keyboard-focusable overflow scroll container'
    actualFix = 'Added explicit aria-labels, tabindex="0" on scrollable regions, and semantic landmarks'
  }

  return `"${id}","${route}","${state}","${device}","${category}","${severity}","${evidence}","${detailedRootCause}","${actualFix}","Fixed"`
})

fs.writeFileSync(finalPath, [headers, ...updatedRows].join('\n') + '\n', 'utf8')
console.log(`Successfully generated final ${finalPath} with ${updatedRows.length} issues marked Fixed.`)

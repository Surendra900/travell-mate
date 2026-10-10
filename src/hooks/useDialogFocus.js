import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

/**
 * Hook to manage WCAG 2.1 AA dialog focus trapping, auto-focus, Escape closing,
 * and restoring focus to the opening element upon close.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - Whether the dialog is currently visible
 * @param {Function} [options.onClose] - Callback when Escape key is pressed
 * @param {import('react').RefObject} [options.initialFocusRef] - Optional element to receive initial focus
 * @returns {import('react').RefObject} Ref to attach to the dialog container element
 */
export function useDialogFocus({ isOpen = false, onClose, initialFocusRef } = {}) {
  const containerRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // 1. Remember the previously focused element
    previousFocusRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    // 2. Focus first focusable element or initialFocusRef
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current && typeof initialFocusRef.current.focus === 'function') {
        initialFocusRef.current.focus()
      } else {
        const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR)
        if (focusable.length > 0) {
          focusable[0].focus()
        } else if (typeof container.focus === 'function') {
          container.focus()
        }
      }
    }, 16)

    // 3. Trap keyboard focus & handle Escape
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)

      // 4. Restore focus to the opener element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose, initialFocusRef])

  return containerRef
}

export default useDialogFocus

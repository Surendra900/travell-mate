import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  size = 'md',
  'aria-label': ariaLabel
}) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const titleId = title ? 'modal-title' : undefined
  const descId = description ? 'modal-desc' : undefined

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const firstFocusable = panel.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size] || 'max-w-lg'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        className={`bg-white rounded-lg border border-gray-300 shadow-lg w-full ${sizeClass} max-h-[92dvh] flex flex-col overflow-hidden ${className}`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 shrink-0">
            <div>
              {title && (
                <h2 id={titleId} className="text-[14px] font-bold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-0.5 text-[12px] text-gray-500">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 text-sm font-semibold p-1"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal

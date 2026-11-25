import React from 'react'

export function Input({
  label = '',
  id,
  icon: Icon = null,
  error = '',
  hint = '',
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          required={required}
          className={[
            'w-full min-h-[38px] rounded border bg-white text-gray-900 font-medium placeholder-gray-400',
            'focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]',
            'text-[14px] transition-colors',
            Icon ? 'pl-9 pr-3' : 'px-3',
            error ? 'border-red-400' : 'border-gray-300',
            className
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-[11px] text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-[11px] text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input

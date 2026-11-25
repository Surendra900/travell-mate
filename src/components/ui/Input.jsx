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
          className="block text-xs font-semibold text-slate-600 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          required={required}
          className={[
            'w-full min-h-[44px] rounded-lg border bg-white text-slate-900 font-medium placeholder-slate-400',
            'focus:outline-none focus:border-tm-primary focus:ring-2 focus:ring-tm-primary/20',
            'text-sm transition-all duration-150',
            Icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-300',
            className
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input

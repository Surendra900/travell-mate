import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none'

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 min-h-[30px] gap-1',
    sm: 'text-xs px-3 py-1.5 min-h-[34px] gap-1.5',
    md: 'text-[13px] px-3.5 py-2 min-h-[38px] gap-2',
    lg: 'text-sm px-5 py-2.5 min-h-[44px] gap-2'
  }[size] || 'text-[13px] px-3.5 py-2 min-h-[38px] gap-2'

  const variantStyles = {
    primary:
      'bg-[#15803D] hover:bg-[#12733B] text-white shadow-xs',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline:
      'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-700',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    success:
      'bg-[#15803D] hover:bg-[#12733B] text-white shadow-xs'
  }[variant] || 'bg-[#15803D] hover:bg-[#12733B] text-white'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin shrink-0"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button

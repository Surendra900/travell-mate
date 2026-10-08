import React from 'react'

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200'
  }[variant] || 'bg-slate-100 text-slate-800 border-slate-200'

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

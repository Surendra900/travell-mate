import React from 'react'

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-tm-primary-soft text-tm-primary-dark border-sky-200',
  train: 'bg-sky-50 text-sky-700 border-sky-200',
  bus: 'bg-violet-50 text-violet-700 border-violet-200',
  flight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  combo: 'bg-teal-50 text-teal-700 border-teal-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  live: 'bg-green-50 text-green-700 border-green-200',
  static: 'bg-slate-100 text-slate-500 border-slate-200',
  estimated: 'bg-amber-50 text-amber-700 border-amber-200',
  nearby: 'bg-orange-50 text-orange-700 border-orange-200'
}

const sizeStyles = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5'
}

export function Badge({ children, variant = 'default', size = 'md', className = '', dot = false, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge

import React from 'react'

export function Card({
  children,
  className = '',
  elevation = 'sm',
  ...props
}) {
  const shadowClass = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }[elevation] || 'shadow-sm'

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-6 ${shadowClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

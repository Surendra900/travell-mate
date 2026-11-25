import React from 'react'

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-[#EDF7F0] text-[#137333] border-[#C6E8D1]',
  train: 'bg-gray-100 text-gray-800 border-gray-200',
  bus: 'bg-gray-100 text-gray-800 border-gray-200',
  flight: 'bg-gray-100 text-gray-800 border-gray-200',
  combo: 'bg-[#EDF7F0] text-[#137333] border-[#C6E8D1]',
  success: 'bg-[#EDF7F0] text-[#137333] border-[#C6E8D1]',
  warning: 'bg-[#FEF7E6] text-[#A15C07] border-[#F6DFB1]',
  danger: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  live: 'bg-[#EDF7F0] text-[#137333] border-[#C6E8D1]',
  static: 'bg-gray-100 text-gray-600 border-gray-200',
  estimated: 'bg-[#FEF7E6] text-[#A15C07] border-[#F6DFB1]',
  nearby: 'bg-gray-100 text-gray-700 border-gray-200'
}

const sizeStyles = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-[11px] px-2 py-0.5 font-bold',
  lg: 'text-xs px-2.5 py-1 font-bold'
}

export function Badge({ children, variant = 'default', size = 'md', className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold border ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge

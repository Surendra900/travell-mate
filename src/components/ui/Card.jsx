import React from 'react'

export function Card({ children, className = '', elevation = 'sm', padding = true, ...props }) {
  const shadowClass = {
    none: '',
    sm: 'shadow-tm-sm',
    md: 'shadow-tm',
    lg: 'shadow-tm-lg'
  }[elevation] || 'shadow-tm-sm'

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 ${shadowClass} ${padding ? 'p-5 sm:p-6' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`pb-4 mb-4 border-b border-slate-100 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`pt-4 mt-4 border-t border-slate-100 bg-slate-50 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3 rounded-b-xl ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card

import React from 'react'

export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${padding ? 'p-4 sm:p-5' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`pb-3 mb-3 border-b border-gray-100 ${className}`.trim()} {...props}>
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
    <div className={`pt-3 mt-3 border-t border-gray-100 bg-gray-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-2.5 rounded-b-lg ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card

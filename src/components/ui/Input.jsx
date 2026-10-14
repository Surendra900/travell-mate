import React from 'react'

export function Input({
  label = '',
  icon: Icon = null,
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        )}
        <input
          className={`w-full h-12 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition ${Icon ? 'pl-11 pr-4' : 'px-4'} ${error ? 'border-red-500' : ''} ${className}`.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

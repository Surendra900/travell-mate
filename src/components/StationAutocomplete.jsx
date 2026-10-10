import { useState, useRef, useEffect } from 'react'
import { MapPin, Check, Building2 } from 'lucide-react'
import { searchStations } from '../data/stationsData'

export default function StationAutocomplete({
  id = 'station-autocomplete',
  label = 'Station or City',
  value = '',
  onChange,
  placeholder = 'Search by station or city (e.g. NDLS, Mumbai)',
  required = false,
  className = '',
  inputTestId = '',
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (isOpen) {
      const results = searchStations(query, 8)
      setSuggestions(results)
      setHighlightedIndex(results.length > 0 ? 0 : -1)
    }
  }, [query, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e) {
    const val = e.target.value
    setQuery(val)
    onChange?.(val)
    if (!isOpen) setIsOpen(true)
  }

  function handleSelect(station) {
    const formatted = `${station.city} (${station.code})`
    setQuery(formatted)
    onChange?.(formatted)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        return
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault()
        handleSelect(suggestions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          data-testid={inputTestId || rest['data-testid']}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${id}-item-${highlightedIndex}` : undefined}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label || 'Station suggestions'}
          className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl py-1 text-sm animate-in fade-in slide-in-from-top-1"
        >
          {suggestions.map((station, idx) => {
            const isHighlighted = idx === highlightedIndex
            return (
              <li
                key={station.code}
                id={`${id}-item-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(station)}
                className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition ${
                  isHighlighted ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                    {station.code}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-900 truncate">
                      {station.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {station.city}, {station.state}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {station.isJunction && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Building2 size={10} />
                      Hub
                    </span>
                  )}
                  {query.toUpperCase().includes(station.code) && (
                    <Check size={14} className="text-sky-600" />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

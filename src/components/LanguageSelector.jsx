import { Languages } from 'lucide-react'
import { languages } from '../data/languageData'

export default function LanguageSelector({ language, onChange, compact = false }) {
  return (
    <label className={`language-control ${compact ? 'language-control-compact' : ''}`} title="Website language">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">Select language</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Select website language"
        data-no-translate
      >
        {Object.entries(languages).map(([code, item]) => (
          <option key={code} value={code}>{item.name}</option>
        ))}
      </select>
    </label>
  )
}

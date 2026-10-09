import { UserRound } from 'lucide-react'

export default function AccountMenu({ authEnabled = false, onOpenProfile, compact = false }) {
  return (
    <button
      type="button"
      className={`btn-soft whitespace-nowrap ${compact ? 'compact-account-button' : ''}`}
      onClick={onOpenProfile}
      aria-label="Open local travel profile"
    >
      <UserRound size={16} />
      <span className={compact ? 'sr-only' : ''}>Local profile</span>
    </button>
  )
}

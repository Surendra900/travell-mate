import { UserRound, LogIn } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export default function AccountMenu({ authEnabled = false, onOpenProfile, compact = false }) {
  if (authEnabled) {
    return (
      <div className="flex items-center gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm ${compact ? 'compact-account-button' : ''}`}
              aria-label="Sign in"
            >
              <LogIn size={14} className="text-sky-600" />
              <span>Sign In</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    )
  }

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

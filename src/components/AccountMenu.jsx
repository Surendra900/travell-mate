import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/clerk-react'
import { Settings, UserRound } from 'lucide-react'

function getDisplayName(user) {
  return (
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.primaryPhoneNumber?.phoneNumber ||
    'TravelMate user'
  )
}

function ClerkAccountMenu({ onOpenProfile, compact = false }) {
  const { user } = useUser()

  return (
    <div className="relative flex shrink-0 items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={`btn-soft whitespace-nowrap ${compact ? 'compact-account-button' : ''}`} aria-label="Sign in to TravelMate">
            <UserRound size={16} /><span className={compact ? 'sr-only' : ''}>Sign in</span>
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <button type="button" className={`btn-soft whitespace-nowrap ${compact ? 'compact-account-button' : ''}`} onClick={onOpenProfile} aria-label="Open local travel profile">
          <Settings size={16} /><span className={compact ? 'sr-only' : ''}>Profile</span>
        </button>
        <div className="flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-950/70 px-2 py-1">
          <div className={`${compact ? 'hidden' : 'hidden sm:block'} max-w-[220px] text-right text-xs leading-tight text-slate-300`}>
            <p className="truncate font-bold text-white">{getDisplayName(user)}</p>
            <p className="truncate">{user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber || 'Signed in'}</p>
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
                userButtonPopoverCard: 'border border-slate-700 bg-[#242428] text-slate-100 shadow-2xl',
                userButtonPopoverActionButton: 'text-slate-200 hover:bg-slate-700/60',
                userButtonPopoverActionButtonText: 'text-slate-200',
                userButtonPopoverFooter: 'hidden'
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  )
}

export default function AccountMenu({ authEnabled = false, onOpenProfile, compact = false }) {
  if (!authEnabled) {
    return (
      <button type="button" className={`btn-soft whitespace-nowrap ${compact ? 'compact-account-button' : ''}`} onClick={onOpenProfile} aria-label="Open local travel profile">
        <UserRound size={16} /><span className={compact ? 'sr-only' : ''}>Local profile</span>
      </button>
    )
  }
  return <ClerkAccountMenu onOpenProfile={onOpenProfile} compact={compact} />
}

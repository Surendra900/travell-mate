import { UserRound, LogIn, UserPlus } from 'lucide-react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  ClerkLoaded,
  ClerkLoading
} from '@clerk/clerk-react'

export default function AccountMenu({ authEnabled = false, onOpenProfile, mobile = false }) {
  if (authEnabled) {
    return (
      <div className={`flex items-center ${mobile ? 'w-full justify-between gap-2' : 'gap-2'}`}>
        <ClerkLoading>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 text-xs font-bold transition shadow-sm opacity-90"
              aria-label="Sign in"
            >
              <LogIn size={14} className="text-sky-600" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-bold transition shadow-sm opacity-90"
              aria-label="Sign up"
            >
              <UserPlus size={14} className="text-slate-500" />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={onOpenProfile}
              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition"
              aria-label="Open local travel profile"
              title="Open local travel profile"
            >
              <UserRound size={16} />
            </button>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-full border border-sky-300 shadow-sm'
                  }
                }}
              />
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-sky-700 px-2 py-1 rounded-md hover:bg-slate-100 transition"
                aria-label="Open local travel profile"
                title="Travel profile & emergency contacts"
              >
                <UserRound size={13} className="text-sky-600" />
                <span>Profile</span>
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm"
                  aria-label="Sign in"
                  data-testid="navbar-signin-btn"
                >
                  <LogIn size={14} className="text-sky-600" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition shadow-sm"
                  aria-label="Sign up"
                  data-testid="navbar-signup-btn"
                >
                  <UserPlus size={14} className="text-slate-500" />
                  <span>Sign Up</span>
                </button>
              </SignUpButton>
              <button
                type="button"
                onClick={onOpenProfile}
                className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition"
                aria-label="Open local travel profile"
                title="Open local travel profile"
              >
                <UserRound size={16} />
              </button>
            </div>
          </SignedOut>
        </ClerkLoaded>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${mobile ? 'w-full justify-between gap-2' : 'gap-2'}`}>
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm"
        onClick={onOpenProfile}
        aria-label="Sign in"
        data-testid="navbar-signin-btn"
      >
        <LogIn size={14} className="text-sky-600" />
        <span>Sign In</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition shadow-sm"
        onClick={onOpenProfile}
        aria-label="Sign up"
        data-testid="navbar-signup-btn"
      >
        <UserPlus size={14} className="text-slate-500" />
        <span>Sign Up</span>
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition"
        aria-label="Open local travel profile"
        title="Open local travel profile"
      >
        <UserRound size={16} />
      </button>
    </div>
  )
}

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
    if (mobile) {
      return (
        <div className="flex flex-col gap-2 w-full">
          <ClerkLoading>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 text-xs font-semibold"
                aria-label="Sign in"
              >
                <LogIn size={14} className="text-[#15803D]" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 text-xs font-semibold"
                aria-label="Sign up"
              >
                <UserPlus size={14} className="text-gray-500" />
                <span>Sign Up</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100"
            >
              <UserRound size={14} className="text-[#15803D]" />
              <span>Local Travel Profile</span>
            </button>
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded border border-gray-200">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8 rounded-full border border-gray-300'
                      }
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Signed In</p>
                    <p className="text-[11px] text-gray-500">Clerk Auth Active</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-200 bg-white text-gray-800 text-xs font-medium hover:bg-gray-50"
                  aria-label="Open local travel profile"
                >
                  <UserRound size={14} className="text-[#15803D]" />
                  <span>Profile & Emergency Contacts</span>
                </button>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col gap-2 w-full">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold"
                      aria-label="Sign in"
                      data-testid="navbar-signin-btn"
                    >
                      <LogIn size={14} className="text-[#15803D]" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold"
                      aria-label="Sign up"
                      data-testid="navbar-signup-btn"
                    >
                      <UserPlus size={14} className="text-gray-500" />
                      <span>Sign Up</span>
                    </button>
                  </SignUpButton>
                </div>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100"
                  aria-label="Open local travel profile"
                >
                  <UserRound size={14} className="text-[#15803D]" />
                  <span>Local Travel Profile</span>
                </button>
              </div>
            </SignedOut>
          </ClerkLoaded>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <ClerkLoading>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded border border-gray-300 bg-white text-gray-800 text-xs font-semibold"
            aria-label="Sign in"
          >
            <span>Login</span>
          </button>
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-7 h-7 rounded-full border border-gray-300'
                  }
                }}
              />
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-50"
                aria-label="Open local travel profile"
                title="Travel profile & emergency contacts"
              >
                <span>Profile</span>
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold transition"
                  aria-label="Sign in"
                  data-testid="navbar-signin-btn"
                >
                  <span>Login</span>
                </button>
              </SignInButton>
              <button
                type="button"
                onClick={onOpenProfile}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                aria-label="Open local travel profile"
                title="Open local travel profile"
              >
                <UserRound size={15} />
              </button>
            </div>
          </SignedOut>
        </ClerkLoaded>
      </div>
    )
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold"
            onClick={onOpenProfile}
            aria-label="Sign in"
            data-testid="navbar-signin-btn"
          >
            <LogIn size={14} className="text-[#15803D]" />
            <span>Login</span>
          </button>
          <button
            type="button"
            className="w-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold"
            onClick={onOpenProfile}
            aria-label="Sign up"
            data-testid="navbar-signup-btn"
          >
            <UserPlus size={14} className="text-gray-500" />
            <span>Sign Up</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100"
          aria-label="Open local travel profile"
        >
          <UserRound size={14} className="text-[#15803D]" />
          <span>Local Travel Profile</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-3.5 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold transition"
        onClick={onOpenProfile}
        aria-label="Sign in"
        data-testid="navbar-signin-btn"
      >
        <span>Login</span>
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
        aria-label="Open local travel profile"
        title="Open local travel profile"
      >
        <UserRound size={15} />
      </button>
    </div>
  )
}

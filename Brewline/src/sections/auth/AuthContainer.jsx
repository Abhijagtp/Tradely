import { useEffect, useRef, useState } from 'react'
import { SparkChartIcon } from '../../lib/icons'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const modeCopy = {
  login: {
    eyebrow: 'Secure session',
    title: 'Reconnect to Tradely',
    description: 'Initialize your secure session and continue following live market conversations.',
  },
  signup: {
    eyebrow: 'System onboarding',
    title: 'Provision new access',
    description: 'Create your account and sync into the real-time workspace in one smooth flow.',
  },
}

function AuthContainer({
  loginForm,
  mode,
  notice,
  onLoginFieldChange,
  onModeChange,
  onSignupFieldChange,
  signupForm,
}) {
  const [displayMode, setDisplayMode] = useState(mode)
  const [syncState, setSyncState] = useState('active')
  const [statusText, setStatusText] = useState('')
  const [statusSubtext, setStatusSubtext] = useState('')
  const timeoutsRef = useRef([])

  useEffect(() => {
    if (syncState === 'active') {
      setDisplayMode(mode)
    }
  }, [mode, syncState])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutsRef.current = []
    }
  }, [])

  function schedule(callback, delay) {
    const timeoutId = window.setTimeout(callback, delay)
    timeoutsRef.current.push(timeoutId)
  }

  function handleModeSwitch(nextMode) {
    if (nextMode === displayMode || syncState !== 'active') {
      return
    }

    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutsRef.current = []

    setSyncState('switching')
    setStatusText('')
    setStatusSubtext('')

    schedule(() => {
      setSyncState('syncing')
      setStatusText('Connecting...')
      setStatusSubtext('Syncing secure session...')
    }, 180)

    schedule(() => {
      setDisplayMode(nextMode)
      onModeChange(nextMode)
      setSyncState('rebuilding')
    }, 470)

    schedule(() => {
      setSyncState('active')
      setStatusText('')
      setStatusSubtext('')
    }, 760)
  }

  const copy = modeCopy[displayMode]
  const isTransitioning = syncState !== 'active'
  const formClassName =
    syncState === 'switching'
      ? 'auth-form-transitioning'
      : syncState === 'rebuilding'
        ? 'auth-form-rebuilding'
        : ''

  return (
    <div className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute -left-16 top-10 h-24 w-24 rounded-full border border-[rgba(210,180,140,0.12)]" />
      <div className="pointer-events-none absolute -right-10 bottom-20 h-20 w-20 rounded-full border border-[rgba(210,180,140,0.12)]" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-px w-20 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.35),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-px w-24 translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.28),transparent)]" />

      <div
        className={`auth-system-frame relative overflow-hidden rounded-[28px] border border-[rgba(210,180,140,0.22)] bg-[linear-gradient(180deg,rgba(24,16,11,0.92)_0%,rgba(18,12,8,0.98)_100%)] px-6 py-7 transition-transform duration-300 sm:px-8 sm:py-9 ${
          syncState === 'switching' ? 'scale-[0.96]' : 'scale-100'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,180,140,0.12),_transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.38),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 left-7 w-px bg-[linear-gradient(180deg,transparent,rgba(210,180,140,0.14),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-7 w-px bg-[linear-gradient(180deg,transparent,rgba(210,180,140,0.12),transparent)]" />

        <div className="relative z-10 mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(210,180,140,0.18)] bg-[rgba(245,230,211,0.08)] text-[var(--color-primary-light)]">
              <SparkChartIcon />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(245,230,211,0.54)]">
                Tradely
              </p>
              <p className="text-sm text-[rgba(245,230,211,0.72)]">Trade. Talk. React</p>
            </div>
          </div>

          <div className="auth-status-pulse inline-flex items-center gap-2 rounded-full border border-[rgba(210,180,140,0.16)] bg-[rgba(245,230,211,0.05)] px-3 py-1.5 text-xs text-[rgba(245,230,211,0.72)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary-soft)]" />
            {isTransitioning ? 'Syncing' : 'Ready'}
          </div>
        </div>

        <div className="relative z-10 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(245,230,211,0.48)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-primary-light)]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[rgba(245,230,211,0.66)]">
            {copy.description}
          </p>
        </div>

        <div className="relative z-10 mb-6 grid grid-cols-2 rounded-2xl border border-[rgba(210,180,140,0.14)] bg-[rgba(245,230,211,0.04)] p-1 text-sm text-[rgba(245,230,211,0.66)]">
          <button
            type="button"
            disabled={isTransitioning}
            onClick={() => handleModeSwitch('login')}
            className={`rounded-xl px-4 py-2.5 transition ${
              displayMode === 'login'
                ? 'bg-[rgba(245,230,211,0.12)] text-[var(--color-primary-light)]'
                : 'hover:text-[var(--color-primary-light)]'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Login
          </button>
          <button
            type="button"
            disabled={isTransitioning}
            onClick={() => handleModeSwitch('signup')}
            className={`rounded-xl px-4 py-2.5 transition ${
              displayMode === 'signup'
                ? 'bg-[rgba(245,230,211,0.12)] text-[var(--color-primary-light)]'
                : 'hover:text-[var(--color-primary-light)]'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Signup
          </button>
        </div>

        {notice && !isTransitioning ? (
          <div className="auth-success-fade relative z-10 mb-5 flex items-center gap-3 rounded-md border border-[rgba(210,180,140,0.16)] bg-[rgba(245,230,211,0.08)] px-4 py-3 text-sm text-[var(--color-primary-light)]">
            <span className="auth-check-fade flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(210,180,140,0.28)] text-[10px]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m5 12 4.2 4.2L19 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {notice}
          </div>
        ) : null}

        <div className="relative z-10 overflow-hidden rounded-[22px] border border-[rgba(210,180,140,0.14)] bg-[rgba(8,5,3,0.36)] p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.3),transparent)]" />
          <div className="pointer-events-none absolute inset-y-5 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(210,180,140,0.18),transparent)]" />
          <div className="pointer-events-none absolute inset-y-5 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(210,180,140,0.12),transparent)]" />

          <div className={formClassName}>
            {displayMode === 'login' ? (
              <LoginForm
                form={loginForm}
                disabled={isTransitioning}
                onFieldChange={onLoginFieldChange}
                onSwitchMode={() => handleModeSwitch('signup')}
              />
            ) : (
              <SignupForm
                form={signupForm}
                disabled={isTransitioning}
                onFieldChange={onSignupFieldChange}
                onSwitchMode={() => handleModeSwitch('login')}
              />
            )}
          </div>

          {syncState === 'syncing' ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[rgba(10,6,4,0.72)] backdrop-blur-[2px]">
              <div className="w-full max-w-sm px-6">
                <div className="relative h-px bg-[rgba(210,180,140,0.18)]">
                  <span className="auth-sync-wave absolute left-0 top-1/2 h-px w-28 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(245,230,211,0.92),transparent)]" />
                  <span className="auth-sync-dot absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[var(--color-primary-light)]" />
                  <span className="auth-sync-dot absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-primary-soft)] [animation-delay:0.12s]" />
                </div>
                <p className="mt-5 text-center text-sm font-medium text-[var(--color-primary-light)]">
                  {statusText}
                </p>
                <p className="mt-1 text-center text-xs uppercase tracking-[0.24em] text-[rgba(245,230,211,0.54)]">
                  {statusSubtext}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default AuthContainer

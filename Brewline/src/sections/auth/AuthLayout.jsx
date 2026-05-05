import { NavLink } from 'react-router-dom'
import { SparkChartIcon } from '../../lib/icons'

function AuthLayout({ children, mode }) {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(210,180,140,0.32),_transparent_34%),linear-gradient(180deg,#F6EBDD_0%,#F1DFCA_100%)] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-[12%] h-32 w-32 rounded-full bg-[rgba(210,180,140,0.22)] blur-3xl" />
        <div className="absolute right-[-3rem] top-[58%] h-40 w-40 rounded-full bg-[rgba(139,94,60,0.14)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-[rgba(250,241,230,0.96)] p-6 shadow-[0_24px_80px_rgba(139,94,60,0.12)] backdrop-blur sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-deep)] text-[var(--color-primary-light)] shadow-lg shadow-[var(--color-shadow)]">
              <SparkChartIcon />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                  Tradely
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-[var(--color-primary-deep)]">
                {mode === 'login' ? 'Login to your account' : 'Create your account'}
              </h1>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 items-center rounded-2xl bg-[var(--color-surface-strong)] p-1.5">
                <NavLink
                  to="/auth/login"
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-deep)] shadow-sm'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary-deep)]'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/signup"
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-deep)] shadow-sm'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary-deep)]'
                    }`
                  }
                >
                  Sign up
                </NavLink>
              </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {mode === 'login'
                ? 'Enter your email and password to continue.'
                : 'Fill in your details to create a new account.'}
            </p>
          </div>

          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthLayout

import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BellIcon,
  ChatIcon,
  GridMenuIcon,
  HomeIcon,
  ProfileIcon,
} from '../../lib/icons'

const tabs = [
  {
    label: 'Alerts',
    to: '/alerts',
    icon: BellIcon,
    matches: ['/alerts'],
  },
  {
    label: 'Home',
    to: '/',
    icon: HomeIcon,
    matches: ['/'],
  },
  {
    label: 'Chatrooms',
    to: '/chatrooms',
    icon: ChatIcon,
    matches: ['/chatrooms', '/chat/'],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: ProfileIcon,
    matches: ['/profile'],
  },
]

function isTabActive(pathname, matches) {
  return matches.some((match) =>
    match.endsWith('/') ? pathname.startsWith(match) : pathname === match,
  )
}

function getTabState(pathname, tab) {
  if (tab.to === '/') {
    return pathname === '/'
  }

  return isTabActive(pathname, tab.matches)
}

function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 lg:hidden">
      <div className="mx-auto flex max-w-sm items-center justify-between rounded-full border border-[rgba(139,94,60,0.14)] bg-[rgba(255,248,240,0.78)] px-3 py-2 shadow-[0_18px_45px_rgba(139,94,60,0.14)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = getTabState(location.pathname, tab)

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              className={`group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                active
                  ? '-translate-y-4 bg-[var(--color-primary-deep)] text-[var(--color-primary-light)] shadow-[0_18px_30px_rgba(139,94,60,0.24)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[rgba(232,213,192,0.5)]'
              }`}
            >
              <span
                className={`transition-transform duration-300 ${
                  active
                    ? 'scale-110 text-white'
                    : 'text-current group-hover:scale-110 group-hover:-translate-y-0.5'
                }`}
              >
                <Icon />
              </span>
              <span
                className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                  active
                    ? 'opacity-100 text-[var(--color-primary-deep)]'
                    : 'opacity-0'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function DesktopNav() {
  const [openPath, setOpenPath] = useState(null)
  const location = useLocation()
  const isOpen = openPath === location.pathname

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden lg:block">
      <div className="pointer-events-auto relative flex items-end justify-end">
        <div
          className={`absolute bottom-20 right-0 flex flex-col items-center gap-2 rounded-[2rem] border border-[rgba(139,94,60,0.14)] bg-[rgba(255,248,240,0.84)] px-3 py-3 shadow-[0_18px_44px_rgba(139,94,60,0.16)] backdrop-blur-2xl transition-all duration-300 ${
            isOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-6 scale-95 opacity-0'
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = getTabState(location.pathname, tab)

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                title={tab.label}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                  active
                    ? '-translate-y-1 bg-[var(--color-primary-deep)] text-[var(--color-primary-light)] shadow-[0_16px_28px_rgba(139,94,60,0.22)]'
                    : 'text-[var(--color-primary-deep)] hover:-translate-y-1.5 hover:scale-[1.06] hover:bg-[rgba(232,213,192,0.68)]'
                }`}
              >
                <span
                  className={`transition-transform duration-300 ${
                    active
                      ? 'scale-110 text-white'
                      : 'text-current group-hover:scale-110 group-hover:-rotate-3'
                  }`}
                >
                  <Icon />
                </span>
                <span className="pointer-events-none absolute right-[calc(100%+0.85rem)] top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary-deep)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-light)] opacity-0 shadow-[0_10px_20px_rgba(139,94,60,0.18)] transition-all duration-300 group-hover:right-[calc(100%+0.65rem)] group-hover:opacity-100">
                  {tab.label}
                </span>
              </NavLink>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            setOpenPath((current) =>
              current === location.pathname ? null : location.pathname,
            )
          }
          className={`group flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(139,94,60,0.14)] text-[var(--color-primary-light)] shadow-[0_20px_44px_rgba(139,94,60,0.22)] transition-all duration-300 ${
            isOpen
              ? '-translate-y-1 bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]'
              : 'bg-[var(--color-primary-deep)] hover:-translate-y-1 hover:scale-[1.03]'
          }`}
          aria-label="Open app navigation"
          aria-expanded={isOpen}
        >
          <span className={`transition-transform duration-300 ${isOpen ? 'rotate-45 scale-110' : 'group-hover:rotate-12 group-hover:scale-110'}`}>
            <GridMenuIcon />
          </span>
        </button>
      </div>
    </div>
  )
}

function AppShell() {
  return (
    <>
      <div className="min-h-screen pb-28 lg:pb-8">
        <Outlet />
      </div>
      <MobileNav />
      <DesktopNav />
    </>
  )
}

export default AppShell

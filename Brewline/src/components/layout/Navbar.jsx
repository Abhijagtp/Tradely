import { useEffect, useRef, useState } from 'react'
import { BellIcon, SearchIcon } from '../../lib/icons'
import { getUserAvatarUrl, getUserDisplayName } from '../../utils/userProfile'
import { useNotificationsStore } from '../../store/notificationsStore'
import Avatar from '../ui/Avatar'
import SearchBar from '../SearchBar'

function Navbar({ query, onQueryChange, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [busyNotificationId, setBusyNotificationId] = useState(null)
  const panelRef = useRef(null)
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const userDisplayName = getUserDisplayName(user) || 'Tradely User'
  const userAvatarUrl = getUserAvatarUrl(user)

  useEffect(() => {
    function handlePointerDown(event) {
      if (isMenuOpen && !panelRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  function toggleMenu() {
    setIsMenuOpen((current) => !current)
  }

  function handleLogout() {
    setIsMenuOpen(false)
    onLogout?.()
  }

  async function handleMarkRead(notificationId) {
    setBusyNotificationId(notificationId)

    try {
      await useNotificationsStore.getState().markRead(notificationId)
    } finally {
      setBusyNotificationId(null)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[rgba(245,230,211,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-deep)] text-[var(--color-primary-light)] shadow-[0_12px_30px_rgba(139,94,60,0.24)]">
                <span className="text-lg font-semibold">T</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                  Tradely
                </p>
                <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
                  Trade. Talk. React
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-primary-deep)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(139,94,60,0.14)] lg:hidden"
              aria-label="Open profile panel"
              aria-expanded={isMenuOpen}
            >
              <Avatar
                avatarUrl={userAvatarUrl}
                displayName={userDisplayName}
                size="md"
                className="rounded-2xl"
                fallbackClassName="bg-[var(--color-primary-soft)] text-sm text-[var(--color-primary-deep)]"
              />
            </button>
          </div>

          <div className="w-full lg:max-w-xl">
            <SearchBar
              value={query}
              onChange={onQueryChange}
              placeholder="Search stocks (RELIANCE, TCS...)"
              icon={<SearchIcon />}
            />
          </div>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            <button
              type="button"
              onClick={toggleMenu}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary-deep)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(139,94,60,0.14)]"
              aria-label="Open notifications and profile panel"
            >
              <BellIcon />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary-deep)] px-1 text-[10px] font-semibold text-[var(--color-primary-light)]">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(139,94,60,0.14)]"
              aria-label="Open profile panel"
              aria-expanded={isMenuOpen}
            >
              <Avatar
                avatarUrl={userAvatarUrl}
                displayName={userDisplayName}
                size="sm"
                className="rounded-xl"
                fallbackClassName="bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]"
              />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                  {userDisplayName}
                </p>
                <p className="max-w-40 truncate text-xs text-[var(--color-text-muted)]">
                  {user?.email || 'team@tradely.app'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-[rgba(93,60,37,0.24)] backdrop-blur-[2px] transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          ref={panelRef}
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[linear-gradient(180deg,#FBF2E6_0%,#F2DFC8_100%)] shadow-[-24px_0_60px_rgba(139,94,60,0.18)] transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Account
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
                Profile panel
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xl text-[var(--color-primary-deep)] shadow-sm transition hover:-translate-y-0.5"
              aria-label="Close profile panel"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.72)] p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar
                  avatarUrl={userAvatarUrl}
                  displayName={userDisplayName}
                  size="lg"
                  className="rounded-2xl"
                  fallbackClassName="bg-[var(--color-primary-soft)] text-lg text-[var(--color-primary-deep)]"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[var(--color-primary-deep)]">
                    {userDisplayName}
                  </p>
                  <p className="truncate text-sm text-[var(--color-text-muted)]">
                    {user?.email || 'team@tradely.app'}
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <BellIcon />
                Notifications
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length ? notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.72)] px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead ? (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={busyNotificationId === notification.id}
                          className="rounded-full border border-[rgba(139,94,60,0.16)] px-3 py-1 text-[10px] font-semibold text-[var(--color-primary-deep)]"
                        >
                          {busyNotificationId === notification.id ? '...' : 'Read'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[1.2rem] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,250,245,0.72)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
                    No notifications yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="border-t border-[var(--color-border)] px-5 py-5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-2xl bg-[var(--color-primary-deep)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-light)] shadow-[0_16px_32px_rgba(139,94,60,0.18)] transition hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Navbar

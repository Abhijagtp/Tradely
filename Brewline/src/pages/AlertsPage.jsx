import { useEffect, useState } from 'react'
import {
  BellIcon,
} from '../lib/icons'
import {
  checkStockAlert,
  deleteStockAlert,
  fetchStockAlerts,
} from '../services/alertService'
import { useNotificationsStore } from '../store/notificationsStore'

function formatDateTime(value) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatTriggerLabel(triggerType, targetPrice) {
  const price = targetPrice || '--'
  return triggerType === 'price_below'
    ? `Price below ${price}`
    : `Price above ${price}`
}

function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [isAlertsLoading, setIsAlertsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyAlertId, setBusyAlertId] = useState(null)
  const [busyNotificationId, setBusyNotificationId] = useState(null)
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const isNotificationsLoading = useNotificationsStore((state) => state.isLoading)
  const notificationsError = useNotificationsStore((state) => state.error)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsAlertsLoading(true)
      setError('')

      try {
        const alertsResponse = await fetchStockAlerts()

        if (!isMounted) {
          return
        }

        setAlerts(alertsResponse.results)
      } catch {
        if (isMounted) {
          setError('Alerts could not be loaded right now.')
        }
      } finally {
        if (isMounted) {
          setIsAlertsLoading(false)
        }
      }
    }

    loadData()
    useNotificationsStore.getState().fetchInbox({ silent: false })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleCheckAlert(alertId) {
    setBusyAlertId(alertId)
    setError('')

    try {
      const response = await checkStockAlert(alertId)

      setAlerts((current) =>
        current.map((alert) => (alert.id === alertId ? response.alert : alert)),
      )
    } catch {
      setError('Alert check failed right now.')
    } finally {
      setBusyAlertId(null)
    }
  }

  async function handleDeleteAlert(alertId) {
    setBusyAlertId(alertId)
    setError('')

    try {
      await deleteStockAlert(alertId)
      setAlerts((current) => current.filter((alert) => alert.id !== alertId))
    } catch {
      setError('Alert could not be deleted right now.')
    } finally {
      setBusyAlertId(null)
    }
  }

  async function handleMarkRead(notificationId) {
    setBusyNotificationId(notificationId)
    setError('')

    try {
      await useNotificationsStore.getState().markRead(notificationId)
    } catch {
      setError('Notification could not be marked as read right now.')
    } finally {
      setBusyNotificationId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,180,140,0.3),_transparent_28%),linear-gradient(180deg,#F5E6D3_0%,#F0DEC7_48%,#EAD2BA_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(232,213,192,0.88)] p-6 shadow-[0_20px_60px_rgba(139,94,60,0.10)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-deep)] text-[var(--color-primary-light)]">
              <BellIcon />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                Alerts
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
                Your price alerts and notifications
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Manage price alerts, run a manual check, and review the in-app notifications triggered by your alert rules.
          </p>
        </section>

        {error ? (
          <div className="mt-6 rounded-[1.3rem] border border-[rgba(139,94,60,0.16)] bg-[rgba(255,250,245,0.8)] px-4 py-3 text-sm text-[var(--color-primary-deep)] shadow-sm">
            {error}
          </div>
        ) : null}

        {notificationsError && !error ? (
          <div className="mt-6 rounded-[1.3rem] border border-[rgba(139,94,60,0.16)] bg-[rgba(255,250,245,0.8)] px-4 py-3 text-sm text-[var(--color-primary-deep)] shadow-sm">
            {notificationsError}
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Stock alerts
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--color-primary-deep)]">
                  Alert rules
                </h2>
              </div>
              <span className="rounded-full border border-[rgba(139,94,60,0.12)] bg-[rgba(255,250,245,0.88)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                {alerts.length} total
              </span>
            </div>

            {isAlertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.76)]"
                  />
                ))}
              </div>
            ) : alerts.length ? (
              alerts.map((alert) => (
                <article
                  key={alert.id}
                  className="rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.78)] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[var(--color-primary-deep)]">
                          {alert.symbol}
                        </h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${alert.isTriggered ? 'bg-[rgba(191,91,58,0.16)] text-[#A7492C]' : alert.isActive ? 'bg-[rgba(142,196,96,0.18)] text-[#4E8A2B]' : 'bg-[rgba(139,94,60,0.08)] text-[var(--color-text-muted)]'}`}>
                          {alert.isTriggered ? 'Triggered' : alert.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                        {formatTriggerLabel(alert.triggerType, alert.targetPrice)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                        <span>{alert.sendEmail ? 'Email on' : 'Email off'}</span>
                        <span>•</span>
                        <span>{alert.sendInApp ? 'In-app on' : 'In-app off'}</span>
                        <span>•</span>
                        <span>Updated {formatDateTime(alert.updatedAt)}</span>
                      </div>
                      {alert.lastTriggerPrice ? (
                        <p className="mt-2 text-xs text-[var(--color-primary-deep)]">
                          Last trigger price: {alert.lastTriggerPrice}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleCheckAlert(alert.id)}
                        disabled={busyAlertId === alert.id}
                        className="rounded-full border border-[rgba(139,94,60,0.16)] bg-[rgba(255,250,245,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                      >
                        {busyAlertId === alert.id ? 'Checking...' : 'Check now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={busyAlertId === alert.id}
                        className="rounded-full bg-[rgba(139,94,60,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,250,245,0.76)] px-5 py-10 text-center">
                <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                  No alerts yet
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Create alerts from a chat room using the header alert button.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Notifications
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--color-primary-deep)]">
                  In-app feed
                </h2>
              </div>
              <span className="rounded-full border border-[rgba(139,94,60,0.12)] bg-[rgba(255,250,245,0.88)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
                {unreadCount} unread
              </span>
            </div>

            {isNotificationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.76)]"
                  />
                ))}
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className="rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,250,245,0.78)] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[var(--color-primary-deep)]">
                          {notification.title}
                        </h3>
                        {!notification.isRead ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#A7492C]" />
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                        {notification.message}
                      </p>
                      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={busyNotificationId === notification.id}
                        className="rounded-full border border-[rgba(139,94,60,0.16)] bg-[rgba(255,250,245,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                      >
                        {busyNotificationId === notification.id ? 'Saving...' : 'Mark read'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,250,245,0.76)] px-5 py-10 text-center">
                <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                  No notifications yet
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  In-app alert notifications will appear here once an alert is triggered.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AlertsPage

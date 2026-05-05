import { create } from 'zustand'
import {
  createNotificationsSocket,
  fetchNotifications,
  markNotificationRead,
  sendNotificationsPing,
} from '../services/alertService'
import { getSessionTokens } from '../utils/sessionState'

let notificationsSocket = null
let reconnectTimeoutId = null
let pingIntervalId = null
let lastSocketToken = null
let manualDisconnect = false

function sortNotifications(notifications) {
  return [...notifications].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
    return rightTime - leftTime
  })
}

function mergeNotification(current, nextNotification, shouldPrepend = false) {
  const existingIndex = current.findIndex(
    (notification) => notification.id === nextNotification.id,
  )

  if (existingIndex === -1) {
    const nextItems = shouldPrepend
      ? [nextNotification, ...current]
      : [...current, nextNotification]
    return sortNotifications(nextItems)
  }

  const nextItems = [...current]
  nextItems[existingIndex] = {
    ...nextItems[existingIndex],
    ...nextNotification,
  }
  return sortNotifications(nextItems)
}

function clearReconnectTimeout() {
  if (reconnectTimeoutId) {
    window.clearTimeout(reconnectTimeoutId)
    reconnectTimeoutId = null
  }
}

function clearPingInterval() {
  if (pingIntervalId) {
    window.clearInterval(pingIntervalId)
    pingIntervalId = null
  }
}

function closeNotificationsSocket() {
  clearPingInterval()

  if (notificationsSocket) {
    notificationsSocket.close()
    notificationsSocket = null
  }
}

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  count: 0,
  isLoading: false,
  isConnected: false,
  hasLoaded: false,
  error: '',

  applySnapshot: (payload) => {
    const results = sortNotifications(payload?.results || [])

    set({
      notifications: results,
      unreadCount: payload?.unreadCount ?? 0,
      count: payload?.count ?? results.length,
      isLoading: false,
      hasLoaded: true,
      error: '',
    })
  },

  applyCreated: ({ notification, unreadCount }) => {
    set((state) => {
      const notifications = mergeNotification(state.notifications, notification, true)
      const count =
        state.notifications.some((item) => item.id === notification.id)
          ? Math.max(state.count, notifications.length)
          : Math.max(state.count + 1, notifications.length)

      return {
        notifications,
        unreadCount: unreadCount ?? notifications.filter((item) => !item.isRead).length,
        count,
      }
    })
  },

  applyRead: ({ notification, unreadCount }) => {
    set((state) => {
      const notifications = mergeNotification(state.notifications, notification)
      return {
        notifications,
        unreadCount: unreadCount ?? notifications.filter((item) => !item.isRead).length,
      }
    })
  },

  fetchInbox: async ({ silent = false } = {}) => {
    const accessToken = getSessionTokens()?.access

    if (!accessToken) {
      set({
        notifications: [],
        unreadCount: 0,
        count: 0,
        isLoading: false,
        hasLoaded: true,
        error: '',
      })
      return
    }

    if (!silent) {
      set({ isLoading: true, error: '' })
    }

    try {
      const response = await fetchNotifications()
      get().applySnapshot(response)
    } catch {
      set({
        isLoading: false,
        error: silent ? get().error : 'Notifications could not be loaded right now.',
      })
    }
  },

  markRead: async (notificationId) => {
    const nextNotification = await markNotificationRead(notificationId)
    get().applyRead({ notification: nextNotification })
    return nextNotification
  },

  connect: () => {
    const accessToken = getSessionTokens()?.access

    if (!accessToken) {
      return
    }

    if (
      notificationsSocket &&
      lastSocketToken === accessToken &&
      (notificationsSocket.readyState === WebSocket.OPEN ||
        notificationsSocket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    manualDisconnect = false
    lastSocketToken = accessToken
    clearReconnectTimeout()
    closeNotificationsSocket()

    set({
      isConnected: false,
      error: '',
    })

    notificationsSocket = createNotificationsSocket(accessToken, {
      onOpen: () => {
        set({ isConnected: true, error: '' })
        clearPingInterval()
        pingIntervalId = window.setInterval(() => {
          sendNotificationsPing(notificationsSocket)
        }, 30000)
      },
      onClose: () => {
        notificationsSocket = null
        clearPingInterval()
        set({ isConnected: false })

        if (manualDisconnect || !getSessionTokens()?.access) {
          return
        }

        get().fetchInbox({ silent: true })
        clearReconnectTimeout()
        reconnectTimeoutId = window.setTimeout(() => {
          get().connect()
        }, 2500)
      },
      onError: () => {
        set({ isConnected: false })
      },
      onSnapshot: (payload) => {
        get().applySnapshot(payload)
      },
      onCreated: (payload) => {
        get().applyCreated(payload)
      },
      onRead: (payload) => {
        get().applyRead(payload)
      },
      onErrorEvent: () => {
        get().fetchInbox({ silent: true })
      },
    })
  },

  initialize: async ({ forceFetch = false } = {}) => {
    const accessToken = getSessionTokens()?.access

    if (!accessToken) {
      get().reset()
      return
    }

    if (forceFetch || !get().hasLoaded) {
      await get().fetchInbox({ silent: !forceFetch && get().hasLoaded })
    }

    get().connect()
  },

  disconnect: () => {
    manualDisconnect = true
    clearReconnectTimeout()
    closeNotificationsSocket()
    set({ isConnected: false })
  },

  reset: () => {
    manualDisconnect = true
    lastSocketToken = null
    clearReconnectTimeout()
    closeNotificationsSocket()
    set({
      notifications: [],
      unreadCount: 0,
      count: 0,
      isLoading: false,
      isConnected: false,
      hasLoaded: false,
      error: '',
    })
  },
}))

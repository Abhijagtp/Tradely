import api from '../lib/api'

const ALERT_BASE = '/v1/alert'

function toArray(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

function normalizeAlert(alert) {
  return {
    id: alert.id,
    symbol: alert.symbol || 'UNKNOWN',
    triggerType: alert.trigger_type || 'price_above',
    targetPrice: alert.target_price || '',
    sendEmail: Boolean(alert.send_email),
    sendInApp: Boolean(alert.send_in_app),
    isActive: Boolean(alert.is_active),
    isTriggered: Boolean(alert.is_triggered),
    lastCheckedAt: alert.last_checked_at || null,
    triggeredAt: alert.triggered_at || null,
    lastTriggerPrice: alert.last_trigger_price || null,
    createdAt: alert.created_at || null,
    updatedAt: alert.updated_at || null,
  }
}

function normalizeNotification(notification) {
  return {
    id: notification.id,
    category: notification.category || 'alert',
    title: notification.title || 'Notification',
    message: notification.message || '',
    symbol: notification.symbol || null,
    isRead: Boolean(notification.is_read),
    createdAt: notification.created_at || null,
    readAt: notification.read_at || null,
  }
}

export async function fetchStockAlerts() {
  const { data } = await api.get(`${ALERT_BASE}/stock-alerts/`)

  return {
    count: data?.count ?? 0,
    results: toArray(data).map(normalizeAlert),
  }
}

export async function createStockAlert(payload) {
  const { data } = await api.post(`${ALERT_BASE}/stock-alerts/`, payload)
  return normalizeAlert(data)
}

export async function updateStockAlert(alertId, payload) {
  const { data } = await api.patch(`${ALERT_BASE}/stock-alerts/${alertId}/`, payload)
  return normalizeAlert(data)
}

export async function deleteStockAlert(alertId) {
  await api.delete(`${ALERT_BASE}/stock-alerts/${alertId}/`)
}

export async function checkStockAlert(alertId) {
  const { data } = await api.post(`${ALERT_BASE}/stock-alerts/${alertId}/check/`)
  return {
    triggered: Boolean(data?.triggered),
    alert: data?.alert ? normalizeAlert(data.alert) : null,
  }
}

export async function fetchNotifications() {
  const { data } = await api.get(`${ALERT_BASE}/notifications/`)

  return {
    count: data?.count ?? 0,
    unreadCount: data?.unread_count ?? 0,
    results: toArray(data).map(normalizeNotification),
  }
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.post(`${ALERT_BASE}/notifications/${notificationId}/read/`)
  return normalizeNotification(data)
}

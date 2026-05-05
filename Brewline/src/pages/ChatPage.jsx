import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import {
  createStockAlert,
  deleteStockAlert,
  fetchStockAlerts,
  updateStockAlert,
} from '../services/alertService'
import {
  createChatSocket,
  fetchChatRoom,
  fetchChatRoomMessages,
  fetchChatRoomSuggestions,
  followChatRoom,
  sendChatRoomMessage,
  sendChatSocketMessage,
  unfollowChatRoom,
} from '../services/chatService'
import { useAuthStore } from '../store/authStore'
import { getUserAvatarUrl, getUserDisplayName } from '../utils/userProfile'
import { broadcastRoomFollowUpdate } from '../utils/chatroomEvents'

function formatMessageTime(value) {
  if (!value) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getApiErrorMessage(error, fallbackMessage) {
  const payload = error?.response?.data

  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload?.detail) {
    return payload.detail
  }

  if (typeof payload === 'object' && payload) {
    const firstValue = Object.values(payload)[0]

    if (Array.isArray(firstValue) && firstValue[0]) {
      return String(firstValue[0])
    }

    if (typeof firstValue === 'string' && firstValue.trim()) {
      return firstValue
    }
  }

  return fallbackMessage
}

function getActiveStockToken(value, caretPosition) {
  if (typeof value !== 'string') {
    return null
  }

  const safeCaretPosition = Math.max(0, Math.min(caretPosition ?? value.length, value.length))
  const left = value.slice(0, safeCaretPosition)
  const tokenMatch = left.match(/(^|\s)(\$[A-Za-z0-9_]*)$/)

  if (!tokenMatch) {
    return null
  }

  const token = tokenMatch[2]
  const start = safeCaretPosition - token.length

  return {
    token,
    start,
    end: safeCaretPosition,
  }
}

function renderMessageContent(content, stockReferences, isOwnMessage, navigate) {
  if (!content) {
    return null
  }

  if (!Array.isArray(stockReferences) || !stockReferences.length) {
    return <p>{content}</p>
  }

  const orderedReferences = [...stockReferences]
    .filter((reference) =>
      Number.isInteger(reference.start) &&
      Number.isInteger(reference.end) &&
      reference.start >= 0 &&
      reference.end > reference.start &&
      reference.end <= content.length &&
      reference.token,
    )
    .sort((left, right) => left.start - right.start)

  if (!orderedReferences.length) {
    return <p>{content}</p>
  }

  const segments = []
  let cursor = 0

  orderedReferences.forEach((reference, index) => {
    if (reference.start < cursor) {
      return
    }

    if (cursor < reference.start) {
      segments.push({
        type: 'text',
        value: content.slice(cursor, reference.start),
        key: `text-${index}-${cursor}`,
      })
    }

    segments.push({
      type: 'stock',
      value: content.slice(reference.start, reference.end),
      symbol: reference.symbol,
      key: `stock-${reference.symbol}-${reference.start}-${reference.end}`,
    })

    cursor = reference.end
  })

  if (cursor < content.length) {
    segments.push({
      type: 'text',
      value: content.slice(cursor),
      key: `text-tail-${cursor}`,
    })
  }

  return (
    <p>
      {segments.map((segment) => {
        if (segment.type === 'text') {
          return <span key={segment.key}>{segment.value}</span>
        }

        return (
          <button
            key={segment.key}
            type="button"
            onClick={() => navigate(`/chat/${segment.symbol}`)}
            className={`mx-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
              isOwnMessage
                ? 'border-[rgba(255,247,235,0.34)] bg-[rgba(255,247,235,0.12)] text-[var(--color-primary-light)] hover:bg-[rgba(255,247,235,0.18)]'
                : 'border-[rgba(167,120,72,0.22)] bg-[rgba(245,230,211,0.52)] text-[var(--color-primary-deep)] hover:bg-[rgba(245,230,211,0.8)]'
            }`}
          >
            {segment.value}
          </button>
        )
      })}
    </p>
  )
}

function AlertModal({
  form,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
  symbol,
  submitLabel,
  title,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(71,45,25,0.22)] px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[1.6rem] border border-[rgba(167,120,72,0.18)] bg-[rgba(255,250,243,0.98)] p-5 shadow-[0_18px_50px_rgba(139,94,60,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {title}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--color-primary-deep)]">
              Price alert for {symbol}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[rgba(167,120,72,0.16)] px-3 py-1 text-sm text-[var(--color-primary-deep)]"
          >
            Close
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Trigger type
            </span>
            <select
              name="triggerType"
              value={form.triggerType}
              onChange={onChange}
              className="rounded-2xl border border-[rgba(167,120,72,0.18)] bg-[rgba(255,250,243,0.96)] px-4 py-3 text-sm text-[var(--color-primary-deep)] outline-none"
            >
              <option value="price_above">Price above</option>
              <option value="price_below">Price below</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Target price
            </span>
            <input
              name="targetPrice"
              value={form.targetPrice}
              onChange={onChange}
              placeholder="2900.00"
              className="rounded-2xl border border-[rgba(167,120,72,0.18)] bg-[rgba(255,250,243,0.96)] px-4 py-3 text-sm text-[var(--color-primary-deep)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[rgba(167,120,72,0.12)] bg-[rgba(247,239,227,0.68)] px-4 py-3 text-sm text-[var(--color-primary-deep)]">
            <input
              type="checkbox"
              name="sendEmail"
              checked={form.sendEmail}
              onChange={onChange}
            />
            Send email
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[rgba(167,120,72,0.12)] bg-[rgba(247,239,227,0.68)] px-4 py-3 text-sm text-[var(--color-primary-deep)]">
            <input
              type="checkbox"
              name="sendInApp"
              checked={form.sendInApp}
              onChange={onChange}
            />
            Send in-app notification
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#8C5A31] px-4 py-3 text-sm font-semibold text-[var(--color-primary-light)] shadow-[0_10px_20px_rgba(139,94,60,0.16)] disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatPage() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const normalizedSymbol = symbol?.toUpperCase() || ''
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.tokens?.access)

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [socketStatus, setSocketStatus] = useState('connecting')
  const [joinMeta, setJoinMeta] = useState(null)
  const [isFollowSubmitting, setIsFollowSubmitting] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false)
  const [roomAlerts, setRoomAlerts] = useState([])
  const [editingAlertId, setEditingAlertId] = useState(null)
  const [isDeletingAlertId, setIsDeletingAlertId] = useState(null)
  const [mentionSuggestions, setMentionSuggestions] = useState([])
  const [isMentionLoading, setIsMentionLoading] = useState(false)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [mentionContext, setMentionContext] = useState(null)
  const [alertForm, setAlertForm] = useState({
    triggerType: 'price_above',
    targetPrice: '',
    sendEmail: true,
    sendInApp: true,
  })
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const composerRef = useRef(null)

  const canSend = isAuthenticated && Boolean(accessToken) && draft.trim() && !isSending
  const hasSocketAccess = Boolean(normalizedSymbol && accessToken && isAuthenticated)
  const resolvedSocketStatus = hasSocketAccess
    ? socketStatus === 'live'
      ? 'live'
      : 'connecting'
    : 'offline'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!mentionContext?.token || !isAuthenticated) {
      setMentionSuggestions([])
      setIsMentionLoading(false)
      setActiveMentionIndex(0)
      return undefined
    }

    let isMounted = true

    setIsMentionLoading(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetchChatRoomSuggestions(mentionContext.token, 5)

        if (!isMounted) {
          return
        }

        setMentionSuggestions(response.results)
        setActiveMentionIndex(0)
      } catch {
        if (!isMounted) {
          return
        }

        setMentionSuggestions([])
      } finally {
        if (isMounted) {
          setIsMentionLoading(false)
        }
      }
    }, 180)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [isAuthenticated, mentionContext?.token])

  useEffect(() => {
    let isMounted = true

    async function loadRoom() {
      setIsLoading(true)
      setLoadError('')

      try {
        const [nextRoom, nextMessages] = await Promise.all([
          fetchChatRoom(normalizedSymbol),
          fetchChatRoomMessages(normalizedSymbol),
        ])

        if (!isMounted) {
          return
        }

        setRoom(nextRoom)
        setMessages(nextMessages)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setLoadError(
          loadError?.response?.status === 404
            ? 'This stock room is not available in the supported backend room list.'
            : 'Unable to load this chat room right now.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (normalizedSymbol) {
      loadRoom()
    }

    return () => {
      isMounted = false
    }
  }, [normalizedSymbol])

  useEffect(() => {
    let isMounted = true

    async function loadAlerts() {
      if (!isAuthenticated) {
        setRoomAlerts([])
        return
      }

      try {
        const response = await fetchStockAlerts()

        if (!isMounted) {
          return
        }

        setRoomAlerts(
          response.results.filter((alert) => alert.symbol === normalizedSymbol),
        )
      } catch {
        if (isMounted) {
          setRoomAlerts([])
        }
      }
    }

    if (normalizedSymbol) {
      loadAlerts()
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, normalizedSymbol])

  useEffect(() => {
    if (!hasSocketAccess) {
      return undefined
    }

    const socket = createChatSocket(normalizedSymbol, accessToken, {
      onOpen: () => {
        setSocketStatus('live')
      },
      onClose: () => {
        setSocketStatus('offline')
      },
      onError: () => {
        setSocketStatus('offline')
      },
      onJoined: (payload) => {
        setJoinMeta(payload)
      },
      onMessage: (message) => {
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current
          }

          return [...current, message]
        })
      },
    })

    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
      setSocketStatus('offline')
    }
  }, [accessToken, hasSocketAccess, normalizedSymbol])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canSend || mentionSuggestions.length) {
      return
    }

    setIsSending(true)
    setActionError('')

    try {
      const content = draft.trim()
      const sentOverSocket =
        resolvedSocketStatus === 'live' &&
        sendChatSocketMessage(socketRef.current, content)

      if (!sentOverSocket) {
        const message = await sendChatRoomMessage(normalizedSymbol, content)
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current
          }

          return [...current, message]
        })
      }

      setDraft('')
    } catch (sendError) {
      setActionError(
        sendError?.response?.status === 401
          ? 'You need to be logged in to send a message.'
          : 'Message could not be sent right now.',
      )
    } finally {
      setIsSending(false)
    }
  }

  function handleComposerKeyDown(event) {
    if (mentionSuggestions.length) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveMentionIndex((current) =>
          current + 1 >= mentionSuggestions.length ? 0 : current + 1,
        )
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveMentionIndex((current) =>
          current - 1 < 0 ? mentionSuggestions.length - 1 : current - 1,
        )
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        const activeSuggestion = mentionSuggestions[activeMentionIndex]

        if (activeSuggestion) {
          event.preventDefault()
          applyMentionSuggestion(activeSuggestion)
          return
        }
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setMentionSuggestions([])
        setMentionContext(null)
        setActiveMentionIndex(0)
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (!canSend) {
        return
      }

      handleSubmit(event)
    }
  }

  function syncMentionContext(target) {
    if (!target) {
      setMentionContext(null)
      return
    }

    const nextContext = getActiveStockToken(target.value, target.selectionStart)
    setMentionContext(nextContext)

    if (!nextContext) {
      setMentionSuggestions([])
      setActiveMentionIndex(0)
    }
  }

  function applyMentionSuggestion(suggestion) {
    if (!mentionContext || !composerRef.current) {
      return
    }

    const replacementToken = suggestion.token || `$${suggestion.symbol}`
    const nextDraft = `${draft.slice(0, mentionContext.start)}${replacementToken} ${draft.slice(mentionContext.end)}`
    const nextCaretPosition = mentionContext.start + replacementToken.length + 1

    setDraft(nextDraft)
    setMentionSuggestions([])
    setMentionContext(null)
    setActiveMentionIndex(0)

    window.requestAnimationFrame(() => {
      composerRef.current?.focus()
      composerRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition)
    })
  }

  async function handleFollowToggle() {
    if (!room?.symbol || isFollowSubmitting) {
      return
    }

    setIsFollowSubmitting(true)
    setActionError('')

    try {
      if (room.isFollowing) {
        await unfollowChatRoom(room.symbol)
        setRoom((current) => (current ? { ...current, isFollowing: false } : current))
        broadcastRoomFollowUpdate({
          symbol: room.symbol,
          isFollowing: false,
        })
      } else {
        await followChatRoom(room.symbol)
        setRoom((current) => (current ? { ...current, isFollowing: true } : current))
        broadcastRoomFollowUpdate({
          symbol: room.symbol,
          isFollowing: true,
        })
      }
    } catch (followError) {
      setActionError(
        getApiErrorMessage(followError, 'Follow state could not be updated right now.'),
      )
    } finally {
      setIsFollowSubmitting(false)
    }
  }

  function handleAlertFormChange(event) {
    const { checked, name, type, value } = event.target

    setAlertForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleAlertSubmit(event) {
    event.preventDefault()

    if (!alertForm.targetPrice.trim()) {
      setActionError('Enter a target price to create the alert.')
      return
    }

    setIsAlertSubmitting(true)
    setActionError('')

    try {
      const payload = {
        symbol: normalizedSymbol,
        trigger_type: alertForm.triggerType,
        target_price: alertForm.targetPrice,
        send_email: alertForm.sendEmail,
        send_in_app: alertForm.sendInApp,
      }
      const nextAlert = editingAlertId
        ? await updateStockAlert(editingAlertId, payload)
        : await createStockAlert(payload)

      setRoomAlerts((current) =>
        editingAlertId
          ? current.map((alert) =>
              alert.id === editingAlertId ? nextAlert : alert,
            )
          : [nextAlert, ...current],
      )
      setIsAlertModalOpen(false)
      setEditingAlertId(null)
      setAlertForm((current) => ({
        ...current,
        targetPrice: '',
        triggerType: 'price_above',
        sendEmail: true,
        sendInApp: true,
      }))
    } catch (alertError) {
      setActionError(
        getApiErrorMessage(
          alertError,
          editingAlertId
            ? 'Alert could not be updated right now.'
            : 'Alert could not be created right now.',
        ),
      )
    } finally {
      setIsAlertSubmitting(false)
    }
  }

  function handleOpenCreateAlert() {
    setEditingAlertId(null)
    setAlertForm({
      triggerType: 'price_above',
      targetPrice: '',
      sendEmail: true,
      sendInApp: true,
    })
    setIsAlertModalOpen(true)
  }

  function handleEditAlert(alert) {
    setEditingAlertId(alert.id)
    setAlertForm({
      triggerType: alert.triggerType,
      targetPrice: alert.targetPrice,
      sendEmail: alert.sendEmail,
      sendInApp: alert.sendInApp,
    })
    setIsAlertModalOpen(true)
  }

  async function handleDeleteAlert(alertId) {
    setIsDeletingAlertId(alertId)
    setActionError('')

    try {
      await deleteStockAlert(alertId)
      setRoomAlerts((current) => current.filter((alert) => alert.id !== alertId))
    } catch (deleteError) {
      setActionError(
        getApiErrorMessage(deleteError, 'Alert could not be deleted right now.'),
      )
    } finally {
      setIsDeletingAlertId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5ECDD]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <Link
          to="/chatrooms"
          className="ml-4 mt-4 w-fit rounded-full border border-[rgba(167,120,72,0.2)] bg-[rgba(255,250,243,0.86)] px-4 py-2 text-sm font-medium text-[var(--color-primary-deep)] transition hover:bg-[rgba(255,250,243,1)] sm:ml-6"
        >
          Back to chatrooms
        </Link>

        {isLoading ? (
          <section className="mx-4 my-4 rounded-[1.5rem] border border-[rgba(167,120,72,0.16)] bg-[rgba(255,249,241,0.86)] p-8 shadow-sm sm:mx-6">
            <div className="h-8 w-40 animate-pulse rounded-full bg-[rgba(139,94,60,0.12)]" />
            <div className="mt-4 h-20 animate-pulse rounded-[1.2rem] bg-[rgba(245,230,211,0.72)]" />
          </section>
        ) : loadError ? (
          <section className="mx-4 my-4 rounded-[1.5rem] border border-dashed border-[rgba(167,120,72,0.28)] bg-[rgba(255,249,241,0.86)] px-6 py-12 text-center shadow-sm sm:mx-6">
            <p className="text-xl font-semibold text-[var(--color-primary-deep)]">
              Chat room unavailable
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {loadError}
            </p>
          </section>
        ) : (
          <section className="mt-4 flex min-h-0 flex-1 flex-col border-y border-[rgba(167,120,72,0.16)] bg-[#F5ECDD]">
            <div className="border-b border-[rgba(167,120,72,0.16)] bg-[rgba(247,239,227,0.72)] px-4 py-4 backdrop-blur-sm sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {normalizedSymbol} room
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-[var(--color-primary-deep)]">
                    {room?.name || normalizedSymbol}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {room?.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    disabled={isFollowSubmitting}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(167,120,72,0.18)] bg-[rgba(255,250,243,0.92)] px-4 py-2 text-xs font-semibold text-[var(--color-primary-deep)] transition hover:bg-[rgba(255,246,236,1)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {isFollowSubmitting
                      ? 'Saving...'
                      : room?.isFollowing
                        ? 'Following'
                        : 'Follow'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateAlert}
                    className="inline-flex items-center gap-2 rounded-full bg-[#8C5A31] px-4 py-2 text-xs font-semibold text-[var(--color-primary-light)] shadow-[0_4px_12px_rgba(139,94,60,0.16)] transition hover:brightness-105"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 21a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {roomAlerts.length ? `Alerts (${roomAlerts.length})` : 'Alert'}
                  </button>
                </div>
              </div>
            </div>

              <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                <div className="mx-auto max-w-4xl">
                  {roomAlerts.length ? (
                    <div className="mb-5 rounded-[1.4rem] border border-[rgba(167,120,72,0.16)] bg-[rgba(255,250,243,0.68)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                            Active alerts
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            Existing price rules for {normalizedSymbol}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenCreateAlert}
                          className="rounded-full border border-[rgba(167,120,72,0.16)] bg-[rgba(255,250,243,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                        >
                          New alert
                        </button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {roomAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="rounded-[1.1rem] border border-[rgba(167,120,72,0.14)] bg-[rgba(255,250,243,0.86)] px-4 py-3"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                                    {alert.triggerType === 'price_below' ? 'Price below' : 'Price above'} {alert.targetPrice}
                                  </p>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                    alert.isTriggered
                                      ? 'bg-[rgba(191,91,58,0.16)] text-[#A7492C]'
                                      : alert.isActive
                                        ? 'bg-[rgba(142,196,96,0.18)] text-[#4E8A2B]'
                                        : 'bg-[rgba(139,94,60,0.08)] text-[var(--color-text-muted)]'
                                  }`}>
                                    {alert.isTriggered ? 'Triggered' : alert.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                  {alert.sendEmail ? 'Email on' : 'Email off'} • {alert.sendInApp ? 'In-app on' : 'In-app off'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditAlert(alert)}
                                  className="rounded-full border border-[rgba(167,120,72,0.16)] bg-[rgba(255,250,243,0.92)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  disabled={isDeletingAlertId === alert.id}
                                  className="rounded-full bg-[rgba(139,94,60,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-deep)]"
                                >
                                  {isDeletingAlertId === alert.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messages.length ? (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const senderName =
                          getUserDisplayName(message.sender) ||
                          message.sender?.displayName ||
                          'Unknown user'
                        const senderAvatarUrl = getUserAvatarUrl(message.sender)
                        const senderId = message.sender?.id
                        const isOwnMessage = user?.id && senderId === user.id

                        return (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwnMessage ? (
                              <Avatar
                                avatarUrl={senderAvatarUrl}
                                displayName={senderName}
                                size="xs"
                                className="mt-0.5 rounded-full border border-[rgba(167,120,72,0.18)]"
                                fallbackClassName="bg-[rgba(214,175,132,0.46)] text-[10px] text-[var(--color-primary-deep)]"
                              />
                            ) : null}

                            <div className={`flex max-w-[86%] flex-col sm:max-w-[72%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                              <div className={`mb-1 flex items-center gap-2 px-1 text-[10px] text-[var(--color-primary-deep)] ${isOwnMessage ? 'justify-end' : ''}`}>
                                <span className="font-medium">
                                  {isOwnMessage ? 'You' : senderName}
                                </span>
                                <span className="text-[rgba(106,74,46,0.78)]">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>

                              <article
                                className={`rounded-[1rem] border px-4 py-2.5 text-sm leading-6 shadow-[0_2px_10px_rgba(139,94,60,0.06)] ${
                                  isOwnMessage
                                    ? 'rounded-br-[0.45rem] border-[rgba(126,78,39,0.5)] bg-[#8C5A31] text-[#FFF7EB]'
                                    : 'rounded-bl-[0.45rem] border-[rgba(186,147,105,0.48)] bg-[rgba(255,250,243,0.96)] text-[var(--color-primary-deep)]'
                                }`}
                              >
                                {renderMessageContent(
                                  message.content,
                                  message.stockReferences,
                                  isOwnMessage,
                                  navigate,
                                )}
                              </article>
                            </div>

                            {isOwnMessage ? (
                              <Avatar
                                avatarUrl={getUserAvatarUrl(user)}
                                displayName={getUserDisplayName(user) || 'You'}
                                size="xs"
                                className="mt-0.5 rounded-full"
                                fallbackClassName="bg-[#8C5A31] text-[10px] text-[var(--color-primary-light)]"
                              />
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-[20rem] items-center justify-center rounded-[1.4rem] border border-dashed border-[rgba(167,120,72,0.28)] bg-[rgba(255,250,243,0.55)] px-6 py-12 text-center">
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                          No messages yet
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                          Be the first one to start the conversation in this stock room.
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-[rgba(167,120,72,0.16)] bg-[rgba(247,239,227,0.82)] px-4 py-3 sm:px-6">
                <div className="mx-auto max-w-4xl">
                  {actionError ? (
                    <div className="mb-2 rounded-2xl border border-[rgba(167,120,72,0.18)] bg-[rgba(255,250,243,0.88)] px-3 py-2 text-xs text-[var(--color-primary-deep)]">
                      {actionError}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 px-1 text-[10px] text-[var(--color-text-muted)]">
                    <span>{room?.participants ? `${room.participants} online` : 'New room'}</span>
                    <span>Mention stocks with $SYMBOL</span>
                  </div>

                  {!isAuthenticated ? (
                    <div className="mt-2 rounded-[1rem] border border-dashed border-[rgba(167,120,72,0.28)] bg-[rgba(255,250,243,0.84)] px-3 py-2.5 text-xs text-[var(--color-text-muted)]">
                      Log in to join the conversation. Reading is fine, but sending messages is disabled until you are authenticated.
                    </div>
                  ) : null}

                  <form className="mt-2" onSubmit={handleSubmit}>
                    <div className="flex items-end gap-2">
                      <div className="relative flex-1">
                        {mentionSuggestions.length || isMentionLoading ? (
                          <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-[1.2rem] border border-[rgba(167,120,72,0.16)] bg-[rgba(255,250,243,0.98)] shadow-[0_12px_30px_rgba(139,94,60,0.12)]">
                            <div className="border-b border-[rgba(167,120,72,0.12)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                              {isMentionLoading ? 'Finding rooms' : 'Suggested rooms'}
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2">
                              {mentionSuggestions.length ? (
                                mentionSuggestions.map((suggestion, index) => (
                                  <button
                                    key={`${suggestion.symbol}-${suggestion.token}`}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => applyMentionSuggestion(suggestion)}
                                    className={`flex w-full items-center justify-between rounded-[1rem] px-3 py-2.5 text-left transition ${
                                      index === activeMentionIndex
                                        ? 'bg-[rgba(245,230,211,0.88)]'
                                        : 'hover:bg-[rgba(245,230,211,0.56)]'
                                    }`}
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                                        {suggestion.token}
                                      </p>
                                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                        {suggestion.name || suggestion.symbol}
                                      </p>
                                    </div>
                                    {suggestion.isFollowing ? (
                                      <span className="rounded-full border border-[rgba(139,94,60,0.14)] bg-[rgba(255,250,243,0.9)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-deep)]">
                                        Following
                                      </span>
                                    ) : null}
                                  </button>
                                ))
                              ) : (
                                !isMentionLoading ? (
                                  <div className="px-3 py-3 text-sm text-[var(--color-text-muted)]">
                                    No matching stock rooms.
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-full border border-[rgba(186,147,105,0.5)] bg-[rgba(255,250,243,0.96)] px-4 py-2 shadow-[0_2px_10px_rgba(139,94,60,0.05)]">
                        <textarea
                          ref={composerRef}
                          rows="1"
                          value={draft}
                          onChange={(event) => {
                            setDraft(event.target.value)
                            syncMentionContext(event.target)
                          }}
                          onKeyDown={handleComposerKeyDown}
                          onClick={(event) => syncMentionContext(event.target)}
                          onKeyUp={(event) => syncMentionContext(event.target)}
                          placeholder={
                            isAuthenticated
                              ? 'Share your take...'
                              : 'Message input disabled while signed out'
                          }
                          disabled={!isAuthenticated || isSending}
                          className="max-h-20 min-h-[1.35rem] w-full resize-none border-0 bg-transparent py-1 text-sm leading-5 text-[var(--color-primary-deep)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!canSend || mentionSuggestions.length > 0}
                        aria-label="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8C5A31] text-[var(--color-primary-light)] shadow-[0_4px_12px_rgba(139,94,60,0.16)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSending ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 12 20 4 14 20 11 13 4 12Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>

                  {joinMeta?.user?.display_name ? (
                    <p className="mt-2 px-1 text-[10px] text-[var(--color-text-muted)]">
                      Joined as {joinMeta.user.display_name}.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <AlertModal
        isOpen={isAlertModalOpen}
        form={alertForm}
        isSubmitting={isAlertSubmitting}
        onClose={() => {
          setIsAlertModalOpen(false)
          setEditingAlertId(null)
        }}
        onSubmit={handleAlertSubmit}
        onChange={handleAlertFormChange}
        symbol={normalizedSymbol}
        submitLabel={editingAlertId ? 'Save alert' : 'Create alert'}
        title={editingAlertId ? 'Edit alert' : 'Create alert'}
      />
    </main>
  )
}

export default ChatPage

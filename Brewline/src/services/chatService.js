import api from '../lib/api'

const CHAT_BASE = '/v1/chat'

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

function normalizeRoom(room) {
  return {
    id: room.id,
    symbol: room.symbol || room.stock_symbol || room.name || 'UNKNOWN',
    name: room.name || room.symbol || room.stock_symbol || 'Unknown Room',
    description:
      room.description ||
      room.summary ||
      'Live market conversation for this stock room.',
    isLive: room.is_live ?? room.live ?? true,
    messageCount:
      room.message_count ?? room.messages_count ?? room.total_messages ?? 0,
    participants:
      room.participants_count ?? room.active_users ?? room.member_count ?? 0,
    isFollowing: Boolean(room.is_following),
    lastMessageAt: room.last_message_at || null,
    createdAt: room.created_at || null,
    updatedAt: room.updated_at || null,
  }
}

function normalizeRoomSuggestion(room) {
  return {
    symbol: room?.symbol || '',
    token: room?.token || '',
    name: room?.name || room?.symbol || '',
    isFollowing: Boolean(room?.is_following),
    roomApiPath: room?.room_api_path || '',
    messagesApiPath: room?.messages_api_path || '',
    websocketPath: room?.websocket_path || '',
  }
}

function normalizeMessage(message) {
  const sender = message.sender || message.user || {}
  const stockReferences = Array.isArray(message.stock_references)
    ? message.stock_references
        .map((reference) => ({
          symbol: reference?.symbol || '',
          token: reference?.token || '',
          start: Number(reference?.start ?? -1),
          end: Number(reference?.end ?? -1),
          roomApiPath: reference?.room_api_path || '',
          messagesApiPath: reference?.messages_api_path || '',
          websocketPath: reference?.websocket_path || '',
        }))
        .filter((reference) =>
          reference.symbol &&
          reference.token &&
          Number.isInteger(reference.start) &&
          Number.isInteger(reference.end) &&
          reference.start >= 0 &&
          reference.end > reference.start,
        )
    : []

  return {
    id: message.id,
    room: message.room,
    roomSymbol: message.room_symbol || null,
    content: message.content || '',
    stockReferences,
    createdAt: message.created_at || message.timestamp || new Date().toISOString(),
    updatedAt: message.updated_at || null,
    sender: {
      id: sender.id ?? null,
      username: sender.username || '',
      display_name: sender.display_name || '',
      first_name: sender.first_name || '',
      last_name: sender.last_name || '',
      avatar_style: sender.avatar_style || 'initials',
      avatar_seed: sender.avatar_seed || '',
      avatar_url: sender.avatar_url || '',
      displayName:
        sender.display_name ||
        sender.username ||
        'Unknown user',
    },
  }
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
}

function getSocketBaseUrl() {
  const apiBase = getApiBaseUrl()

  try {
    const url = new URL(apiBase)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = '/'
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return 'ws://localhost:8000'
  }
}

export async function fetchChatRooms() {
  const { data } = await api.get(`${CHAT_BASE}/rooms/`)
  return {
    count: data?.count ?? 0,
    followedCount: data?.followed_count ?? 0,
    followedChatrooms: toArray(data?.followed_chatrooms).map(normalizeRoom),
    chatrooms: toArray(data?.chatrooms).map(normalizeRoom),
    results: toArray(data).map(normalizeRoom),
  }
}

export async function fetchChatRoom(symbol) {
  const { data } = await api.get(`${CHAT_BASE}/rooms/${symbol}/`)
  return normalizeRoom(data)
}

export async function fetchChatRoomSuggestions(query, limit = 5) {
  const { data } = await api.get(`${CHAT_BASE}/rooms/suggestions/`, {
    params: {
      q: query,
      limit,
    },
  })

  return {
    query: data?.query || '',
    count: data?.count ?? 0,
    results: toArray(data).map(normalizeRoomSuggestion),
  }
}

export async function fetchChatRoomMessages(symbol, limit = 50) {
  const { data } = await api.get(`${CHAT_BASE}/rooms/${symbol}/messages/`, {
    params: { limit },
  })

  return toArray(data).map(normalizeMessage)
}

export async function sendChatRoomMessage(symbol, content) {
  const { data } = await api.post(`${CHAT_BASE}/rooms/${symbol}/messages/`, {
    content,
  })

  return normalizeMessage(data)
}

export async function followChatRoom(symbol) {
  const { data } = await api.post(`${CHAT_BASE}/rooms/${symbol}/follow/`)
  return {
    symbol: data.symbol || symbol,
    isFollowing: Boolean(data.is_following),
    followedAt: data.followed_at || null,
  }
}

export async function unfollowChatRoom(symbol) {
  const { data } = await api.delete(`${CHAT_BASE}/rooms/${symbol}/follow/`)
  return {
    symbol: data?.symbol || symbol,
    isFollowing: Boolean(data?.is_following),
  }
}

export function createChatSocket(symbol, accessToken, handlers = {}) {
  const wsBase = getSocketBaseUrl()
  const wsUrl = `${wsBase}/ws/chat/${encodeURIComponent(symbol)}/?token=${encodeURIComponent(accessToken)}`
  const socket = new WebSocket(wsUrl)

  socket.onmessage = (event) => {
    let payload

    try {
      payload = JSON.parse(event.data)
    } catch {
      return
    }

    if (payload?.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong' }))
      return
    }

    if (payload?.type === 'message.created' && payload.message) {
      handlers.onMessage?.(normalizeMessage(payload.message))
      return
    }

    if (payload?.type === 'chat.joined') {
      handlers.onJoined?.(payload)
      return
    }

    handlers.onEvent?.(payload)
  }

  if (handlers.onOpen) {
    socket.onopen = handlers.onOpen
  }

  if (handlers.onClose) {
    socket.onclose = handlers.onClose
  }

  if (handlers.onError) {
    socket.onerror = handlers.onError
  }

  return socket
}

export function sendChatSocketMessage(socket, content) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false
  }

  socket.send(
    JSON.stringify({
      type: 'message.send',
      content,
    }),
  )

  return true
}

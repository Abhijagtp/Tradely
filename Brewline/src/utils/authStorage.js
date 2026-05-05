const TOKENS_KEY = 'brewline.auth.tokens'
const USER_KEY = 'brewline.auth.user'

export function storeSession(tokens, user) {
  if (tokens?.access || tokens?.refresh) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } else {
    localStorage.removeItem(TOKENS_KEY)
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function getStoredTokens() {
  const raw = localStorage.getItem(TOKENS_KEY)

  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw)
  return parsed?.access || parsed?.refresh ? parsed : null
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearStoredSession() {
  localStorage.removeItem(TOKENS_KEY)
  localStorage.removeItem(USER_KEY)
}

import {
  clearStoredSession,
  getStoredTokens,
  getStoredUser,
  storeSession,
} from './authStorage'

let currentTokens = getStoredTokens()
let currentUser = getStoredUser()

const listeners = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function getSessionTokens() {
  return currentTokens
}

export function getSessionUser() {
  return currentUser
}

export function getSessionSnapshot() {
  return {
    tokens: currentTokens,
    user: currentUser,
  }
}

export function hydrateSessionState() {
  currentTokens = getStoredTokens()
  currentUser = getStoredUser()
  notifyListeners()

  return getSessionSnapshot()
}

export function setSessionState(tokens, user) {
  currentTokens = tokens?.access || tokens?.refresh ? tokens : null
  currentUser = user || null
  storeSession(currentTokens, currentUser)
  notifyListeners()
}

export function updateSessionTokens(tokens) {
  currentTokens = tokens?.access || tokens?.refresh ? tokens : null
  storeSession(currentTokens, currentUser)
  notifyListeners()
}

export function clearSessionState() {
  currentTokens = null
  currentUser = null
  clearStoredSession()
  notifyListeners()
}

export function subscribeToSessionState(listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

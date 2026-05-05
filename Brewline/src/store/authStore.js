import { create } from 'zustand'
import { fetchCurrentUser, logoutUser } from '../services/authService'
import {
  clearSessionState,
  getSessionSnapshot,
  hydrateSessionState,
  setSessionState,
  subscribeToSessionState,
} from '../utils/sessionState'

export const useAuthStore = create((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => {
    const { tokens } = getSessionSnapshot()
    setSessionState(tokens, user)
    set({ user })
  },

  hydrate: async () => {
    const { tokens, user } = hydrateSessionState()

    if (!tokens?.access) {
      set({ isHydrated: true })
      return
    }

    set({
      tokens,
      user,
      isAuthenticated: true,
      isHydrated: true,
    })

    if (!user) {
      try {
        const profile = await fetchCurrentUser()
        setSessionState(tokens, profile)
      } catch {
        clearSessionState()
      }
    }
  },

  setSession: async ({ access, refresh, user }) => {
    const tokens = access || refresh ? { access, refresh } : null
    let profile = user

    setSessionState(tokens, profile)
    set({
      tokens,
      user: profile,
      isAuthenticated: Boolean(tokens?.access),
      isHydrated: true,
    })

    if (!tokens?.access) {
      return
    }

    if (!profile) {
      try {
        profile = await fetchCurrentUser()
        setSessionState(tokens, profile)
      } catch {
        clearSessionState()
      }
    }
  },

  logout: async () => {
    try {
      await logoutUser()
    } catch {
      // Clear the local session even if the backend logout fails.
    }

    clearSessionState()
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: true,
    })
  },
}))

const syncSessionFromStorage = () => {
  const { tokens, user } = getSessionSnapshot()

  useAuthStore.setState({
    tokens,
    user,
    isAuthenticated: Boolean(tokens?.access),
    isHydrated: true,
  })
}

subscribeToSessionState(syncSessionFromStorage)

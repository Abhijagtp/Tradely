import axios from 'axios'
import {
  clearSessionState,
  getSessionTokens,
  getSessionUser,
  updateSessionTokens,
} from '../utils/sessionState'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

async function refreshAccessToken() {
  const tokens = getSessionTokens()
  const { data } = await refreshClient.post('/v1/auth/refresh/', {})

  const nextTokens = {
    access: data.access || data.access_token,
    refresh: tokens?.refresh || null,
  }

  updateSessionTokens(nextTokens, getSessionUser())
  return nextTokens
}

api.interceptors.request.use((config) => {
  const tokens = getSessionTokens()

  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/v1/auth/refresh/')

    if (!isUnauthorized || isRefreshRequest || originalRequest?._retry) {
      if (isUnauthorized && isRefreshRequest) {
        clearSessionState()
      }

      return Promise.reject(error)
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const nextTokens = await refreshPromise
      originalRequest._retry = true
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextTokens.access}`,
      }

      return api(originalRequest)
    } catch (refreshError) {
      clearSessionState()
      return Promise.reject(refreshError)
    }
  },
)

export default api

import api from '../lib/api'
import { fetchMyProfile } from './profileService'
import { normalizeUserProfile } from '../utils/userProfile'

const AUTH_BASE = '/v1/auth'

function extractTokens(payload) {
  if (!payload || typeof payload !== 'object') {
    return { access: null, refresh: null }
  }

  const candidates = [payload, payload.data, payload.tokens, payload.data?.tokens]

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') {
      continue
    }

    const access = candidate.access || candidate.access_token || candidate.token
    const refresh = candidate.refresh || candidate.refresh_token

    if (access || refresh) {
      return {
        access: access || null,
        refresh: refresh || null,
      }
    }
  }

  return { access: null, refresh: null }
}

function buildUsername(formData) {
  const emailPrefix = formData.email.split('@')[0]?.trim()
  const fullNameSlug = formData.fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return fullNameSlug || emailPrefix || `user_${Date.now()}`
}

export async function registerUser(formData) {
  const payload = {
    username: buildUsername(formData),
    full_name: formData.fullName,
    email: formData.email,
    password: formData.password,
    password_confirm: formData.confirmPassword,
  }

  const { data } = await api.post(`${AUTH_BASE}/register/`, payload)
  return data
}

export async function loginUser(formData) {
  const payload = {
    email: formData.email,
    password: formData.password,
  }

  const { data } = await api.post(`${AUTH_BASE}/login/`, payload)
  const tokens = extractTokens(data)

  return {
    access: tokens.access,
    refresh: tokens.refresh,
    user: normalizeUserProfile(data.user || data.data?.user || null),
  }
}

export async function fetchCurrentUser() {
  return fetchMyProfile()
}

export async function logoutUser() {
  await api.post(`${AUTH_BASE}/logout/`, {})
}

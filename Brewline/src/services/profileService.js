import api from '../lib/api'
import { normalizeUserProfile } from '../utils/userProfile'

const PROFILE_BASE = '/v1/profile'

export async function fetchMyProfile() {
  const { data } = await api.get(`${PROFILE_BASE}/me/`)
  return normalizeUserProfile(data)
}

export async function updateMyProfile(payload) {
  const { data } = await api.patch(`${PROFILE_BASE}/me/`, payload)
  return normalizeUserProfile(data)
}

const DEFAULT_AVATAR_STYLE = 'adventurer-neutral'

export function buildFullName(profile) {
  const firstName = profile?.first_name?.trim() || ''
  const lastName = profile?.last_name?.trim() || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  if (fullName) {
    return fullName
  }

  if (profile?.full_name?.trim()) {
    return profile.full_name.trim()
  }

  return ''
}

export function getInitialsFromDisplayName(displayName) {
  const label = displayName || 'BR'

  return label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getUserInitials(profile) {
  return getInitialsFromDisplayName(getUserDisplayName(profile))
}

export function getUserDisplayName(profile) {
  const displayName = profile?.display_name?.trim()
  const fullName = buildFullName(profile)

  return displayName || fullName || profile?.username || profile?.email || ''
}

export function buildAvatarUrl(style, seed) {
  if (!style || !seed) {
    return ''
  }

  return `https://api.dicebear.com/9.x/${encodeURIComponent(style)}/svg?seed=${encodeURIComponent(seed)}`
}

export function getUserAvatarUrl(profile) {
  return profile?.avatar_url || buildAvatarUrl(profile?.avatar_style, profile?.avatar_seed)
}

export function getAvatarSeedBase(profile) {
  return (
    profile?.username ||
    profile?.email?.split('@')[0] ||
    profile?.display_name?.trim() ||
    'brewline-user'
  )
}

export function buildAvatarPickerOptions(profile, avatarStyle = DEFAULT_AVATAR_STYLE, count = 10) {
  const baseSeed = getAvatarSeedBase(profile)

  return Array.from({ length: count }, (_, index) => {
    const seed = `${baseSeed}-${index + 1}`

    return {
      id: `${avatarStyle}:${seed}`,
      style: avatarStyle,
      seed,
      avatarUrl: buildAvatarUrl(avatarStyle, seed),
    }
  })
}

export function normalizeUserProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return null
  }

  const normalizedProfile = {
    ...profile,
    display_name: profile.display_name || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    avatar_style: profile.avatar_style || DEFAULT_AVATAR_STYLE,
    avatar_seed: profile.avatar_seed || '',
    avatar_url: profile.avatar_url || buildAvatarUrl(profile.avatar_style || DEFAULT_AVATAR_STYLE, profile.avatar_seed || ''),
  }

  const fullName = buildFullName(normalizedProfile)

  return {
    ...normalizedProfile,
    full_name: fullName,
    displayName: getUserDisplayName(normalizedProfile),
    initials: getUserInitials(normalizedProfile),
  }
}

import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { getInitialsFromDisplayName } from '../../utils/userProfile'

const sizeClasses = {
  xs: 'h-8 w-8 text-[10px]',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl',
}

function Avatar({
  avatarUrl,
  className,
  displayName,
  fallbackClassName,
  imageClassName,
  size = 'md',
}) {
  const initials = getInitialsFromDisplayName(displayName)
  const resolvedSizeClass = sizeClasses[size] || sizeClasses.md
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [avatarUrl])

  if (avatarUrl && !hasImageError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ? `${displayName} avatar` : 'User avatar'}
        onError={() => setHasImageError(true)}
        className={clsx('shrink-0 object-cover', resolvedSizeClass, className, imageClassName)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center font-semibold',
        resolvedSizeClass,
        className,
        fallbackClassName,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export default Avatar

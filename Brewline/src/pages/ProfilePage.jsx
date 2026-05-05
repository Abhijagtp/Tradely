import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import AvatarPicker from '../components/ui/AvatarPicker'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { fetchMyProfile, updateMyProfile } from '../services/profileService'
import { useAuthStore } from '../store/authStore'
import {
  buildAvatarPickerOptions,
  buildAvatarUrl,
  buildFullName,
  getAvatarSeedBase,
  getUserAvatarUrl,
  getUserDisplayName,
} from '../utils/userProfile'

const DEFAULT_PICKER_STYLE = 'adventurer-neutral'
const AVATAR_OPTION_COUNT = 10
const EDITABLE_FIELDS = ['display_name', 'first_name', 'last_name', 'avatar_style', 'avatar_seed']
const AVATAR_STYLE_OPTIONS = [
  'initials',
  'adventurer-neutral',
  'bottts-neutral',
  'shapes',
  'icons',
]

function FieldCard({ label, value, hint }) {
  return (
    <div className="rounded-[1.35rem] border border-[rgba(117,73,42,0.12)] bg-[rgba(255,248,240,0.72)] p-4 shadow-[0_10px_30px_rgba(139,94,60,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-primary-deep)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function AvatarStyleCard({ description, isActive, name, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      className={clsx(
        'rounded-[1.35rem] border p-4 text-left transition duration-200',
        isActive
          ? 'border-[rgba(117,73,42,0.42)] bg-[linear-gradient(180deg,rgba(255,248,240,0.98)_0%,rgba(240,222,199,0.92)_100%)] shadow-[0_16px_34px_rgba(139,94,60,0.14)]'
          : 'border-[rgba(117,73,42,0.12)] bg-[rgba(255,248,240,0.74)] shadow-[0_10px_24px_rgba(139,94,60,0.05)] hover:-translate-y-0.5 hover:border-[rgba(117,73,42,0.24)] hover:shadow-[0_14px_28px_rgba(139,94,60,0.10)]',
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--color-primary-deep)]">
          {name}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
    </button>
  )
}

function StatusMessage({ tone, message }) {
  if (!message) {
    return null
  }

  return (
    <p
      className={clsx(
        'rounded-[1.2rem] border px-4 py-3 text-sm',
        tone === 'error'
          ? 'border-[rgba(167,120,72,0.18)] bg-[rgba(255,244,238,0.88)] text-[var(--color-primary-deep)]'
          : 'border-[rgba(167,120,72,0.18)] bg-[rgba(245,250,241,0.88)] text-[var(--color-primary-deep)]',
      )}
    >
      {message}
    </p>
  )
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

function getFormState(user) {
  return {
    display_name: user?.display_name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    avatar_style: user?.avatar_style || DEFAULT_PICKER_STYLE,
    avatar_seed: user?.avatar_seed || '',
  }
}

function getAvatarStyleDescription(style) {
  switch (style) {
    case 'initials':
      return 'Minimal and typography-led.'
    case 'adventurer-neutral':
      return 'Friendly illustrated portraits.'
    case 'bottts-neutral':
      return 'Clean robotic personality.'
    case 'shapes':
      return 'Abstract geometric composition.'
    case 'icons':
      return 'Graphic badge-style marks.'
    default:
      return 'Profile avatar option.'
  }
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const [form, setForm] = useState(() => getFormState(user))
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setForm(getFormState(user))
  }, [user])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsProfileLoading(true)
      setErrorMessage('')

      try {
        const profile = await fetchMyProfile()

        if (!isMounted) {
          return
        }

        setUser(profile)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, 'Profile could not be loaded right now.'))
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [setUser])

  const userDisplayName = getUserDisplayName(user) || 'Tradely User'
  const fullName = buildFullName(user) || 'Not added yet'
  const hasChanges = EDITABLE_FIELDS.some((field) => (form[field] || '') !== (user?.[field] || ''))
  const pickerStyle = form.avatar_style || DEFAULT_PICKER_STYLE
  const avatarSeedBase = getAvatarSeedBase(user)
  const avatarOptions = buildAvatarPickerOptions(user, pickerStyle, AVATAR_OPTION_COUNT)
  const activeSeed = form.avatar_seed || user?.avatar_seed || `${avatarSeedBase}-1`
  const hasMatchingGeneratedOption = avatarOptions.some((option) => option.seed === activeSeed)
  const pickerOptions = hasMatchingGeneratedOption
    ? avatarOptions
    : [
        {
          id: `custom:${pickerStyle}:${activeSeed}`,
          label: 'Current',
          style: pickerStyle,
          seed: activeSeed,
          avatarUrl: buildAvatarUrl(pickerStyle, activeSeed),
        },
        ...avatarOptions,
      ]
  const previewAvatarUrl =
    buildAvatarUrl(
      pickerStyle,
      activeSeed,
    ) || getUserAvatarUrl(user)
  const joinedDate = user?.created_at
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(user.created_at))
    : 'Recently joined'

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleAvatarStyleSelect(style) {
    setForm((current) => ({
      ...current,
      avatar_style: style,
    }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleAvatarOptionSelect(option) {
    setForm((current) => ({
      ...current,
      avatar_style: option.style,
      avatar_seed: option.seed,
    }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hasChanges) {
      setSuccessMessage('No changes to save.')
      return
    }

    const payload = EDITABLE_FIELDS.reduce((nextPayload, field) => {
      const nextValue = form[field].trim()
      const currentValue = user?.[field] || ''

      if (nextValue !== currentValue) {
        nextPayload[field] = nextValue
      }

      return nextPayload
    }, {})

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const updatedProfile = await updateMyProfile(payload)
      setUser(updatedProfile)
      setSuccessMessage('Profile updated.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Profile could not be updated right now.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isProfileLoading) {
    return (
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,247,235,0.94),_rgba(245,230,211,0.82)_28%,_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(180,128,84,0.16),_transparent_32%),linear-gradient(180deg,#F8ECDC_0%,#F3E1CB_42%,#EACFB1_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse rounded-[2rem] border border-[rgba(117,73,42,0.10)] bg-[rgba(255,250,245,0.72)] p-8 shadow-[0_24px_64px_rgba(139,94,60,0.10)]">
            <div className="h-4 w-32 rounded-full bg-[rgba(139,94,60,0.10)]" />
            <div className="mt-4 h-12 max-w-2xl rounded-[1rem] bg-[rgba(139,94,60,0.10)]" />
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
              <div className="h-80 rounded-[1.8rem] bg-[rgba(139,94,60,0.08)]" />
              <div className="h-[34rem] rounded-[1.9rem] bg-[rgba(139,94,60,0.08)]" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,247,235,0.94),_rgba(245,230,211,0.82)_28%,_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(180,128,84,0.16),_transparent_32%),linear-gradient(180deg,#F8ECDC_0%,#F3E1CB_42%,#EACFB1_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(117,73,42,0.14)] bg-[linear-gradient(135deg,rgba(255,248,240,0.96)_0%,rgba(240,222,199,0.88)_45%,rgba(229,200,169,0.92)_100%)] p-6 shadow-[0_30px_90px_rgba(139,94,60,0.14)] sm:p-8">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[rgba(255,255,255,0.24)] blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[rgba(139,94,60,0.08)] blur-2xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                Profile Studio
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--color-primary-deep)] sm:text-4xl">
                Shape a profile that feels polished, recognizable, and unmistakably yours.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                Update your public identity, refine how your name appears across Tradely, and tune your avatar into something that feels premium instead of placeholder.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-[rgba(117,73,42,0.14)] bg-[rgba(255,251,246,0.72)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                  Live preview
                </div>
                <div className="rounded-full border border-[rgba(117,73,42,0.14)] bg-[rgba(255,251,246,0.72)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                  Read-only account core
                </div>
                <div className="rounded-full border border-[rgba(117,73,42,0.14)] bg-[rgba(255,251,246,0.72)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                  Premium avatar styles
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[rgba(117,73,42,0.14)] bg-[rgba(255,250,245,0.72)] p-5 shadow-[0_18px_50px_rgba(139,94,60,0.10)] backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Avatar
                  avatarUrl={previewAvatarUrl}
                  displayName={form.display_name.trim() || userDisplayName}
                  size="xl"
                  className="rounded-[1.5rem] border border-[rgba(117,73,42,0.18)]"
                  fallbackClassName="bg-[var(--color-primary-soft)] text-xl text-[var(--color-primary-deep)]"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Live identity card
                  </p>
                  <p className="mt-2 truncate text-xl font-semibold text-[var(--color-primary-deep)]">
                    {form.display_name.trim() || userDisplayName}
                  </p>
                  <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                    @{user?.username || 'tradely-user'}
                  </p>
                  <p className="mt-2 truncate text-xs text-[var(--color-text-muted)]">
                    DiceBear {pickerStyle} with seed {activeSeed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <aside className="space-y-6">
            <div className="rounded-[1.8rem] border border-[rgba(117,73,42,0.12)] bg-[rgba(255,250,245,0.78)] p-6 shadow-[0_20px_50px_rgba(139,94,60,0.08)] backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Avatar
                  avatarUrl={getUserAvatarUrl(user)}
                  displayName={userDisplayName}
                  size="lg"
                  className="h-[4.75rem] w-[4.75rem] rounded-[1.4rem] border border-[rgba(117,73,42,0.16)] text-xl"
                  fallbackClassName="bg-[var(--color-primary-soft)] text-xl text-[var(--color-primary-deep)]"
                />
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold text-[var(--color-primary-deep)]">
                    {userDisplayName}
                  </p>
                  <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                    {user?.email || 'team@tradely.app'}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Member since {joinedDate}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <FieldCard
                  label="Display Name"
                  value={userDisplayName}
                  hint="Shown across profile surfaces and navigation."
                />
                <FieldCard
                  label="Full Name"
                  value={fullName}
                  hint="Built from your first and last name."
                />
                <FieldCard
                  label="Username"
                  value={user?.username || 'Not available'}
                  hint="Locked here and used as a stable account handle."
                />
                <FieldCard
                  label="Avatar Setup"
                  value={user?.avatar_style || 'initials'}
                  hint={user?.avatar_seed || 'No custom seed saved yet.'}
                />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[rgba(117,73,42,0.12)] bg-[rgba(106,67,39,0.94)] p-6 text-[var(--color-primary-light)] shadow-[0_24px_60px_rgba(93,60,37,0.22)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,243,230,0.72)]">
                Account core
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                Your login identity stays protected while your public profile stays flexible.
              </p>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[rgba(255,243,230,0.78)]">
                <p>Username and email remain read-only on this screen.</p>
                <p>Only changed fields are sent when you save.</p>
                <p>Avatar choice updates immediately in the preview, but the backend response remains the source of truth.</p>
              </div>
              <div className="mt-6">
                <Button type="button" variant="secondary" onClick={logout} className="border-[rgba(255,243,230,0.18)] bg-[rgba(255,248,240,0.08)] text-[var(--color-primary-light)] hover:bg-[rgba(255,248,240,0.14)]">
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          <div className="rounded-[1.9rem] border border-[rgba(117,73,42,0.12)] bg-[rgba(255,250,245,0.82)] p-6 shadow-[0_24px_64px_rgba(139,94,60,0.10)] backdrop-blur-sm sm:p-7">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Edit Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
                    Refine the details people actually notice
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                    Tune your name presentation, pick a stronger avatar direction, and keep the account foundation intact.
                  </p>
                </div>
                <div className="rounded-full border border-[rgba(117,73,42,0.12)] bg-[rgba(255,248,240,0.8)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                  {hasChanges ? 'Unsaved changes' : 'All changes saved'}
                </div>
              </div>

              <div className="mt-8 grid gap-6">
                <section className="rounded-[1.5rem] border border-[rgba(117,73,42,0.10)] bg-[rgba(247,239,227,0.50)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Personal details
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Display name"
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      placeholder="How your name appears in Tradely"
                    />
                    <div className="hidden md:block" />
                    <Input
                      label="First name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="Your first name"
                    />
                    <Input
                      label="Last name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Your last name"
                    />
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-[rgba(117,73,42,0.10)] bg-[rgba(247,239,227,0.50)] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                        Avatar picker
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                        Browse generated DiceBear options, pick a style, then save your selected avatar.
                      </p>
                    </div>
                    <div className="rounded-full border border-[rgba(117,73,42,0.12)] bg-[rgba(255,248,240,0.80)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
                      {pickerStyle}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {AVATAR_STYLE_OPTIONS.map((style) => (
                      <AvatarStyleCard
                        key={style}
                        name={style}
                        description={getAvatarStyleDescription(style)}
                        isActive={form.avatar_style === style}
                        onSelect={handleAvatarStyleSelect}
                      />
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.35rem] border border-[rgba(117,73,42,0.10)] bg-[rgba(255,252,248,0.78)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-primary-deep)]">
                          Choose from generated options
                        </p>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--color-text-muted)]">
                          Built from your account handle using seeds like `{avatarSeedBase}-1`, `{avatarSeedBase}-2`, and more. If you type a custom seed below, it appears here immediately as the current choice.
                        </p>
                      </div>
                      <div className="w-fit rounded-full border border-[rgba(117,73,42,0.10)] bg-[rgba(255,248,240,0.84)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-deep)]">
                        10 options
                      </div>
                    </div>

                    <div className="mt-4">
                      <AvatarPicker
                        options={pickerOptions}
                        selectedSeed={activeSeed}
                        selectedStyle={pickerStyle}
                        onSelect={handleAvatarOptionSelect}
                        displayName={form.display_name.trim() || userDisplayName}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Input
                      label="Avatar seed"
                      name="avatar_seed"
                      value={form.avatar_seed}
                      onChange={handleChange}
                      placeholder={`${avatarSeedBase}-1`}
                    />
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                      Current preview seed: <span className="font-semibold text-[var(--color-primary-deep)]">{activeSeed}</span>
                    </p>
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-[rgba(117,73,42,0.10)] bg-[rgba(247,239,227,0.50)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Read-only account details
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Username"
                      value={user?.username || ''}
                      readOnly
                      disabled
                    />
                    <Input
                      label="Email"
                      value={user?.email || ''}
                      readOnly
                      disabled
                    />
                  </div>
                </section>
              </div>

              <div className="mt-6 space-y-3">
                <StatusMessage tone="error" message={errorMessage} />
                <StatusMessage tone="success" message={successMessage} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" isLoading={isSaving} disabled={!hasChanges} className="sm:max-w-xs">
                  Save changes
                </Button>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Changes are saved only for the fields you actually edit.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProfilePage

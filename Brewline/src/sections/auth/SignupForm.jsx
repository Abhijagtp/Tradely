import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockIcon, MailIcon, UserIcon } from '../../lib/icons'
import { registerUser } from '../../services/authService'
import {
  validateEmail,
  validateFullName,
  validatePassword,
} from '../../utils/validators'

const inputBaseClassName =
  'w-full bg-transparent text-sm text-[var(--color-primary-light)] outline-none placeholder:text-[rgba(245,230,211,0.34)]'

function formatApiErrors(apiErrors) {
  if (!apiErrors || typeof apiErrors !== 'object') {
    return 'Unable to create your account right now.'
  }

  if (typeof apiErrors.detail === 'string') {
    return apiErrors.detail
  }

  if (typeof apiErrors.message === 'string') {
    return apiErrors.message
  }

  const firstLine = Object.values(apiErrors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value) => typeof value === 'string' && value.trim())

  return firstLine || 'Unable to create your account right now.'
}

function AuthField({
  autoComplete,
  disabled,
  error,
  icon,
  inputRef,
  label,
  name,
  onChange,
  onKeyDown,
  order,
  placeholder,
  rightElement,
  success,
  type = 'text',
  value,
}) {
  return (
    <label data-auth-field className="block space-y-2" style={{ '--auth-order': order }}>
      <span className="text-sm font-medium text-[rgba(245,230,211,0.82)]">{label}</span>
      <div
        className={`group relative overflow-hidden rounded-md border bg-[rgba(245,230,211,0.04)] px-3.5 transition duration-200 ${
          error
            ? 'border-[rgba(210,180,140,0.34)]'
            : 'border-[rgba(210,180,140,0.18)] focus-within:border-[rgba(245,230,211,0.28)]'
        }`}
      >
        <span
          className={`pointer-events-none absolute inset-x-3 bottom-0 h-px origin-left bg-[var(--color-primary-soft)] transition-transform duration-300 ${
            success ? 'scale-x-100 opacity-80' : 'scale-x-0 opacity-100 group-focus-within:scale-x-100'
          }`}
        />
        <div className="flex h-12 items-center gap-3">
          <span className="text-[rgba(245,230,211,0.5)]">{icon}</span>
          <input
            ref={inputRef}
            name={name}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className={`${inputBaseClassName} disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <div className="flex items-center gap-2">
            {success ? (
              <span className="auth-check-fade text-[var(--color-primary-soft)]">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="m5 12 4.2 4.2L19 6.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : null}
            {rightElement}
          </div>
        </div>
      </div>
      {error ? (
        <p className="auth-error-shake text-sm text-[var(--color-primary-soft)]">
          {error}
        </p>
      ) : null}
    </label>
  )
}

function SignupForm({ disabled = false, form, onFieldChange, onSwitchMode }) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const isLocked = disabled || isSubmitting
  const canSubmit = useMemo(
    () => form.fullName.trim() && form.email.trim() && form.password.trim() && !isLocked,
    [form.email, form.fullName, form.password, isLocked],
  )

  function updateField(field, value) {
    onFieldChange(field, value)
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  function validateForm() {
    const nextErrors = {}
    const fullNameError = validateFullName(form.fullName)
    const emailError = validateEmail(form.email)
    const passwordError = validatePassword(form.password)

    if (fullNameError) nextErrors.fullName = fullNameError
    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLocked || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await registerUser({
        ...form,
        confirmPassword: form.password,
      })

      navigate('/auth/login', {
        replace: true,
        state: {
          prefillEmail: form.email,
          authNotice: 'Account created successfully. Please sign in.',
        },
      })
    } catch (error) {
      setFormError(formatApiErrors(error?.response?.data))
    } finally {
      setIsSubmitting(false)
    }
  }

  function focusNextField(nextRef) {
    window.requestAnimationFrame(() => {
      nextRef.current?.focus()
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AuthField
        label="Name"
        name="fullName"
        autoComplete="name"
        placeholder="Aarav Sharma"
        value={form.fullName}
        onChange={(event) => updateField('fullName', event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            focusNextField(emailRef)
          }
        }}
        order={1}
        inputRef={nameRef}
        error={errors.fullName}
        success={Boolean(form.fullName.trim()) && !validateFullName(form.fullName)}
        disabled={isLocked}
        icon={<UserIcon />}
      />

      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={form.email}
        onChange={(event) => updateField('email', event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            focusNextField(passwordRef)
          }
        }}
        order={2}
        inputRef={emailRef}
        error={errors.email}
        success={Boolean(form.email.trim()) && !validateEmail(form.email)}
        disabled={isLocked}
        icon={<MailIcon />}
      />

      <AuthField
        label="Password"
        name="password"
        type={isVisible ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Create a strong password"
        value={form.password}
        onChange={(event) => updateField('password', event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSubmit(event)
          }
        }}
        order={3}
        inputRef={passwordRef}
        error={errors.password}
        success={Boolean(form.password.trim()) && !validatePassword(form.password)}
        disabled={isLocked}
        icon={<LockIcon />}
        rightElement={
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setIsVisible((current) => !current)}
            className="text-xs font-semibold text-[rgba(245,230,211,0.52)] transition hover:text-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        }
      />

      {formError ? (
        <div data-auth-field style={{ '--auth-order': 4 }} className="auth-error-shake rounded-md border border-[rgba(210,180,140,0.18)] bg-[rgba(245,230,211,0.05)] px-4 py-3 text-sm text-[var(--color-primary-soft)]">
          {formError}
        </div>
      ) : null}

      <div data-auth-field style={{ '--auth-order': 5 }} className="pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="group relative h-12 w-full overflow-hidden rounded-md border border-[rgba(210,180,140,0.18)] bg-[linear-gradient(135deg,rgba(139,94,60,0.96)_0%,rgba(168,116,77,0.92)_100%)] px-4 text-sm font-semibold text-[var(--color-primary-light)] transition duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,230,211,0.18),_transparent_45%)] opacity-0 transition duration-200 group-active:opacity-100" />
          <span className="relative">{isSubmitting ? 'Creating account...' : 'Signup'}</span>
        </button>
      </div>

      <p data-auth-field style={{ '--auth-order': 6 }} className="text-center text-sm text-[rgba(245,230,211,0.56)]">
        Already have an account?{' '}
        <button
          type="button"
          disabled={isLocked}
          onClick={onSwitchMode}
          className="font-semibold text-[var(--color-primary-light)] transition hover:text-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Login
        </button>
      </p>
    </form>
  )
}

export default SignupForm

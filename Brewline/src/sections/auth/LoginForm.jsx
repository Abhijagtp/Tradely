import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockIcon, MailIcon } from '../../lib/icons'
import { loginUser } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

const inputBaseClassName =
  'w-full bg-transparent text-sm text-[var(--color-primary-light)] outline-none placeholder:text-[rgba(245,230,211,0.34)]'

function AuthField({
  animate = true,
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
    <label
      data-auth-field={animate ? '' : undefined}
      className="block space-y-2"
      style={animate ? { '--auth-order': order } : undefined}
    >
      {label ? (
        <span className="text-sm font-medium text-[rgba(245,230,211,0.82)]">{label}</span>
      ) : null}
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

function LoginForm({ disabled = false, form, onFieldChange, onSwitchMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const isLocked = disabled || isSubmitting
  const canSubmit = useMemo(
    () => form.email.trim() && form.password.trim() && !isLocked,
    [form.email, form.password, isLocked],
  )

  function updateField(field, value) {
    onFieldChange(field, value)
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  function validateForm() {
    const nextErrors = {}
    const emailError = validateEmail(form.email)
    const passwordError = validatePassword(form.password)

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
      const response = await loginUser(form)
      setSession(response)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      setFormError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Unable to log in with those credentials.',
      )
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
        order={1}
        inputRef={emailRef}
        error={errors.email}
        success={Boolean(form.email.trim()) && !validateEmail(form.email)}
        disabled={isLocked}
        icon={<MailIcon />}
      />

      <div data-auth-field className="space-y-2" style={{ '--auth-order': 2 }}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[rgba(245,230,211,0.82)]">Password</span>
          <button
            type="button"
            disabled={isLocked}
            className="text-sm text-[rgba(245,230,211,0.56)] transition hover:text-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Forgot password?
          </button>
        </div>
        <AuthField
          animate={false}
          label={null}
          name="password"
          type={isVisible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit(event)
            }
          }}
          order={2}
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
      </div>

      {formError ? (
        <div data-auth-field style={{ '--auth-order': 3 }} className="auth-error-shake rounded-md border border-[rgba(210,180,140,0.18)] bg-[rgba(245,230,211,0.05)] px-4 py-3 text-sm text-[var(--color-primary-soft)]">
          {formError}
        </div>
      ) : null}

      <div data-auth-field style={{ '--auth-order': 4 }} className="pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="group relative h-12 w-full overflow-hidden rounded-md border border-[rgba(210,180,140,0.18)] bg-[linear-gradient(135deg,rgba(139,94,60,0.96)_0%,rgba(168,116,77,0.92)_100%)] px-4 text-sm font-semibold text-[var(--color-primary-light)] transition duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,230,211,0.18),_transparent_45%)] opacity-0 transition duration-200 group-active:opacity-100" />
          <span className="relative">{isSubmitting ? 'Signing in...' : 'Login'}</span>
        </button>
      </div>

      <p data-auth-field style={{ '--auth-order': 5 }} className="text-center text-sm text-[rgba(245,230,211,0.56)]">
        New here?{' '}
        <button
          type="button"
          disabled={isLocked}
          onClick={onSwitchMode}
          className="font-semibold text-[var(--color-primary-light)] transition hover:text-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create account
        </button>
      </p>
    </form>
  )
}

export default LoginForm

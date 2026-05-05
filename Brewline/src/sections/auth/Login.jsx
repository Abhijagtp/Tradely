import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { LockIcon, MailIcon } from '../../lib/icons'
import { loginUser } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const [form, setForm] = useState({
    email: location.state?.prefillEmail || '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => form.email.trim() && form.password.trim(),
    [form.email, form.password],
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
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

    if (!validateForm()) {
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

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={form.email}
        onChange={(event) => updateField('email', event.target.value)}
        error={errors.email}
        icon={<MailIcon />}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[var(--color-primary-deep)]">Password</span>
          <button
            type="button"
            className="text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary-deep)]"
          >
            Forgot password?
          </button>
        </div>
        <PasswordInput
          label={null}
          aria-label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={errors.password}
          icon={<LockIcon />}
        />
      </div>

      {formError ? (
        <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-primary-light)] px-4 py-3 text-sm text-[var(--color-primary-deep)]">
          {formError}
        </div>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
        Login
      </Button>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Don&apos;t have an account?{' '}
        <Link
          to="/auth/signup"
          className="font-semibold text-[var(--color-primary-deep)] transition hover:opacity-80"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}

export default Login

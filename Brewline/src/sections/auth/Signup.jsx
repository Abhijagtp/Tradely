import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { LockIcon, MailIcon, UserIcon } from '../../lib/icons'
import { registerUser } from '../../services/authService'
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../../utils/validators'

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

  const lines = Object.entries(apiErrors)
    .flatMap(([field, messages]) => {
      const normalized = Array.isArray(messages) ? messages : [messages]
      return normalized.map((message) => `${field}: ${message}`)
    })
    .filter(Boolean)

  return lines[0] || 'Unable to create your account right now.'
}

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () =>
      form.fullName.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      form.acceptedTerms,
    [form],
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  function validateForm() {
    const nextErrors = {}
    const fullNameError = validateFullName(form.fullName)
    const emailError = validateEmail(form.email)
    const passwordError = validatePassword(form.password)
    const confirmError = validateConfirmPassword(
      form.password,
      form.confirmPassword,
    )

    if (fullNameError) nextErrors.fullName = fullNameError
    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError
    if (confirmError) nextErrors.confirmPassword = confirmError
    if (!form.acceptedTerms) nextErrors.acceptedTerms = 'You must accept the terms to continue.'

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
      await registerUser(form)
      navigate('/auth/login', {
        replace: true,
        state: {
          prefillEmail: form.email,
        },
      })
    } catch (error) {
      setFormError(formatApiErrors(error?.response?.data))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Full name"
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="Aarav Sharma"
        value={form.fullName}
        onChange={(event) => updateField('fullName', event.target.value)}
        error={errors.fullName}
        icon={<UserIcon />}
      />

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

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="Create a strong password"
        value={form.password}
        onChange={(event) => updateField('password', event.target.value)}
        error={errors.password}
        icon={<LockIcon />}
      />

      <PasswordInput
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={(event) => updateField('confirmPassword', event.target.value)}
        error={errors.confirmPassword}
        icon={<LockIcon />}
      />

      <Checkbox
        checked={form.acceptedTerms}
        onChange={(event) => updateField('acceptedTerms', event.target.checked)}
        label="I agree to the terms and privacy policy"
        description="By creating an account, you agree to the platform terms and acceptable-use policy."
        error={errors.acceptedTerms}
      />

      {formError ? (
        <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-primary-light)] px-4 py-3 text-sm text-[var(--color-primary-deep)]">
          {formError}
        </div>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
        Sign up
      </Button>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-[var(--color-primary-deep)] transition hover:opacity-80"
        >
          Login
        </Link>
      </p>
    </form>
  )
}

export default Signup

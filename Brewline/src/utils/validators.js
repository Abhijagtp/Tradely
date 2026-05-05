const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateFullName(value) {
  if (!value.trim()) {
    return 'Full name is required.'
  }

  if (value.trim().length < 2) {
    return 'Enter at least 2 characters.'
  }

  return ''
}

export function validateEmail(value) {
  if (!value.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address.'
  }

  return ''
}

export function validatePassword(value) {
  if (!value.trim()) {
    return 'Password is required.'
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword.trim()) {
    return 'Please confirm your password.'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.'
  }

  return ''
}

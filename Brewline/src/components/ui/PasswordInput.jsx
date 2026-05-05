import { useState } from 'react'
import Input from './Input'

function PasswordInput({ error, label, ...props }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Input
      {...props}
      error={error}
      label={label}
      type={isVisible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          className="text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary-deep)] focus-visible:outline-none"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      }
    />
  )
}

export default PasswordInput

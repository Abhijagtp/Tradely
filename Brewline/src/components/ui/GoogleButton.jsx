import Button from './Button'

function GoogleButton({ children = 'Continue with Google' }) {
  return (
    <Button variant="secondary" type="button">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.23c1.89-1.74 2.98-4.31 2.98-7.29Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.97-.9 6.63-2.45l-3.23-2.52c-.9.6-2.05.95-3.4.95-2.61 0-4.82-1.76-5.61-4.12H3.06v2.6A9.99 9.99 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.39 13.86A5.99 5.99 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.54H3.06A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.06 4.46l3.33-2.6Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.02c1.47 0 2.8.51 3.84 1.5l2.88-2.88C16.96 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.06 7.54l3.33 2.6c.79-2.36 3-4.12 5.61-4.12Z"
        />
      </svg>
      {children}
    </Button>
  )
}

export default GoogleButton

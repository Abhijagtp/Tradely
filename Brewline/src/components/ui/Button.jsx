import { clsx } from 'clsx'

const variants = {
  primary:
    'bg-[var(--color-primary-deep)] text-[var(--color-primary-light)] shadow-lg shadow-[var(--color-shadow)] hover:bg-[#7b5233] active:bg-[#6f4a2e]',
  secondary:
    'border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-primary-deep)] hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary-deep)] active:bg-[var(--color-surface-strong)]',
}

function Button({
  children,
  className,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={isLoading || props.disabled}
      className={clsx(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(139,94,60,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button

import { clsx } from 'clsx'

function Input({
  className,
  error,
  icon,
  label,
  rightElement,
  ...props
}) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-[var(--color-primary-deep)]">{label}</span>
      ) : null}
      <div
        className={clsx(
          'flex h-12 items-center gap-3 rounded-2xl border bg-[var(--color-surface)] px-4 shadow-sm transition-all duration-200',
          error
            ? 'border-[var(--color-primary-deep)] focus-within:border-[var(--color-primary-deep)] focus-within:ring-4 focus-within:ring-[rgba(210,180,140,0.35)]'
            : 'border-[var(--color-border)] focus-within:border-[var(--color-primary-soft)] focus-within:ring-4 focus-within:ring-[rgba(210,180,140,0.35)]',
        )}
      >
        {icon ? <span className="text-[var(--color-text-muted)]">{icon}</span> : null}
        <input
          className={clsx(
            'w-full border-0 bg-transparent text-sm text-[var(--color-primary-deep)] outline-none placeholder:text-[var(--color-text-muted)]',
            className,
          )}
          {...props}
        />
        {rightElement}
      </div>
      {error ? <p className="text-sm text-[var(--color-primary-deep)]">{error}</p> : null}
    </label>
  )
}

export default Input

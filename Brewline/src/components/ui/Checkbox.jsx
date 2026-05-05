function Checkbox({ checked, description, label, onChange, error }) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-primary-deep)] focus:ring-[var(--color-primary-soft)]"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-[var(--color-primary-deep)]">{label}</span>
        {description ? (
          <span className="block text-sm text-[var(--color-text-muted)]">{description}</span>
        ) : null}
        {error ? <span className="block text-sm text-[var(--color-primary-deep)]">{error}</span> : null}
      </span>
    </label>
  )
}

export default Checkbox

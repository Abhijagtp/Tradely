function FormDivider({ text = 'OR continue with' }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
        {text}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}

export default FormDivider

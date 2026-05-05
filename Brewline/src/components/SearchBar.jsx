import { useRef } from 'react'

function SearchBar({ icon, onChange, placeholder, value }) {
  const timeoutRef = useRef(null)

  function handleChange(event) {
    const nextValue = event.target.value

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      onChange(nextValue)
    }, 300)
  }

  return (
    <label className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 shadow-sm transition focus-within:border-[var(--color-primary-soft)] focus-within:shadow-[0_0_0_4px_rgba(210,180,140,0.24)]">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-[var(--color-primary-deep)] outline-none placeholder:text-[var(--color-text-muted)]"
      />
    </label>
  )
}

export default SearchBar

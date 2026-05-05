import { clsx } from 'clsx'
import Avatar from './Avatar'

function AvatarPicker({
  displayName,
  onSelect,
  options,
  selectedSeed,
  selectedStyle,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {options.map((option) => {
        const isSelected =
          option.seed === selectedSeed && option.style === selectedStyle

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            className={clsx(
              'group min-w-0 rounded-[1.2rem] border p-3 transition duration-200',
              isSelected
                ? 'border-[rgba(117,73,42,0.38)] bg-[linear-gradient(180deg,rgba(255,248,240,0.98)_0%,rgba(240,222,199,0.92)_100%)] shadow-[0_16px_30px_rgba(139,94,60,0.12)]'
                : 'border-[rgba(117,73,42,0.12)] bg-[rgba(255,248,240,0.72)] shadow-[0_8px_18px_rgba(139,94,60,0.05)] hover:-translate-y-0.5 hover:border-[rgba(117,73,42,0.24)] hover:shadow-[0_14px_26px_rgba(139,94,60,0.10)]',
            )}
            aria-pressed={isSelected}
          >
            <div className="flex min-w-0 flex-col items-center gap-2.5">
              <Avatar
                avatarUrl={option.avatarUrl}
                displayName={displayName}
                size="lg"
                className="rounded-[1.1rem] border border-[rgba(117,73,42,0.12)]"
                fallbackClassName="bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]"
              />
              <div className="min-w-0 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)] sm:text-[11px]">
                  {option.label || 'Option'}
                </p>
                <p className="mt-1 line-clamp-2 break-all text-[10px] leading-4 text-[var(--color-text-muted)] sm:text-[11px]">
                  {option.seed}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default AvatarPicker

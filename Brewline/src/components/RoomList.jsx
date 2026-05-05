import { Link } from 'react-router-dom'

function formatCompactCount(value) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)
}

function RoomList({
  rooms,
  selectedSymbol = '',
  onSelect,
  roomHrefBuilder = (symbol) => `/chat/${symbol}`,
  eyebrow = 'Live rooms',
  title = 'Pick a conversation',
  emptyTitle = 'No active rooms found',
  countLabel = 'active',
}) {
  if (!rooms.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border-strong)] bg-[#E8D5C0] px-5 py-10 text-center">
        <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
          {emptyTitle}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Wait for room activity to pick up or refresh the list.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[rgba(255,248,240,0.82)] p-4 shadow-[0_24px_48px_rgba(139,94,60,0.10)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--color-primary-deep)]">
            {title}
          </h2>
        </div>
        <span className="rounded-full border border-[rgba(139,94,60,0.12)] bg-[rgba(255,250,245,0.88)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">
          {rooms.length} {countLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {rooms.map((room) => {
          const isSelected = room.symbol === selectedSymbol

          return (
            <div
              key={room.symbol}
              className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-[rgba(139,94,60,0.24)] bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(245,230,211,0.86))] shadow-[0_14px_30px_rgba(139,94,60,0.12)]'
                  : 'border-[var(--color-border)] bg-[rgba(255,250,245,0.72)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(139,94,60,0.10)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(181,125,76,0.22)] text-sm font-semibold text-[var(--color-primary-deep)]">
                  {room.symbol.slice(0, 2)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-primary-deep)]">
                        {room.name || room.symbol}
                      </p>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                        {room.symbol}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        room.isFollowing
                          ? 'bg-[rgba(139,94,60,0.14)] text-[var(--color-primary-deep)]'
                          : room.isLive
                            ? 'bg-[rgba(142,196,96,0.18)] text-[#4E8A2B]'
                            : 'bg-[rgba(139,94,60,0.08)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {room.isFollowing ? 'Following' : room.isLive ? 'Live' : 'Quiet'}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {room.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>{formatCompactCount(room.messageCount)} messages</span>
                    <span className="h-1 w-1 rounded-full bg-[rgba(139,94,60,0.38)]" />
                    <span>{formatCompactCount(room.participants)} watching</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {onSelect ? (
                      <button
                        type="button"
                        onClick={() => onSelect(room.symbol)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[rgba(139,94,60,0.12)] text-[var(--color-primary-deep)]'
                            : 'bg-[rgba(245,230,211,0.72)] text-[var(--color-primary-deep)] hover:bg-[rgba(139,94,60,0.10)]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    ) : null}

                    <Link
                      to={roomHrefBuilder(room.symbol)}
                      className="rounded-full bg-[linear-gradient(135deg,#473527,#A86C3F)] px-3 py-1.5 text-xs font-semibold !text-white shadow-sm"
                    >
                      Open room
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoomList

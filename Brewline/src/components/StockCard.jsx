import { clsx } from 'clsx'

function StockCard({ stock }) {
  const isPositive = stock.change >= 0

  return (
    <article
      className={clsx(
        'min-w-[220px] rounded-[1.2rem] border p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(139,94,60,0.14)]',
        stock.isTrending
          ? 'border-[var(--color-primary-deep)] bg-[var(--color-primary-light)]'
          : 'border-[var(--color-border)] bg-[#E8D5C0]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {stock.symbol}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
            ₹{stock.price}
          </h3>
        </div>
        {stock.isTrending ? (
          <span className="rounded-full bg-[var(--color-primary-deep)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-light)]">
            Trending
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p
          className={clsx(
            'text-sm font-semibold',
            isPositive ? 'text-green-700' : 'text-red-700',
          )}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {stock.roomCount} rooms active
        </p>
      </div>
    </article>
  )
}

export default StockCard

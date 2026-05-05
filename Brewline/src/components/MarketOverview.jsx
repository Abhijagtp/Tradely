import { clsx } from 'clsx'

function OverviewCard({ items, title, type }) {
  const isEmpty = !items.length

  return (
    <section className="rounded-[1.3rem] border border-[var(--color-border)] bg-[#E8D5C0] p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-primary-deep)]">
          {title}
        </h3>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
            type === 'gainers'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700',
          )}
        >
          {type === 'gainers' ? 'Bullish' : 'Bearish'}
        </span>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[rgba(245,230,211,0.56)] px-4 py-8 text-center">
          <p className="font-medium text-[var(--color-primary-deep)]">
            No {title.toLowerCase()} available
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Live market data will appear here once the API returns results.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between rounded-2xl bg-[rgba(245,230,211,0.72)] px-4 py-3"
            >
              <div>
                <p className="font-semibold text-[var(--color-primary-deep)]">
                  {item.symbol}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  ₹{item.price}
                </p>
              </div>
              <p
                className={clsx(
                  'text-sm font-semibold',
                  item.change >= 0 ? 'text-green-700' : 'text-red-700',
                )}
              >
                {item.change >= 0 ? '+' : ''}
                {item.change}%
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function MarketOverview({ gainers, losers }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <OverviewCard title="Top Gainers" items={gainers} type="gainers" />
      <OverviewCard title="Top Losers" items={losers} type="losers" />
    </div>
  )
}

export default MarketOverview

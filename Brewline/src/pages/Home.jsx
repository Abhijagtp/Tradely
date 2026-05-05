import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import MarketOverview from '../components/MarketOverview'
import RoomList from '../components/RoomList'
import StockCard from '../components/StockCard'
import {
  activeRooms,
  quickInsights,
  trendingStocks,
} from '../data/mockHomeData'
import { fetchTopGainers, fetchTopLosers } from '../services/marketService'
import { useAuthStore } from '../store/authStore'

function SectionHeading({ action, eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-40 min-w-[220px] animate-pulse rounded-[1.2rem] border border-[var(--color-border)] bg-[#E8D5C0]"
        />
      ))}
    </div>
  )
}

function SkeletonPanel({ rows = 3 }) {
  return (
    <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-[#E8D5C0] p-5 shadow-sm">
      <div className="mb-5 h-6 w-32 animate-pulse rounded-full bg-[rgba(139,94,60,0.12)]" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl bg-[rgba(245,230,211,0.72)]"
          />
        ))}
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
  return (
    <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-[#E8D5C0] p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {insight.title}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-primary-deep)]">
        {insight.value}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{insight.meta}</p>
    </div>
  )
}

function Home() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [overviewData, setOverviewData] = useState({
    gainers: [],
    losers: [],
  })
  const [isOverviewLoading, setIsOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(false)
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadMarketOverview() {
      setIsOverviewLoading(true)
      setOverviewError('')

      try {
        const [gainers, losers] = await Promise.all([
          fetchTopGainers(),
          fetchTopLosers(),
        ])

        if (!isMounted) {
          return
        }

        setOverviewData({
          gainers,
          losers,
        })
      } catch {
        if (!isMounted) {
          return
        }

        setOverviewData({
          gainers: [],
          losers: [],
        })
        setOverviewError('Unable to load top gainers and losers right now.')
      } finally {
        if (isMounted) {
          setIsOverviewLoading(false)
        }
      }
    }

    loadMarketOverview()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredTrending = useMemo(() => {
    if (!query.trim()) {
      return trendingStocks
    }

    return trendingStocks.filter((stock) =>
      stock.symbol.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [query])

  const filteredRooms = useMemo(() => {
    if (!query.trim()) {
      return activeRooms
    }

    return activeRooms.filter((room) =>
      room.symbol.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [query])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,180,140,0.3),_transparent_28%),linear-gradient(180deg,#F5E6D3_0%,#F0DEC7_48%,#EAD2BA_100%)]">
      <Navbar query={query} onQueryChange={setQuery} user={user} onLogout={logout} />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(232,213,192,0.88)] p-6 shadow-[0_20px_60px_rgba(139,94,60,0.10)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                Live now
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-primary-deep)] sm:text-4xl">
                Discover the busiest market rooms before the conversation moves on.
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
                Tradely helps you track trends, join live rooms, and react to price action from one calm dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* <div className="rounded-2xl bg-[var(--color-primary-light)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                Signed in as <span className="font-semibold text-[var(--color-primary-deep)]">{user?.email || 'user'}</span>
              </div> */}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Trending Stocks"
            title="Momentum across the market"
            description="Swipe through the symbols pulling the most attention right now."
          />
          {isLoading ? (
            <SkeletonCards />
          ) : filteredTrending.length ? (
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredTrending.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-dashed border-[var(--color-border-strong)] bg-[#E8D5C0] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                No trending stocks match that search
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Try another symbol to surface active market conversations.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Market Overview"
            title="Quick read on movers"
            description="Keep the biggest gainers and losers in view while deciding which room to join."
          />
          {isOverviewLoading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <SkeletonPanel />
              <SkeletonPanel />
            </div>
          ) : overviewError ? (
            <div className="rounded-[1.3rem] border border-dashed border-[var(--color-border-strong)] bg-[#E8D5C0] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                Market overview unavailable
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {overviewError}
              </p>
            </div>
          ) : (
            <MarketOverview
              gainers={overviewData.gainers}
              losers={overviewData.losers}
            />
          )}
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Active Chat Rooms"
            title="Join a live conversation"
            description="Rooms with fresh discussion and active message flow appear here first."
          />
          {isLoading ? <SkeletonPanel rows={4} /> : <RoomList rooms={filteredRooms} />}
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Quick Insights"
            title="Signals worth scanning"
            description="Fast summaries to help you prioritize the next room to open."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {quickInsights.map((insight) => (
              <InsightCard key={insight.title} insight={insight} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home

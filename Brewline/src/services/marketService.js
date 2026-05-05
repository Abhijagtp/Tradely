import api from '../lib/api'

const MARKET_BASE = '/v1/market'

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return '--'
  }

  const numeric = Number(value)

  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric)
}

function normalizeMarketItem(item) {
  return {
    symbol: item.symbol || item.ticker || item.stock_symbol || 'UNKNOWN',
    price: formatPrice(item.price || item.ltp || item.close || item.current_price),
    change: Number(
      item.change_percentage ??
        item.percent_change ??
        item.change_percent ??
        item.change ??
        0,
    ),
  }
}

function extractList(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

export async function fetchTopGainers() {
  const { data } = await api.get(`${MARKET_BASE}/top-gainers/`)
  return extractList(data).map(normalizeMarketItem)
}

export async function fetchTopLosers() {
  const { data } = await api.get(`${MARKET_BASE}/top-losers/`)
  return extractList(data).map(normalizeMarketItem)
}

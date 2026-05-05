export const trendingStocks = [
  { symbol: 'RELIANCE', price: '2,450', change: 2.34, roomCount: 14, isTrending: true },
  { symbol: 'TCS', price: '3,982', change: 1.18, roomCount: 8, isTrending: false },
  { symbol: 'INFY', price: '1,614', change: -0.84, roomCount: 11, isTrending: false },
  { symbol: 'HDFCBANK', price: '1,742', change: 1.91, roomCount: 6, isTrending: false },
  { symbol: 'SBIN', price: '812', change: 3.02, roomCount: 5, isTrending: false },
]

export const marketOverview = {
  gainers: [
    { symbol: 'SBIN', price: '812', change: 3.02 },
    { symbol: 'RELIANCE', price: '2,450', change: 2.34 },
    { symbol: 'HCLTECH', price: '1,522', change: 1.88 },
  ],
  losers: [
    { symbol: 'INFY', price: '1,614', change: -0.84 },
    { symbol: 'WIPRO', price: '519', change: -1.12 },
    { symbol: 'ASIANPAINT', price: '2,880', change: -1.44 },
  ],
}

export const activeRooms = [
  {
    symbol: 'RELIANCE',
    price: '2,450',
    messageCount: 120,
    isLive: true,
    description: 'Energy, retail, and intraday chatter',
  },
  {
    symbol: 'TCS',
    price: '3,982',
    messageCount: 84,
    isLive: true,
    description: 'Earnings reactions and long-term views',
  },
  {
    symbol: 'INFY',
    price: '1,614',
    messageCount: 43,
    isLive: false,
    description: 'Tech momentum and swing trade ideas',
  },
  {
    symbol: 'SBIN',
    price: '812',
    messageCount: 62,
    isLive: true,
    description: 'Banking sector chatter and volume spikes',
  },
]

export const quickInsights = [
  {
    title: 'Most active in last 5 mins',
    value: 'RELIANCE',
    meta: '48 new messages across 14 live threads',
  },
  {
    title: 'Trending mentions',
    value: 'Budget rally',
    meta: 'Users are discussing PSU banks and energy',
  },
]

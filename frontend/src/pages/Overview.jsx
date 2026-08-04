import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, Coins, Landmark, Sparkles } from 'lucide-react'
import SummaryCard from '../components/SummaryCard'
import AllocationPieChart from '../components/AllocationPieChart'
import PortfolioChart from '../components/PortfolioChart'
import HoldingsTable from '../components/HoldingsTable'
import { getApiErrorMessage, getInvestments } from '../services/investmentService'
import { getPrice } from '../services/portfolioService'
import { buildCumulativeInvestmentSeries, getHoldingsMetrics } from '../utils/portfolioUtils'

function createSummaryCards(metrics) {
  return [
    {
      title: 'Total Portfolio Value',
      value: formatCurrencyValue(metrics.totalValue),
      change: metrics.gainPct,
      icon: BriefcaseBusiness,
    },
    {
      title: 'Total Invested',
      value: formatCurrencyValue(metrics.totalInvested),
      change: undefined,
      icon: Landmark,
    },
    {
      title: 'Total Stock Investment',
      value: formatCurrencyValue(metrics.byAssetType.stock || 0),
      change: undefined,
      icon: Sparkles,
    },
    {
      title: 'Total Bond Investment',
      value: formatCurrencyValue(metrics.byAssetType.bond || 0),
      change: undefined,
      icon: Landmark,
    },
    {
      title: 'Total Crypto Investment',
      value: formatCurrencyValue(metrics.byAssetType.crypto || 0),
      change: undefined,
      icon: Coins,
    },
  ]
}

function formatCurrencyValue(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value || 0)
}

function createAllocationData(holdings) {
  const metrics = getHoldingsMetrics(holdings)
  const sectors = Object.entries(metrics.bySector).map(([name, value]) => ({ name, value }))
  const assetTypes = Object.entries(metrics.byAssetType).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  return { sectors, assetTypes }
}

function createHoldingsTableData(holdings) {
  return holdings.map((item) => {
    const currentPrice = item.currentPrice ?? item.purchasePrice
    const totalValue = currentPrice * item.quantity
    const costBasis = item.purchasePrice * item.quantity
    return {
      ...item,
      currentPrice,
      totalValue,
      profitLoss: totalValue - costBasis,
      profitLossPct: costBasis > 0 ? ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100 : 0,
    }
  })
}

export default function Overview({ searchQuery: searchQueryProp, onSearch, refreshToken }) {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assetFilter, setAssetFilter] = useState('ALL')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')

  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : internalSearchQuery

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await getInvestments()

      const tickers = [...new Set(items.map((item) => item.ticker))]
      const priceResults = await Promise.allSettled(tickers.map((ticker) => getPrice(ticker)))
      const pricesByTicker = {}
      tickers.forEach((ticker, index) => {
        const result = priceResults[index]
        if (result.status === 'fulfilled' && result.value?.currentPrice != null) {
          pricesByTicker[ticker] = Number(result.value.currentPrice)
        }
      })

      setHoldings(items.map((item) => ({ ...item, currentPrice: pricesByTicker[item.ticker] ?? item.purchasePrice })))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load portfolio data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const metrics = useMemo(() => getHoldingsMetrics(holdings), [holdings])
  const summaryCards = useMemo(() => createSummaryCards(metrics), [metrics])
  const allocations = useMemo(() => createAllocationData(holdings), [holdings])
  const holdingsTableData = useMemo(() => createHoldingsTableData(holdings), [holdings])
  const investmentTrend = useMemo(() => buildCumulativeInvestmentSeries(holdings, assetFilter), [holdings, assetFilter])

  const filteredHoldings = useMemo(() => {
    if (!searchQuery.trim()) return holdingsTableData
    const query = searchQuery.toLowerCase()
    return holdingsTableData.filter((item) => `${item.ticker} ${item.name || ''} ${item.assetType}`.toLowerCase().includes(query))
  }, [holdingsTableData, searchQuery])

  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value)
      return
    }
    setInternalSearchQuery(value)
  }

  return (
    <div className="space-y-6">
      {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading portfolio...</p> : null}
      {error ? <p className="py-6 text-center text-sm text-rose-500">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AllocationPieChart title="Portfolio Allocation by Sector" data={allocations.sectors} />
        <AllocationPieChart title="Portfolio Allocation by Asset Type" data={allocations.assetTypes} />
      </div>

      <PortfolioChart data={investmentTrend} activeRange={assetFilter} onRangeChange={setAssetFilter} />

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Portfolio Holdings</h3>
            <p className="text-sm text-slate-500">Live holdings from your portfolio, priced with the backend price service.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {holdings.length} positions
          </div>
        </div>
        <HoldingsTable holdings={filteredHoldings} />
      </div>
    </div>
  )
}


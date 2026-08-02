import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Coins, Landmark, Sparkles } from 'lucide-react'
import SummaryCard from '../components/SummaryCard'
import AllocationPieChart from '../components/AllocationPieChart'
import PortfolioChart from '../components/PortfolioChart'
import HoldingsTable from '../components/HoldingsTable'
import InvestmentModal from '../components/InvestmentModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { initialPortfolioData, initialWatchlist } from '../data/mockPortfolioData'
import { buildPerformanceSeries, formatCurrency, formatPercent, getHoldingsMetrics } from '../utils/portfolioUtils'

const rangeSeries = {
  Daily: [
    { name: 'Mon', value: 184200 },
    { name: 'Tue', value: 186300 },
    { name: 'Wed', value: 183950 },
    { name: 'Thu', value: 190450 },
    { name: 'Fri', value: 195780 },
  ],
  Weekly: [
    { name: 'W1', value: 176400 },
    { name: 'W2', value: 181200 },
    { name: 'W3', value: 189750 },
    { name: 'W4', value: 195780 },
  ],
  Monthly: [
    { name: 'Jan', value: 162500 },
    { name: 'Feb', value: 171200 },
    { name: 'Mar', value: 178900 },
    { name: 'Apr', value: 191320 },
    { name: 'May', value: 195780 },
  ],
  Yearly: [
    { name: '2021', value: 118900 },
    { name: '2022', value: 142500 },
    { name: '2023', value: 168300 },
    { name: '2024', value: 195780 },
  ],
  'All Time': [
    { name: '2019', value: 94000 },
    { name: '2020', value: 126500 },
    { name: '2021', value: 151200 },
    { name: '2022', value: 172400 },
    { name: '2023', value: 185700 },
    { name: '2024', value: 195780 },
  ],
}

function createSummaryCards(metrics) {
  return [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(metrics.totalValue),
      change: metrics.gainPct,
      icon: BriefcaseBusiness,
    },
    {
      title: 'Total Invested',
      value: formatCurrency(metrics.totalInvested),
      change: undefined,
      icon: Landmark,
    },
    {
      title: 'Total Stock Investment',
      value: formatCurrency(metrics.byAssetType.stock || 0),
      change: undefined,
      icon: Sparkles,
    },
    {
      title: 'Total Bond Investment',
      value: formatCurrency(metrics.byAssetType.bond || 0),
      change: undefined,
      icon: Landmark,
    },
    {
      title: 'Total Crypto Investment',
      value: formatCurrency(metrics.byAssetType.crypto || 0),
      change: undefined,
      icon: Coins,
    },
  ]
}

function createAllocationData(holdings) {
  const metrics = getHoldingsMetrics(holdings)
  const sectors = Object.entries(metrics.bySector).map(([name, value]) => ({ name, value }))
  const assetTypes = Object.entries(metrics.byAssetType).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  return { sectors, assetTypes }
}

function createHoldingsTableData(holdings) {
  return holdings.map((item) => ({
    ...item,
    totalValue: item.currentPrice * item.quantity,
    profitLoss: item.currentPrice * item.quantity - item.avgBuyPrice * item.quantity,
    profitLossPct: ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100,
  }))
}

export default function Overview({ searchQuery: searchQueryProp, onSearch }) {
  const [holdings, setHoldings] = useState(initialPortfolioData.holdings)
  const [watchlist, setWatchlist] = useState(initialWatchlist)
  const [range, setRange] = useState('Monthly')
  const [currentRangeSeries, setCurrentRangeSeries] = useState(buildPerformanceSeries(holdings))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingHolding, setEditingHolding] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [internalSearchQuery, setInternalSearchQuery] = useState('')

  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : internalSearchQuery

  const metrics = useMemo(() => getHoldingsMetrics(holdings), [holdings])
  const summaryCards = useMemo(() => createSummaryCards(metrics), [metrics])
  const allocations = useMemo(() => createAllocationData(holdings), [holdings])
  const holdingsTableData = useMemo(() => createHoldingsTableData(holdings), [holdings])

  const filteredHoldings = useMemo(() => {
    if (!searchQuery.trim()) return holdingsTableData
    const query = searchQuery.toLowerCase()
    return holdingsTableData.filter((item) => `${item.symbol} ${item.companyName} ${item.assetType}`.toLowerCase().includes(query))
  }, [holdingsTableData, searchQuery])

  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value)
      return
    }
    setInternalSearchQuery(value)
  }

  const handleAddInvestment = () => {
    setEditingHolding(null)
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  const handleEditInvestment = (holding) => {
    setEditingHolding(holding)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDeleteInvestment = (holdingId) => {
    setConfirmDeleteId(holdingId)
  }

  const confirmDelete = () => {
    setHoldings((current) => current.filter((item) => item.id !== confirmDeleteId))
    setWatchlist((current) => current.filter((item) => item.id !== confirmDeleteId))
    setConfirmDeleteId(null)
  }

  const saveInvestment = (payload) => {
    if (isEditMode && editingHolding) {
      setHoldings((current) => current.map((item) => (item.id === editingHolding.id ? { ...item, ...payload, id: editingHolding.id } : item)))
      setWatchlist((current) => current.map((item) => (item.id === editingHolding.id ? { ...item, ...payload, id: editingHolding.id } : item)))
      return
    }

    const nextHolding = {
      ...payload,
      id: Date.now(),
    }
    setHoldings((current) => [nextHolding, ...current])
    if (payload.watchlist) {
      setWatchlist((current) => [nextHolding, ...current])
    }
  }

  const handleRangeChange = (value) => {
    setRange(value)
    setCurrentRangeSeries(buildPerformanceSeries(holdings))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AllocationPieChart title="Portfolio Allocation by Sector" data={allocations.sectors} />
        <AllocationPieChart title="Portfolio Allocation by Asset Type" data={allocations.assetTypes} />
      </div>

      <PortfolioChart data={currentRangeSeries} activeRange={range} onRangeChange={handleRangeChange} />

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Portfolio Holdings</h3>
            <p className="text-sm text-slate-500">Mock holdings with instant add, edit, and delete actions.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {holdings.length} positions
          </div>
        </div>
        <HoldingsTable holdings={filteredHoldings} onEdit={handleEditInvestment} onDelete={handleDeleteInvestment} />
      </div>

      <InvestmentModal
        mode={isEditMode ? 'edit' : 'add'}
        initialData={editingHolding}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={saveInvestment}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete holding"
        message="This will remove the holding from the mock portfolio and watchlist."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

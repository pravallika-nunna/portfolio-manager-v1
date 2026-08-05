import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BarChart3, Layers3, PieChart, Wallet, TrendingUp } from 'lucide-react'
import AsyncState from '../components/AsyncState'
import DataTableShell from '../components/DataTableShell'
import FilterChips from '../components/FilterChips'
import PageCard from '../components/PageCard'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import { getApiErrorMessage, getDashboard, getDashboardByAssetType } from '../services/portfolioService'
import { currency, formatPercent } from '../utils/formatters'

const ASSET_FILTERS = ['ALL', 'STOCK', 'BOND', 'CRYPTO']

function BreakdownCard({ title, data, valueFormatter }) {
  const entries = Object.entries(data || {})

  return (
    <PageCard className="p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">{key}</span>
              <span className="text-sm font-semibold text-slate-900">{valueFormatter(value)}</span>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  )
}

export default function Dashboard({ refreshToken }) {
  const navigate = useNavigate()
  const { assetType } = useParams()
  const activeAsset = (assetType || 'ALL').toUpperCase()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = activeAsset === 'ALL'
        ? await getDashboard()
        : await getDashboardByAssetType(activeAsset)
      setData(payload)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not load your dashboard right now.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAsset, refreshToken])

  const gainLossTone = useMemo(() => {
    const value = Number(data?.unrealizedGainLoss || 0)
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'slate'
  }, [data])

  return (
    <div className="space-y-6">
      <PageCard className="p-5">
        <SectionHeader
          title="Detailed Dashboard"
          description="Combined and asset-specific portfolio snapshots from backend analytics."
        />
        <FilterChips
          options={ASSET_FILTERS}
          activeValue={activeAsset}
          onChange={(filter) => navigate(filter === 'ALL' ? '/dashboard' : `/dashboard/${filter}`)}
        />
      </PageCard>

      <AsyncState loading={loading} error={error} loadingMessage="Loading dashboard..." onRetry={load} />

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Positions" value={String(data.totalPositions || 0)} icon={Layers3} />
            <StatCard title="Total Quantity" value={String(data.totalQuantity || 0)} icon={BarChart3} />
            <StatCard title="Total Cost Basis" value={currency.format(Number(data.totalCostBasis || 0))} icon={Wallet} />
            <StatCard title="Estimated Total Value" value={currency.format(Number(data.estimatedTotalValue || 0))} icon={PieChart} />
            <StatCard title="Unrealized Gain/Loss" value={`${currency.format(Number(data.unrealizedGainLoss || 0))} (${formatPercent(Number(data.unrealizedGainLossPct || 0))})`} icon={TrendingUp} tone={gainLossTone} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard title="Quantity by Asset Type" data={data.quantityByAssetType} valueFormatter={(v) => String(v)} />
            <BreakdownCard title="Cost by Asset Type" data={data.costByAssetType} valueFormatter={(v) => currency.format(Number(v || 0))} />
          </div>

          <PageCard className="p-5">
            <SectionHeader
              title="Holdings Detail"
              description="Holdings returned by selected dashboard scope."
              countLabel={`${(data.holdings || []).length} rows`}
            />

            <DataTableShell
              headers={['Ticker', 'Asset', 'Quantity', 'Purchase Price', 'Purchase Date']}
              hasRows={(data.holdings || []).length > 0}
              emptyMessage="No holdings found for this filter. Try another asset type."
              colSpan={5}
            >
              {(data.holdings || []).map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                  <td className="px-4 py-3 text-slate-600">{item.assetType}</td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{currency.format(Number(item.purchasePrice || 0))}</td>
                  <td className="px-4 py-3 text-slate-600">{item.purchaseDate}</td>
                </tr>
              ))}
            </DataTableShell>
          </PageCard>
        </>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BarChart3, Layers3, PieChart, Wallet, TrendingUp } from 'lucide-react'
import { getApiErrorMessage, getDashboard, getDashboardByAssetType } from '../services/portfolioService'
import { currency, formatPercent } from '../utils/formatters'

const ASSET_FILTERS = ['ALL', 'STOCK', 'BOND', 'CRYPTO']

function StatCard({ title, value, icon: Icon, tone = 'slate' }) {
  const toneClass = tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-rose-600' : 'text-slate-900'

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Icon size={18} className="text-slate-400" />
      </div>
      <p className={`mt-4 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  )
}

function BreakdownCard({ title, data, valueFormatter }) {
  const entries = Object.entries(data || {})

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
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
    </div>
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
      setError(getApiErrorMessage(err, 'Could not load dashboard data.'))
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
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Detailed Dashboard</h2>
            <p className="text-sm text-slate-500">Combined and asset-specific portfolio snapshots from backend analytics.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ASSET_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => navigate(filter === 'ALL' ? '/dashboard' : `/dashboard/${filter}`)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeAsset === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="py-10 text-center text-sm text-slate-500">Loading dashboard...</p>}
      {error && <p className="py-10 text-center text-sm text-rose-500">{error}</p>}

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

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Holdings Detail</h3>
                <p className="text-sm text-slate-500">Holdings returned by selected dashboard scope.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {(data.holdings || []).length} rows
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Ticker', 'Asset', 'Quantity', 'Purchase Price', 'Purchase Date'].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(data.holdings || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        No holdings in this dashboard scope.
                      </td>
                    </tr>
                  ) : (
                    (data.holdings || []).map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                        <td className="px-4 py-3 text-slate-600">{item.assetType}</td>
                        <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{currency.format(Number(item.purchasePrice || 0))}</td>
                        <td className="px-4 py-3 text-slate-600">{item.purchaseDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


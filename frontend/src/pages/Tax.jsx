import { useEffect, useMemo, useState } from 'react'
import { Calculator, Receipt, TrendingUp } from 'lucide-react'
import { getApiErrorMessage, getTaxEstimate } from '../services/portfolioService'
import { currency } from '../utils/formatters'

const CATEGORY_FILTERS = ['ALL', 'SHORT_TERM', 'LONG_TERM']

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Icon size={18} className="text-slate-400" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function formatRate(rate) {
  if (rate === null || rate === undefined) return '0.00%'
  return `${(Number(rate) * 100).toFixed(2)}%`
}

export default function Tax() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      setItems(await getTaxEstimate())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load tax estimates.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return items
    return items.filter((item) => item.taxCategory === activeFilter)
  }, [items, activeFilter])

  const metrics = useMemo(() => {
    const totalLiability = filteredItems.reduce((sum, item) => sum + Number(item.estimatedTaxLiability || 0), 0)
    const totalGain = filteredItems.reduce((sum, item) => sum + Number(item.estimatedGain || 0), 0)
    const positiveGainCount = filteredItems.filter((item) => Number(item.estimatedGain || 0) > 0).length

    return {
      totalLiability,
      totalGain,
      positiveGainCount,
    }
  }, [filteredItems])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Estimated Total Tax Liability" value={currency.format(metrics.totalLiability)} icon={Calculator} />
        <StatCard title="Estimated Total Unrealized Gain" value={currency.format(metrics.totalGain)} icon={TrendingUp} />
        <StatCard title="Holdings with Positive Gain" value={String(metrics.positiveGainCount)} icon={Receipt} />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tax Estimates</h2>
            <p className="text-sm text-slate-500">Short-term and long-term estimated tax by holding.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {filteredItems.length} holdings
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading && <p className="py-10 text-center text-sm text-slate-500">Loading tax estimates...</p>}
        {error && <p className="py-10 text-center text-sm text-rose-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Ticker', 'Asset', 'Purchase Date', 'Holding Days', 'Category', 'Cost Basis', 'Current Value', 'Gain', 'Rate', 'Estimated Tax'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                      No tax estimate rows were returned.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={`${item.ticker}-${item.purchaseDate}-${item.holdingDays}`} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                      <td className="px-4 py-3 text-slate-600">{item.assetType}</td>
                      <td className="px-4 py-3 text-slate-600">{item.purchaseDate}</td>
                      <td className="px-4 py-3 text-slate-600">{item.holdingDays}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.taxCategory === 'LONG_TERM' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {item.taxCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{currency.format(item.costBasis || 0)}</td>
                      <td className="px-4 py-3 text-slate-600">{currency.format(item.estimatedCurrentValue || 0)}</td>
                      <td className={`px-4 py-3 font-medium ${Number(item.estimatedGain || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currency.format(item.estimatedGain || 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatRate(item.taxRate)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{currency.format(item.estimatedTaxLiability || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

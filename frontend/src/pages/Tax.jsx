import { useEffect, useMemo, useState } from 'react'
import { Calculator, Receipt, TrendingUp } from 'lucide-react'
import AsyncState from '../components/AsyncState'
import DataTableShell from '../components/DataTableShell'
import FilterChips from '../components/FilterChips'
import PageCard from '../components/PageCard'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import { getApiErrorMessage, getTaxEstimate } from '../services/portfolioService'
import { currency } from '../utils/formatters'

const CATEGORY_FILTERS = ['ALL', 'SHORT_TERM', 'LONG_TERM']

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
      setError(getApiErrorMessage(err, 'We could not load tax estimates right now.'))
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

      <PageCard className="p-5">
        <SectionHeader
          title="Tax Estimates"
          description="Short-term and long-term estimated tax by holding."
          countLabel={`${filteredItems.length} holdings`}
        />

        <div className="mb-4">
          <FilterChips
            options={CATEGORY_FILTERS}
            activeValue={activeFilter}
            onChange={setActiveFilter}
            formatLabel={(value) => (value === 'ALL' ? 'All' : value.replace('_', ' '))}
          />
        </div>

        <AsyncState loading={loading} error={error} loadingMessage="Loading tax estimates..." onRetry={load} />

        {!loading && !error && (
          <DataTableShell
            headers={['Ticker', 'Asset', 'Purchase Date', 'Holding Days', 'Category', 'Cost Basis', 'Current Value', 'Gain', 'Rate', 'Estimated Tax']}
            hasRows={filteredItems.length > 0}
            emptyMessage="No tax estimates found for this filter."
            colSpan={10}
          >
            {filteredItems.map((item) => (
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
            ))}
          </DataTableShell>
        )}
      </PageCard>
    </div>
  )
}

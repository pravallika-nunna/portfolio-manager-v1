import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { currency, formatPercent } from '../utils/formatters'

const columns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'companyName', label: 'Company Name' },
  { key: 'sector', label: 'Sector' },
  { key: 'assetType', label: 'Asset Type' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'avgBuyPrice', label: 'Avg Buy Price' },
  { key: 'currentPrice', label: 'Current Price' },
  { key: 'totalValue', label: 'Total Value' },
  { key: 'profitLoss', label: 'Profit/Loss' },
  { key: 'profitLossPct', label: 'Profit/Loss %' },
]

export default function HoldingsTable({ holdings }) {
  const [sortConfig, setSortConfig] = useState({ key: 'totalValue', direction: 'desc' })

  const sortedHoldings = useMemo(() => {
    const rows = [...holdings]
    rows.sort((left, right) => {
      const leftValue = left[sortConfig.key] ?? 0
      const rightValue = right[sortConfig.key] ?? 0
      if (typeof leftValue === 'string') {
        return sortConfig.direction === 'asc'
          ? leftValue.localeCompare(rightValue)
          : rightValue.localeCompare(leftValue)
      }
      return sortConfig.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    })
    return rows
  }, [holdings, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold text-slate-700">
                  <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <ArrowUpDown size={14} className="text-slate-400" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedHoldings.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                  No holdings were returned by the backend yet.
                </td>
              </tr>
            ) : (
              sortedHoldings.map((holding) => (
                <tr key={holding.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{holding.symbol}</td>
                  <td className="px-4 py-3 text-slate-600">{holding.companyName}</td>
                  <td className="px-4 py-3 text-slate-600">{holding.sector}</td>
                  <td className="px-4 py-3 text-slate-600">{holding.assetType}</td>
                  <td className="px-4 py-3 text-slate-600">{holding.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{currency.format(holding.avgBuyPrice)}</td>
                  <td className="px-4 py-3 text-slate-600">{currency.format(holding.currentPrice)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{currency.format(holding.totalValue)}</td>
                  <td className={`px-4 py-3 font-medium ${holding.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currency.format(holding.profitLoss)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${holding.profitLossPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(holding.profitLossPct)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

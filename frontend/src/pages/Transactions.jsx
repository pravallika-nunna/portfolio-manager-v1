import { Plus, RefreshCw, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  createTransaction,
  deleteTransaction,
  getApiErrorMessage,
  getPrice,
  getTransactions,
} from '../services/portfolioService'
import { currency } from '../utils/formatters'
import { useEffect, useMemo, useState } from 'react'

const ASSET_TYPES = ['STOCK', 'BOND', 'CRYPTO']
const TX_TYPES = ['BUY', 'SELL']
const emptyForm = { ticker: '', assetType: 'STOCK', transactionType: 'BUY', quantity: 1, pricePerUnit: '', transactionDate: '', notes: '' }

function TransactionModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) setForm(emptyForm)
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, pricePerUnit: parseFloat(form.pricePerUnit), quantity: parseInt(form.quantity, 10) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Record Transaction</h3>
            <p className="text-sm text-slate-500">Log a buy or sell trade.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Ticker
            <input required name="ticker" value={form.ticker} onChange={handleChange} placeholder="e.g. AAPL" className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm uppercase" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Asset Type
            <select name="assetType" value={form.assetType} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Type
            <select name="transactionType" value={form.transactionType} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              {TX_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input required type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Price per Unit ($)
            <input required type="number" min="0.01" step="0.01" name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Transaction Date
            <input required type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Notes (optional)
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Transactions() {
  const [items, setItems] = useState([])
  const [pricesByTicker, setPricesByTicker] = useState({})
  const [loading, setLoading] = useState(true)
  const [priceLoading, setPriceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const loadPrices = async (rows) => {
    if (!rows.length) {
      setPricesByTicker({})
      return
    }

    setPriceLoading(true)
    const tickers = [...new Set(rows.map((row) => row.ticker))]
    const responses = await Promise.allSettled(tickers.map((ticker) => getPrice(ticker)))
    const next = {}

    tickers.forEach((ticker, index) => {
      const result = responses[index]
      if (result.status === 'fulfilled') {
        next[ticker] = result.value
      }
    })

    setPricesByTicker(next)
    setPriceLoading(false)
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const txs = await getTransactions()
      setItems(txs)
      await loadPrices(txs)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load transactions.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const rows = useMemo(() => {
    return items.map((item) => {
      const livePrice = pricesByTicker[item.ticker]?.currentPrice
      const priceDiff = livePrice !== undefined && livePrice !== null
        ? Number(livePrice) - Number(item.pricePerUnit)
        : null
      return { ...item, livePrice, priceDiff }
    })
  }, [items, pricesByTicker])

  const handleSave = async (form) => {
    try {
      await createTransaction(form)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save transaction.'))
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTransaction(confirmDeleteId)
      setConfirmDeleteId(null)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete transaction.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
            <p className="text-sm text-slate-500">Buy and sell history with current market comparison.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{items.length} records</div>
            <button onClick={() => loadPrices(items)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <RefreshCw size={14} className={priceLoading ? 'animate-spin' : ''} /> Refresh Prices
            </button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Plus size={15} /> Record Trade
            </button>
          </div>
        </div>

        {loading && <p className="py-10 text-center text-sm text-slate-500">Loading transactions...</p>}
        {error && <p className="py-10 text-center text-sm text-rose-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Ticker', 'Type', 'Asset', 'Quantity', 'Price/Unit', 'Live Price', 'Diff', 'Total Value', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No transactions yet. Record your first trade above.</td></tr>
                ) : rows.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.transactionType === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {item.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.assetType}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">{currency.format(item.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-slate-900">{item.livePrice !== undefined && item.livePrice !== null ? currency.format(item.livePrice) : '—'}</td>
                    <td className={`px-4 py-3 font-medium ${Number(item.priceDiff || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{item.priceDiff !== null ? currency.format(item.priceDiff) : '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{currency.format(item.totalValue)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.transactionDate}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmDeleteId(item.id)} className="rounded-xl border border-rose-100 p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} />
      <ConfirmDialog isOpen={Boolean(confirmDeleteId)} title="Delete transaction" message="This will permanently remove this transaction record." onCancel={() => setConfirmDeleteId(null)} onConfirm={handleConfirmDelete} />
    </div>
  )
}

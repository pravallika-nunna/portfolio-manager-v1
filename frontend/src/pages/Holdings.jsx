import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, RefreshCw, Trash2, X, TrendingDown } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  createPortfolioItem,
  deletePortfolioItem,
  getApiErrorMessage,
  getPortfolioItems,
  getPrice,
  sellHolding,
  updatePortfolioItem,
} from '../services/portfolioService'
import { currency, formatPercent } from '../utils/formatters'

const ASSET_TYPES = ['STOCK', 'BOND', 'CRYPTO']
const emptyForm = { ticker: '', quantity: 1, assetType: 'STOCK', purchasePrice: '', purchaseDate: '' }

function HoldingModal({ isOpen, onClose, onSubmit, initialData, mode }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? {
        ticker: initialData.ticker,
        quantity: initialData.quantity,
        assetType: initialData.assetType,
        purchasePrice: initialData.purchasePrice,
        purchaseDate: initialData.purchaseDate,
      } : emptyForm)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, purchasePrice: parseFloat(form.purchasePrice), quantity: parseInt(form.quantity, 10) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{mode === 'edit' ? 'Edit Holding' : 'Add Holding'}</h3>
            <p className="text-sm text-slate-500">Saved directly to the backend.</p>
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
            Quantity
            <input required type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Purchase Price ($)
            <input required type="number" min="0.01" step="0.01" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Purchase Date
            <input required type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Holding</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Holdings({ refreshToken }) {
  const [items, setItems] = useState([])
  const [pricesByTicker, setPricesByTicker] = useState({})
  const [loading, setLoading] = useState(true)
  const [priceLoading, setPriceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmSellItem, setConfirmSellItem] = useState(null)

  const loadPrices = async (holdings) => {
    if (!holdings.length) {
      setPricesByTicker({})
      return
    }

    setPriceLoading(true)
    const tickers = [...new Set(holdings.map((item) => item.ticker))]
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
      const holdings = await getPortfolioItems()
      setItems(holdings)
      await loadPrices(holdings)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load holdings.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const tableRows = useMemo(() => {
    return items.map((item) => {
      const priceData = pricesByTicker[item.ticker]
      const livePrice = priceData?.currentPrice
      const changePercent = priceData?.changePercent
      const currentValue = (livePrice ?? item.purchasePrice) * item.quantity
      const costBasis = item.purchasePrice * item.quantity
      const unrealized = currentValue - costBasis

      return {
        ...item,
        livePrice,
        changePercent,
        costBasis,
        currentValue,
        unrealized,
      }
    })
  }, [items, pricesByTicker])

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSave = async (form) => {
    try {
      if (editingItem) {
        await updatePortfolioItem(editingItem.id, form)
      } else {
        await createPortfolioItem(form)
      }
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save holding.'))
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePortfolioItem(confirmDeleteId)
      setConfirmDeleteId(null)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete holding.'))
    }
  }

  const handleConfirmSell = async () => {
    try {
      const price = confirmSellItem.livePrice ?? confirmSellItem.purchasePrice
      await sellHolding(confirmSellItem.id, price)
      setConfirmSellItem(null)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not sell holding.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Holdings</h2>
            <p className="text-sm text-slate-500">Portfolio positions + live prices from backend price service.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{items.length} positions</div>
            <button onClick={() => loadPrices(items)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <RefreshCw size={14} className={priceLoading ? 'animate-spin' : ''} /> Refresh Prices
            </button>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Plus size={15} /> Add Holding
            </button>
          </div>
        </div>

        {loading && <p className="py-10 text-center text-sm text-slate-500">Loading holdings...</p>}
        {error && <p className="py-10 text-center text-sm text-rose-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Ticker', 'Asset Type', 'Quantity', 'Purchase Price', 'Live Price', '24h Change', 'Current Value', 'Unrealized P/L', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tableRows.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-500">No holdings found. Add your first holding above.</td></tr>
                ) : tableRows.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.assetType}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">{currency.format(item.purchasePrice)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.livePrice !== undefined && item.livePrice !== null ? currency.format(item.livePrice) : '—'}</td>
                    <td className={`px-4 py-3 font-medium ${Number(item.changePercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.changePercent !== undefined && item.changePercent !== null ? formatPercent(item.changePercent) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-900">{currency.format(item.currentValue)}</td>
                    <td className={`px-4 py-3 font-medium ${item.unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{currency.format(item.unrealized)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmSellItem(item)} title="Sell all" className="rounded-xl border border-amber-200 p-2 text-amber-600 hover:bg-amber-50"><TrendingDown size={14} /></button>
                        <button onClick={() => setConfirmDeleteId(item.id)} className="rounded-xl border border-rose-100 p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HoldingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingItem} mode={editingItem ? 'edit' : 'add'} />
      <ConfirmDialog isOpen={Boolean(confirmDeleteId)} title="Delete holding" message="This will permanently remove the holding from the portfolio." onCancel={() => setConfirmDeleteId(null)} onConfirm={handleConfirmDelete} />
      <ConfirmDialog
        isOpen={Boolean(confirmSellItem)}
        title="Sell holding"
        message={confirmSellItem ? `Sell all ${confirmSellItem.quantity} unit(s) of ${confirmSellItem.ticker} at ${confirmSellItem.livePrice != null ? `live price $${Number(confirmSellItem.livePrice).toFixed(2)}` : `purchase price $${Number(confirmSellItem.purchasePrice).toFixed(2)}`}? This will remove the position and log a SELL transaction.` : ''}
        onCancel={() => setConfirmSellItem(null)}
        onConfirm={handleConfirmSell}
      />
    </div>
  )
}

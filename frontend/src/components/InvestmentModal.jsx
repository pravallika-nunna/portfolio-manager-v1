import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = {
  symbol: '',
  companyName: '',
  sector: 'Technology',
  assetType: 'Stock',
  quantity: 1,
  avgBuyPrice: 0,
  currentPrice: 0,
  watchlist: false,
}

export default function InvestmentModal({ mode = 'add', initialData, isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...initialData } : emptyForm)
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'quantity' || name === 'avgBuyPrice' || name === 'currentPrice' ? Number(value) : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{mode === 'edit' ? 'Edit Investment' : 'Add Investment'}</h3>
            <p className="text-sm text-slate-500">Update the mock portfolio data instantly.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Symbol
            <input required name="symbol" value={form.symbol} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Company / Name
            <input required name="companyName" value={form.companyName} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Sector
            <input required name="sector" value={form.sector} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Asset Type
            <select name="assetType" value={form.assetType} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              <option value="Stock">Stock</option>
              <option value="Bond">Bond</option>
              <option value="Crypto">Crypto</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input required type="number" min="1" step="0.01" name="quantity" value={form.quantity} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Avg Buy Price
            <input required type="number" min="0" step="0.01" name="avgBuyPrice" value={form.avgBuyPrice} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Current Price
            <input required type="number" min="0" step="0.01" name="currentPrice" value={form.currentPrice} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600">
            <input type="checkbox" name="watchlist" checked={form.watchlist} onChange={handleChange} />
            Add to watchlist
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Investment</button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Coins, Plus, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  createDividend,
  deleteDividend,
  getApiErrorMessage,
  getDividendTotal,
  getDividends,
} from '../services/portfolioService'
import { currency } from '../utils/formatters'

const emptyForm = {
  ticker: '',
  dividendPerShare: '',
  sharesHeld: 1,
  dividendDate: '',
}

function DividendModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) setForm(emptyForm)
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'sharesHeld' ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      dividendPerShare: parseFloat(form.dividendPerShare),
      sharesHeld: parseInt(form.sharesHeld, 10),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Record Dividend</h3>
            <p className="text-sm text-slate-500">Save a dividend payment for one holding.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Ticker
            <input required name="ticker" value={form.ticker} onChange={handleChange} placeholder="e.g. AAPL" className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm uppercase" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Dividend per Share ($)
            <input required type="number" min="0.01" step="0.01" name="dividendPerShare" value={form.dividendPerShare} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Shares Held
            <input required type="number" min="1" name="sharesHeld" value={form.sharesHeld} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Dividend Date
            <input required type="date" name="dividendDate" value={form.dividendDate} onChange={handleChange} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Dividend</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dividends() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [tickerFilter, setTickerFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const load = async (ticker = '') => {
    try {
      setLoading(true)
      setError(null)
      const [rows, totalResponse] = await Promise.all([
        getDividends(ticker.trim() || undefined),
        getDividendTotal(),
      ])
      setItems(rows)
      setTotal(Number(totalResponse?.totalDividendsReceived || 0))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load dividends.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalFromRows = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.totalDividend || 0), 0),
    [items],
  )

  const handleApplyFilter = () => {
    load(tickerFilter)
  }

  const handleCreate = async (payload) => {
    try {
      await createDividend(payload)
      await load(tickerFilter)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save dividend.'))
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteDividend(confirmDeleteId)
      setConfirmDeleteId(null)
      await load(tickerFilter)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete dividend.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Dividends (All Holdings)</p>
            <Coins size={18} className="text-slate-400" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{currency.format(total)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Visible Rows Total</p>
            <Coins size={18} className="text-slate-400" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{currency.format(totalFromRows)}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dividends</h2>
            <p className="text-sm text-slate-500">Record, filter, and manage dividend payments.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <Plus size={15} /> Add Dividend
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-2">
          <label className="text-sm font-medium text-slate-700">
            Filter by ticker
            <input
              value={tickerFilter}
              onChange={(e) => setTickerFilter(e.target.value)}
              placeholder="e.g. AAPL"
              className="mt-1 w-52 rounded-2xl border border-slate-200 px-3 py-2 text-sm uppercase"
            />
          </label>
          <button onClick={handleApplyFilter} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Apply</button>
          <button onClick={() => { setTickerFilter(''); load('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Clear</button>
        </div>

        {loading && <p className="py-10 text-center text-sm text-slate-500">Loading dividends...</p>}
        {error && <p className="py-10 text-center text-sm text-rose-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Ticker', 'Dividend/Share', 'Shares Held', 'Total Dividend', 'Dividend Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No dividends found.</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.ticker}</td>
                    <td className="px-4 py-3 text-slate-600">{currency.format(Number(item.dividendPerShare || 0))}</td>
                    <td className="px-4 py-3 text-slate-600">{item.sharesHeld}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{currency.format(Number(item.totalDividend || 0))}</td>
                    <td className="px-4 py-3 text-slate-600">{item.dividendDate}</td>
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

      <DividendModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
      <ConfirmDialog isOpen={Boolean(confirmDeleteId)} title="Delete dividend" message="This will remove the dividend record permanently." onCancel={() => setConfirmDeleteId(null)} onConfirm={handleConfirmDelete} />
    </div>
  )
}


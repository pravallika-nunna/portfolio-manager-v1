import { Plus, Trash2, X } from 'lucide-react'
import AsyncState from '../components/AsyncState'
import ConfirmDialog from '../components/ConfirmDialog'
import DataTableShell from '../components/DataTableShell'
import PageCard from '../components/PageCard'
import RefreshAction from '../components/RefreshAction'
import SectionHeader from '../components/SectionHeader'
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
const TICKER_PATTERN = /^[A-Za-z.]{1,10}$/

function validateTransactionForm(form) {
  const errors = {}
  if (!form.ticker?.trim()) {
    errors.ticker = 'Please enter a ticker symbol.'
  } else if (!TICKER_PATTERN.test(form.ticker.trim())) {
    errors.ticker = 'Use letters or dot only, up to 10 characters.'
  }
  if (!form.assetType) {
    errors.assetType = 'Please select an asset type.'
  }
  if (!form.transactionType) {
    errors.transactionType = 'Please select a transaction type.'
  }
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) {
    errors.quantity = 'Quantity must be a whole number of at least 1.'
  }
  if (form.pricePerUnit === '' || Number(form.pricePerUnit) <= 0) {
    errors.pricePerUnit = 'Price per unit must be greater than 0.'
  }
  if (!form.transactionDate) {
    errors.transactionDate = 'Please select a transaction date.'
  }
  return errors
}

function TransactionModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm)
      setErrors({})
      setSubmitError('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null
  const dialogTitleId = 'transaction-modal-title'
  const dialogDescriptionId = 'transaction-modal-description'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateTransactionForm(form)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const ok = await onSubmit({
      ...form,
      ticker: form.ticker.trim().toUpperCase(),
      pricePerUnit: parseFloat(form.pricePerUnit),
      quantity: parseInt(form.quantity, 10),
    })
    setIsSubmitting(false)

    if (ok) {
      onClose()
      return
    }
    setSubmitError('We could not save this transaction. Please check the details and try again.')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 id={dialogTitleId} className="text-xl font-semibold text-slate-900">Record Transaction</h3>
            <p id={dialogDescriptionId} className="text-sm text-slate-500">Log a buy or sell trade.</p>
          </div>
          <button type="button" aria-label="Close transaction form" disabled={isSubmitting} onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
        </div>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Ticker
            <input required name="ticker" value={form.ticker} onChange={handleChange} placeholder="e.g. AAPL" className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm uppercase ${errors.ticker ? 'border-rose-300' : 'border-slate-200'}`} />
            {errors.ticker ? <p className="mt-1 text-xs text-rose-500">{errors.ticker}</p> : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Asset Type
            <select name="assetType" value={form.assetType} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.assetType ? 'border-rose-300' : 'border-slate-200'}`}>
              {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.assetType ? <p className="mt-1 text-xs text-rose-500">{errors.assetType}</p> : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Type
            <select name="transactionType" value={form.transactionType} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.transactionType ? 'border-rose-300' : 'border-slate-200'}`}>
              {TX_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.transactionType ? <p className="mt-1 text-xs text-rose-500">{errors.transactionType}</p> : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input required type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.quantity ? 'border-rose-300' : 'border-slate-200'}`} />
            {errors.quantity ? <p className="mt-1 text-xs text-rose-500">{errors.quantity}</p> : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Price per Unit ($)
            <input required type="number" min="0.01" step="0.01" name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.pricePerUnit ? 'border-rose-300' : 'border-slate-200'}`} />
            {errors.pricePerUnit ? <p className="mt-1 text-xs text-rose-500">{errors.pricePerUnit}</p> : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Transaction Date
            <input required type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.transactionDate ? 'border-rose-300' : 'border-slate-200'}`} />
            {errors.transactionDate ? <p className="mt-1 text-xs text-rose-500">{errors.transactionDate}</p> : null}
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Notes (optional)
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          {submitError ? <p role="alert" className="sm:col-span-2 text-sm text-rose-500">{submitError}</p> : null}
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Save Transaction</button>
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
      setError(getApiErrorMessage(err, 'We could not load your transactions right now.'))
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
      return true
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not save this transaction right now.'))
      return false
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTransaction(confirmDeleteId)
      setConfirmDeleteId(null)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not delete this transaction right now.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageCard className="p-5">
        <SectionHeader
          title="Transactions"
          description="Buy and sell history with current market comparison."
          countLabel={`${items.length} records`}
          actions={(
            <>
              <RefreshAction onClick={() => loadPrices(items)} loading={priceLoading} label="Refresh Prices" />
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <Plus size={15} /> Record Trade
              </button>
            </>
          )}
        />

        <AsyncState loading={loading} error={error} loadingMessage="Loading transactions..." onRetry={load} />

        {!loading && !error && (
          <DataTableShell
            headers={['Ticker', 'Type', 'Asset', 'Quantity', 'Price/Unit', 'Live Price', 'Diff', 'Total Value', 'Date', 'Actions']}
            hasRows={rows.length > 0}
            emptyMessage="No transactions yet. Record your first trade to see it here."
            colSpan={10}
          >
            {rows.map((item) => (
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
                  <button type="button" aria-label={`Delete transaction for ${item.ticker} on ${item.transactionDate}`} onClick={() => setConfirmDeleteId(item.id)} className="rounded-xl border border-rose-100 p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </DataTableShell>
        )}
      </PageCard>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} />
      <ConfirmDialog isOpen={Boolean(confirmDeleteId)} title="Delete transaction" message="This will permanently remove this transaction record." onCancel={() => setConfirmDeleteId(null)} onConfirm={handleConfirmDelete} />
    </div>
  )
}

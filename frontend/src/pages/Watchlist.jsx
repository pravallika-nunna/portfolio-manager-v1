import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import AsyncState from '../components/AsyncState'
import ConfirmDialog from '../components/ConfirmDialog'
import InfoTooltip from '../components/InfoTooltip'
import PageCard from '../components/PageCard'
import RefreshAction from '../components/RefreshAction'
import SectionHeader from '../components/SectionHeader'
import {
  addToWatchlist,
  getApiErrorMessage,
  getPrice,
  getWatchlist,
  removeFromWatchlist,
} from '../services/portfolioService'
import { currency, formatPercent } from '../utils/formatters'
import { tickerCatalog } from '../data/tickerCatalog'

const ASSET_TYPES = ['STOCK', 'BOND', 'CRYPTO']
const emptyForm = { ticker: '', assetType: 'STOCK' }
const TICKER_PATTERN = /^[A-Za-z.]{1,10}$/

function validateWatchlistForm(form) {
  const errors = {}
  if (!form.ticker?.trim()) {
    errors.ticker = 'Please enter a ticker symbol.'
  } else if (!TICKER_PATTERN.test(form.ticker.trim())) {
    errors.ticker = 'Use letters or dot only, up to 10 characters.'
  }
  if (!form.assetType) {
    errors.assetType = 'Please select an asset type.'
  }
  return errors
}

function AddWatchlistModal({ isOpen, mode = 'add', initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [lookup, setLookup] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setForm({ ticker: initialData.ticker, assetType: initialData.assetType })
      const match = tickerCatalog.find((item) => item.ticker === initialData.ticker)
      setLookup(match?.name || initialData.ticker)
    } else {
      setForm(emptyForm)
      setLookup('')
    }
    setErrors({})
    setSubmitError('')
    setIsSubmitting(false)
  }, [isOpen, initialData])

  const options = useMemo(() => {
    const query = lookup.trim().toLowerCase()
    if (!query) return tickerCatalog.slice(0, 8)

    return tickerCatalog
      .filter((item) => `${item.ticker} ${item.name} ${item.assetType}`.toLowerCase().includes(query))
      .slice(0, 8)
  }, [lookup])

  if (!isOpen) return null
  const dialogTitleId = mode === 'edit' ? 'edit-watchlist-title' : 'add-watchlist-title'
  const dialogDescriptionId = mode === 'edit' ? 'edit-watchlist-description' : 'add-watchlist-description'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const selectOption = (item) => {
    setForm((prev) => ({ ...prev, ticker: item.ticker, assetType: item.assetType }))
    setLookup(item.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateWatchlistForm(form)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const ok = await onSubmit({ ...form, ticker: form.ticker.trim().toUpperCase() })
    setIsSubmitting(false)
    if (ok) {
      onClose()
      return
    }
    setSubmitError('We could not save this watchlist item. Please review and try again.')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 id={dialogTitleId} className="text-xl font-semibold text-slate-900">{mode === 'edit' ? 'Edit Watchlist Item' : 'Add to Watchlist'}</h3>
            <p id={dialogDescriptionId} className="text-sm text-slate-500">Search by company name or ticker symbol.</p>
          </div>
          <button type="button" aria-label="Close watchlist form" disabled={isSubmitting} onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              Find ticker
              <InfoTooltip title="Find ticker" description="Search by company or asset name, then pick a ticker to auto-fill the form." />
            </span>
            <div className="relative mt-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                placeholder="e.g. Amazon, Apple, Bitcoin"
                className="w-full rounded-2xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </label>
          <div className="mt-2 max-h-44 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {options.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate-500">No matches. You can still enter ticker manually below.</p>
            ) : (
              options.map((item) => (
                <button
                  key={item.ticker}
                  type="button"
                  onClick={() => selectOption(item)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm text-slate-700 hover:bg-white"
                >
                  <span>
                    <span className="font-semibold text-slate-900">{item.ticker}</span> - {item.name}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{item.assetType}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              Ticker
              <InfoTooltip title="Ticker symbol" description="Short market symbol for the asset you want to track." />
            </span>
            <input required name="ticker" value={form.ticker} onChange={handleChange} placeholder="e.g. AMZN" className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm uppercase ${errors.ticker ? 'border-rose-300' : 'border-slate-200'}`} />
            {errors.ticker ? <p className="mt-1 text-xs text-rose-500">{errors.ticker}</p> : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              Asset Type
              <InfoTooltip title="Asset type" description="Helps categorize your watchlist items for faster filtering and context." />
            </span>
            <select name="assetType" value={form.assetType} onChange={handleChange} className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${errors.assetType ? 'border-rose-300' : 'border-slate-200'}`}>
              {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.assetType ? <p className="mt-1 text-xs text-rose-500">{errors.assetType}</p> : null}
          </label>
          {submitError ? <p role="alert" className="text-sm text-rose-500">{submitError}</p> : null}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{mode === 'edit' ? 'Save Changes' : 'Add to Watchlist'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Watchlist() {
  const [items, setItems] = useState([])
  const [pricesByTicker, setPricesByTicker] = useState({})
  const [loading, setLoading] = useState(true)
  const [priceLoading, setPriceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const loadPrices = async (watchlist) => {
    if (!watchlist.length) {
      setPricesByTicker({})
      return
    }

    setPriceLoading(true)
    const responses = await Promise.allSettled(watchlist.map((item) => getPrice(item.ticker)))
    const next = {}

    watchlist.forEach((item, index) => {
      const result = responses[index]
      if (result.status === 'fulfilled') {
        next[item.ticker] = result.value
      }
    })

    setPricesByTicker(next)
    setPriceLoading(false)
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const watchlist = await getWatchlist()
      setItems(watchlist)
      await loadPrices(watchlist)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not load your watchlist right now.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openAddModal = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSave = async (form) => {
    try {
      if (!editingItem) {
        await addToWatchlist(form)
        await load()
        return true
      }

      // Backend has no update endpoint for watchlist, so replace item safely.
      const sameTicker = editingItem.ticker === form.ticker
      const sameAsset = editingItem.assetType === form.assetType
      if (sameTicker && sameAsset) {
        return true
      }

      await addToWatchlist(form)
      await removeFromWatchlist(editingItem.id)
      await load()
      return true
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not save this watchlist item right now.'))
      return false
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await removeFromWatchlist(confirmDeleteId)
      setConfirmDeleteId(null)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not remove this ticker from your watchlist right now.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageCard className="p-5">
        <SectionHeader
          title="Watchlist"
          description="Instruments you are tracking with live price snapshots."
          countLabel={`${items.length} tracked`}
          info={{
            title: 'Watchlist',
            description: 'Track assets without adding them to your portfolio so you can monitor price movement first.',
          }}
          actions={(
            <>
              <RefreshAction onClick={() => loadPrices(items)} loading={priceLoading} label="Refresh Prices" />
              <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <Plus size={15} /> Add Ticker
              </button>
            </>
          )}
        />

        <AsyncState loading={loading} error={error} loadingMessage="Loading watchlist..." onRetry={load} />

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400"><Eye size={28} /></div>
            <p className="font-medium text-slate-700">Your watchlist is empty</p>
            <p className="mt-1 text-sm text-slate-500">Add a ticker above to start tracking prices and daily changes.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const live = pricesByTicker[item.ticker]
              const isPositive = Number(live?.changePercent || 0) >= 0

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.ticker}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{item.assetType}</span>
                        <span className="text-xs text-slate-400">Added {item.addedDate}</span>
                      </div>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      <button type="button" aria-label={`Edit watchlist item ${item.ticker}`} onClick={() => openEditModal(item)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">
                        <Pencil size={14} />
                      </button>
                      <button type="button" aria-label={`Remove ${item.ticker} from watchlist`} onClick={() => setConfirmDeleteId(item.id)} className="rounded-xl border border-rose-100 p-2 text-rose-500 hover:bg-rose-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-slate-400">Live Price</p>
                        <InfoTooltip title="Live price" description="Latest available market price for this watchlist asset." />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{live?.currentPrice ? currency.format(live.currentPrice) : '—'}</p>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {live?.changePercent !== undefined && live?.changePercent !== null ? formatPercent(live.changePercent) : '—'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PageCard>

      <AddWatchlistModal
        isOpen={isModalOpen}
        mode={editingItem ? 'edit' : 'add'}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog isOpen={Boolean(confirmDeleteId)} title="Remove from watchlist" message="This will remove this ticker from your watchlist." onCancel={() => setConfirmDeleteId(null)} onConfirm={handleConfirmDelete} />
    </div>
  )
}

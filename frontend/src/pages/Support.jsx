import { useMemo, useState } from 'react'
import { ChevronDown, Clock3, ExternalLink, FileText, LifeBuoy, MailQuestion, MessageSquareText, Search } from 'lucide-react'
import { faqItems } from '../data/faq'
import { supportChannels } from '../data/supportChannel'

const ICON_BY_CHANNEL = {
  mail: MailQuestion,
  chat: MessageSquareText,
  docs: FileText,
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <Icon size={18} className="text-slate-400" />
      </div>
      <p className="mt-3 text-xl font-semibold text-slate-800">{value}</p>
    </div>
  )
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqs, setOpenFaqs] = useState([])

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return faqItems
    return faqItems.filter((item) => (
      `${item.category} ${item.question} ${item.answer}`.toLowerCase().includes(query)
    ))
  }, [searchQuery])

  const groupedFaqs = useMemo(() => {
    const preferredOrder = ['Getting Started', 'Data & Security', 'Tax & Reports']
    const grouped = filteredFaqs.reduce((acc, item) => {
      const category = item.category || 'General'
      acc[category] = [...(acc[category] || []), item]
      return acc
    }, {})

    return preferredOrder
      .filter((category) => grouped[category]?.length)
      .map((category) => ({ category, items: grouped[category] }))
      .concat(
        Object.keys(grouped)
          .filter((category) => !preferredOrder.includes(category))
          .map((category) => ({ category, items: grouped[category] })),
      )
  }, [filteredFaqs])

  const toggleFaq = (faqKey) => {
    setOpenFaqs((current) => {
      if (current.includes(faqKey)) {
        return current.filter((item) => item !== faqKey)
      }
      return [faqKey, ...current].slice(0, 2)
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Available FAQs" value={String(faqItems.length)} icon={LifeBuoy} />
        <StatCard title="Support Channels" value={String(supportChannels.length)} icon={MessageSquareText} />
        <StatCard title="Typical Resolution" value="< 24 hours" icon={Clock3} />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-600">Quick answers to common questions about holdings, pricing, and portfolio workflows.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {filteredFaqs.length} items
          </div>
        </div>
        <div className="mb-5">
          <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input
              id="faq-search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search FAQs by keyword"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {groupedFaqs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">No results for "{searchQuery.trim()}"</p>
            <p className="mt-1 text-sm text-slate-600">Try a different keyword or contact support below.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedFaqs.map(({ category, items }) => (
              <section key={category} className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{category}</p>
                <div className="space-y-2.5">
                  {items.map((item, index) => {
                    const faqKey = `${category}-${item.question}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    const isOpen = openFaqs.includes(faqKey)
                    const buttonId = `faq-button-${faqKey}`
                    const panelId = `faq-panel-${faqKey}`
                    return (
                      <div key={faqKey} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <button
                          id={buttonId}
                          type="button"
                          onClick={() => toggleFaq(faqKey)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span className="text-sm font-semibold">{item.question}</span>
                          <ChevronDown size={16} className={`shrink-0 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        {isOpen ? (
                          <div id={panelId} role="region" aria-labelledby={buttonId} className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {item.answer}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Contact Support</h3>
            <p className="text-sm text-slate-600">Choose the best channel based on your issue type.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {supportChannels.length} channels
          </div>
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {supportChannels.map(({ title, description, value, icon, href }) => {
            const Icon = ICON_BY_CHANNEL[icon] || MailQuestion
            const isDocumentation = icon === 'docs'
            return (
            <a
              key={title}
              href={href}
              target={isDocumentation ? '_blank' : undefined}
              rel={isDocumentation ? 'noreferrer noopener' : undefined}
              className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    {value}
                    {isDocumentation ? <ExternalLink size={14} /> : null}
                  </p>
                </div>
              </div>
            </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

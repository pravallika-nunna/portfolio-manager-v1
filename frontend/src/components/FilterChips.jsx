export default function FilterChips({ options, activeValue, onChange, formatLabel }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === activeValue
        const label = formatLabel ? formatLabel(option) : option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

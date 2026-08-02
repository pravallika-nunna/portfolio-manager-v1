import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const rangeOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All Time']

export default function PortfolioChart({ data, activeRange, onRangeChange }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Portfolio Performance</h3>
          <p className="text-sm text-slate-500">Trend view for your current holdings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onRangeChange(option)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeRange === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

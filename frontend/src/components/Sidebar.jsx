import { LayoutDashboard, Landmark, ArrowLeftRight, Eye, UserCircle, Calculator, BarChart3, Coins, LifeBuoy } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Holdings', path: '/holdings', icon: Landmark },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Watchlist', path: '/watchlist', icon: Eye },
  { name: 'Dividends', path: '/dividends', icon: Coins },
  { name: 'Tax', path: '/tax', icon: Calculator },
  { name: 'Profile', path: '/profile', icon: UserCircle },
  { name: 'Support', path: '/support', icon: LifeBuoy },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col justify-between rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Portfolio</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Manager</h2>
        </div>

        <nav className="space-y-2">
          {navigationItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')
              }
            >
              <Icon size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Portfolio Pulse</p>
        <p className="mt-2 text-sm text-slate-600">Live insights from your backend dashboard.</p>
      </div>
    </aside>
  )
}

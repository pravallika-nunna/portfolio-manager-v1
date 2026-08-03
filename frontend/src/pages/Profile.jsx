import { UserCircle2, Server, Database, Globe } from 'lucide-react'

const INFO_ROWS = [
  { label: 'Backend', value: 'Spring Boot 4 · http://localhost:8080', icon: Server },
  { label: 'Database', value: 'H2 in-memory · resets on restart', icon: Database },
  { label: 'API Docs', value: 'http://localhost:8080/swagger-ui.html', icon: Globe },
]

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
            <UserCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Portfolio Manager</h2>
            <p className="text-sm text-slate-500">Internal training project · v1.0.0</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <h3 className="mb-4 text-base font-semibold text-slate-900">App Info</h3>
        <div className="space-y-3">
          {INFO_ROWS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="mt-0.5 rounded-xl bg-white border border-slate-200 p-2 text-slate-500">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Tech Stack</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { label: 'Frontend', items: ['React 19', 'Vite 8', 'Tailwind CSS', 'Recharts', 'Axios', 'React Router'] },
            { label: 'Backend', items: ['Java 25', 'Spring Boot 4', 'Spring Data JPA', 'H2 / MySQL', 'Lombok', 'springdoc-openapi'] },
          ]).map(({ label, items }) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

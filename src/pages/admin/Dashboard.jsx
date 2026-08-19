import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageSearch, AlertTriangle, Banknote, CheckCircle2, Activity, Users, Eye } from 'lucide-react'
import { db } from '../../lib/db'

const STAT_CARDS = [
  { key: 'total', label: 'Total orders', icon: PackageSearch },
  { key: 'unpaid', label: 'Unpaid', icon: Banknote },
  { key: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [traffic, setTraffic] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      db.getDashboardStats(),
      db.getTrafficStats()
    ]).then(([orderData, trafficData]) => {
      if (active) {
        setStats(orderData)
        setTraffic(trafficData)
      }
    }).catch((err) => console.warn('[dashboard]', err.message))
    
    return () => { active = false }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Dashboard</h1>
        <Link
          to="/admin/orders/new"
          className="rounded-md px-4 py-2 font-body text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-orange)' }}
        >
          + New order
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded-xl border border-[var(--color-line)] bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md" style={{ background: '#4D148C14', color: 'var(--color-brand-purple)' }}>
              <Icon size={18} />
            </span>
            <p className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)]">
              {stats ? stats[key] : '—'}
            </p>
            <p className="font-body text-sm text-[var(--color-ink-soft)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Traffic Analytics Section */}
      <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mt-12 mb-6">Website Traffic</h2>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-blue-500" />
            <p className="font-body text-sm text-[var(--color-ink-soft)]">Total Page Views</p>
          </div>
          <p className="font-display text-2xl font-bold text-[var(--color-ink)]">
            {traffic ? traffic.totalViews : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <Eye size={18} className="text-green-500" />
            <p className="font-body text-sm text-[var(--color-ink-soft)]">Views Today</p>
          </div>
          <p className="font-display text-2xl font-bold text-[var(--color-ink)]">
            {traffic ? traffic.viewsToday : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users size={18} className="text-purple-500" />
            <p className="font-body text-sm text-[var(--color-ink-soft)]">Unique Visitors</p>
          </div>
          <p className="font-display text-2xl font-bold text-[var(--color-ink)]">
            {traffic ? traffic.uniqueVisitors : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-line)] bg-gray-50">
          <h3 className="font-display font-semibold text-[var(--color-ink)]">Top Pages</h3>
        </div>
        <div className="p-0">
          {traffic?.topPages?.length > 0 ? (
            <table className="w-full text-left">
              <tbody className="divide-y divide-[var(--color-line)]">
                {traffic.topPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-body text-sm text-[var(--color-ink)]">{page.path === '/' ? '/ (Home)' : page.path}</td>
                    <td className="px-5 py-3 font-body text-sm font-semibold text-[var(--color-ink)] text-right">{page.views} views</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="p-8 text-center text-sm text-gray-400">No traffic data available yet.</div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-[var(--color-line)] p-8 text-center">
        <p className="font-body text-sm text-[var(--color-ink-soft)]">
          Recent orders / activity feed goes here once Orders (Section 7) is built out.
        </p>
      </div>
    </div>
  )
}

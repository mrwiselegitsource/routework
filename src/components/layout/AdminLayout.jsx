import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PackageSearch,
  PlusCircle,
  Users,
  ScrollText,
  LogOut,
  PackageSearch as LogoMark,
} from 'lucide-react'
import { auth, backendMode } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'

import {
  Map,
  MapPin,
  Banknote,
  Users2,
  PlayCircle
} from 'lucide-react'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: PackageSearch },
  { to: '/admin/orders/new', label: 'New Order', icon: PlusCircle },
  { to: '/admin/customers', label: 'Customers', icon: Users2 },
  { to: '/admin/payments', label: 'Payments', icon: Banknote },
  { to: '/admin/regions', label: 'Regions', icon: Map, adminOnly: true },
  { to: '/admin/pickup-points', label: 'Pickup Points', icon: MapPin, adminOnly: true },
  { to: '/admin/pricing', label: 'Pricing', icon: Banknote, adminOnly: true },
  { to: '/admin/automations', label: 'Automations', icon: PlayCircle, adminOnly: true },
  { to: '/admin/news', label: 'News', icon: ScrollText },
  { to: '/admin/staff', label: 'Staff', icon: Users, adminOnly: true },
  { to: '/admin/activity', label: 'Activity Log', icon: ScrollText, adminOnly: true },
]

// The wrapper for every /admin/* page except /admin/login. Actual access
// control is enforced by RequireAuth (Section 4/10 — no admin page should
// be reachable without a valid Supabase Auth session).
export default function AdminLayout() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  async function handleLogout() {
    await auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-white sm:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md text-white"
            style={{ background: 'var(--color-brand-purple)' }}
          >
            <LogoMark size={18} strokeWidth={2.25} />
          </span>
          <span className="font-display text-base font-bold text-[var(--color-ink)]">
            RouteWorks
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {ADMIN_LINKS.filter((l) => !l.adminOnly || profile?.role === 'admin').map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-brand-purple)]/10 text-[var(--color-brand-purple)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/50 hover:text-[var(--color-ink)]'
                }`
              }
            >
              <link.icon size={17} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-line)] px-3 py-4">
          {backendMode === 'local' && (
            <div className="mb-3 rounded-md px-3 py-1.5 font-body text-[11px] font-semibold" style={{ background: '#B4530914', color: 'var(--color-status-pending)' }}>
              Local test mode — data lives in this browser only
            </div>
          )}
          <div className="mb-2 px-3 font-body text-xs text-[var(--color-ink-soft)]">
            {profile?.name ?? 'Signed in staff'}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-body text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/50 hover:text-[var(--color-ink)]"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

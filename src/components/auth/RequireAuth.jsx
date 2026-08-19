import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Gate for every /admin/* route (Section 10 checklist: "no admin page
// reachable without a valid Supabase Auth session"). `adminOnly` adds the
// role check used by /admin/staff and /admin/activity.
export default function RequireAuth({ children, adminOnly = false }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-body text-sm text-[var(--color-ink-soft)]">
        Checking your session…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}

import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function RequireCustomerAuth({ children }) {
  const { session, profile, loading } = useCustomerAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-body text-sm text-[var(--color-ink-soft)]">
        Checking your session…
      </div>
    )
  }

  // If there's no session or the profile didn't load (e.g. they are a staff user, not a customer), deny access
  if (!session || !profile) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search }} />
  }

  return children
}

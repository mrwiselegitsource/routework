import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function RequireCustomerAuth({ children }) {
  const { session, loading } = useCustomerAuth()
  const location = useLocation()

  // Still resolving session from Supabase — show a spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0033a0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading your account…</p>
        </div>
      </div>
    )
  }

  // No active session — redirect to login, preserving the intended destination
  if (!session?.user) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search }} />
  }

  return children
}

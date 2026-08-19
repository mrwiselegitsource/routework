import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PackageSearch, Loader2 } from 'lucide-react'
import { auth, backendMode } from '../../lib/db'

// Rule #4: every staff/admin account has its own login — no shared
// passcode. Supabase Auth (email/password) handles this directly.
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: signInError } = await auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-line)] bg-white p-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ background: 'var(--color-brand-purple)' }}>
            <PackageSearch size={18} />
          </span>
          <span className="font-display text-lg font-bold text-[var(--color-ink)]">RouteWorks</span>
        </div>
        <h1 className="mt-6 font-display text-xl font-bold text-[var(--color-ink)]">Staff login</h1>
        <p className="mt-1 font-body text-sm text-[var(--color-ink-soft)]">Sign in with your own RouteWorks account.</p>

        {backendMode === 'local' && (
          <div className="mt-4 rounded-md px-3 py-2.5 font-body text-xs" style={{ background: '#B4530914', color: 'var(--color-status-pending)' }}>
            <p className="font-semibold">Local test mode — no Supabase project connected.</p>
            <p className="mt-1">Try <strong>admin@routeworks.test</strong> / <strong>admin123</strong> (admin) or <strong>staff@routeworks.test</strong> / <strong>staff123</strong> (staff).</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="font-body text-xs font-semibold text-[var(--color-ink)]">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
              style={{ borderColor: 'var(--color-line)' }}
            />
          </div>
          <div>
            <label htmlFor="password" className="font-body text-xs font-semibold text-[var(--color-ink)]">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-body text-sm"
              style={{ borderColor: 'var(--color-line)' }}
            />
          </div>
          {error && <p className="font-body text-sm" style={{ color: 'var(--color-status-exception)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--color-brand-orange)' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}

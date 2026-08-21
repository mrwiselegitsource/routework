import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/db'

// Wraps whichever backend is active (local or Supabase — see lib/db.js)
// behind one shape: session + the matching profile row (role, name, active
// flag — Section 4). Every /admin/* page reads from this instead of
// querying a backend directly, so there's one place that knows "who is
// logged in and what can they do," regardless of backend.
const AuthContext = createContext({ session: null, profile: null, loading: true })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: listener } = auth.onAuthStateChange((newSession) => {
      setSession(newSession)
      if (newSession) {
        setLoading(true)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    let active = true
    auth.getProfile(session.user.id).then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.warn('[auth] could not load profile', error.message)
        setLoading(false)
        return
      }
      setProfile(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

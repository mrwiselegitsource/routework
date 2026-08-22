import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/db'

const CustomerAuthContext = createContext({ session: null, profile: null, loading: true })

export function CustomerAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Load initial session on mount
  useEffect(() => {
    let active = true

    auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data?.session ?? null)
      // If no session, we're done loading
      if (!data?.session) setLoading(false)
    })

    // Listen for login/logout events
    const { data: listener } = auth.onCustomerAuthStateChange((newSession) => {
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
      listener?.subscription?.unsubscribe()
    }
  }, [])

  // 2. When session changes, load the customer profile
  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      setLoading(false)
      return
    }

    let active = true
    auth.getCustomerProfile(session.user.id).then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        console.warn('[customer auth] profile not found:', error.message)
        // Ensure customer profile exists in database to avoid foreign key constraints
        try {
          const { supabase } = await import('../lib/db');
          await supabase.from('customers').insert({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'New Customer',
            email: session.user.email || '',
          });
        } catch (err) {
          console.error('[customer auth] failed to create fallback profile', err);
        }
        // Set a minimal profile so session is still considered valid
        setProfile({ id: session.user.id, email: session.user.email, name: session.user.email?.split('@')[0] || 'New Customer' })
      } else {
        setProfile(data)
      }
      setLoading(false)
    })

    return () => { active = false }
  }, [session])

  return (
    <CustomerAuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext)
}

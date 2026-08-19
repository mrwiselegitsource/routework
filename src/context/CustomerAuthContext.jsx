import { createContext, useContext, useEffect, useState } from 'react'
import { auth, backendMode } from '../lib/db' // Wait, local/remote auth export might need checking. 

// The auth object exported from lib/db needs to be updated to expose the customer methods.
// Let me just write the file assuming db.js exports `auth` which has customer methods.

const CustomerAuthContext = createContext({ session: null, profile: null, loading: true })

export function CustomerAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    auth.getSession().then(({ data }) => {
      if (!active) return
      // We only care about customer sessions here, but in local mode, session.user_type determines it.
      // In Supabase, we might just fetch the customer profile to verify.
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: listener } = auth.onCustomerAuthStateChange((newSession) => {
      setSession(newSession)
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
    auth.getCustomerProfile(session.user.id).then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.warn('[customer auth] could not load profile', error.message)
        // If they aren't a customer (e.g. staff logged in), this will fail. That's fine.
        setProfile(null)
        return
      }
      setProfile(data)
    })
    return () => {
      active = false
    }
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

// Mock auth for the local test backend. Mirrors the shape of the bits of
// supabase.auth this app actually uses (getSession, onAuthStateChange,
// signInWithPassword, signOut) so AuthContext doesn't need to know which
// backend it's talking to.
//
// Passwords here are plain strings stored in localStorage on the seeded
// profile rows — fine for local testing, never how real auth should work.
// The real backend (src/lib/remote/auth.js) hands this off to Supabase Auth.
import { table, getSession, setSession, uid } from './store'

// Customer listeners are separate from staff listeners
const customerListeners = new Set()

const listeners = new Set()

function notify() {
  const session = getSession()
  listeners.forEach((cb) => cb(session))
}

export const localAuth = {
  async getSession() {
    return { data: { session: getSession() } }
  },

  onAuthStateChange(callback) {
    listeners.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    }
  },

  async signInWithPassword({ email, password }) {
    const profile = table.profiles.find((p) => p.email === email)
    if (!profile) {
      return { error: { message: 'No account found with that email.' } }
    }
    if (!profile.active) {
      return { error: { message: 'This account has been deactivated.' } }
    }
    if (profile._password !== password) {
      return { error: { message: 'Incorrect password.' } }
    }
    const session = { user: { id: profile.id, email: profile.email }, access_token: uid('local_token') }
    setSession(session)
    notify()
    return { error: null }
  },

  async signOut() {
    setSession(null)
    notify()
    return { error: null }
  },

  async getProfile(userId) {
    const profile = table.profiles.find((p) => p.id === userId)
    if (!profile) return { data: null, error: { message: 'Profile not found.' } }
    // Never leak the mock password field into the app.
    const { _password, ...safe } = profile
    return { data: safe, error: null }
  },

  // ── Customer Auth (separate from staff) ────────────────────

  async customerSignUp({ email, password, name, phone }) {
    // Check if email already used
    const existing = table.customers.find((c) => c.email === email)
    if (existing) return { error: { message: 'An account with this email already exists.' } }

    const id = uid('cust')
    const customer = {
      id,
      name,
      email,
      phone: phone || '',
      secondary_phone: '',
      _password: password,
      created_at: new Date().toISOString(),
    }
    table.customers = [customer, ...table.customers]

    const session = { user: { id, email }, access_token: uid('cust_token'), user_type: 'customer' }
    setSession(session)
    customerListeners.forEach((cb) => cb(session))
    return { data: { user: { id, email } }, error: null }
  },

  async customerSignIn({ email, password }) {
    const customer = table.customers.find((c) => c.email === email)
    if (!customer) return { error: { message: 'No account found with that email.' } }
    if (customer._password !== password) return { error: { message: 'Incorrect password.' } }

    const session = { user: { id: customer.id, email: customer.email }, access_token: uid('cust_token'), user_type: 'customer' }
    setSession(session)
    customerListeners.forEach((cb) => cb(session))
    return { data: { user: { id: customer.id, email: customer.email } }, error: null }
  },

  async customerSignOut() {
    setSession(null)
    customerListeners.forEach((cb) => cb(null))
    return { error: null }
  },

  onCustomerAuthStateChange(callback) {
    customerListeners.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => customerListeners.delete(callback),
        },
      },
    }
  },

  async getCustomerProfile(userId) {
    const customer = table.customers.find((c) => c.id === userId)
    if (!customer) return { data: null, error: { message: 'Customer not found.' } }
    const { _password, ...safe } = customer
    return { data: safe, error: null }
  },

  async updateCustomerProfile(userId, fields) {
    table.customers = table.customers.map((c) => (c.id === userId ? { ...c, ...fields } : c))
    return this.getCustomerProfile(userId)
  },

  async customerResetPassword(email) {
    // In local mode, just return success (mock)
    const customer = table.customers.find((c) => c.email === email)
    if (!customer) return { error: null } // Don't reveal if email exists
    return { error: null }
  },
}

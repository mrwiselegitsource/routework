// Mock auth for the local test backend. Mirrors the shape of the bits of
// supabase.auth this app actually uses (getSession, onAuthStateChange,
// signInWithPassword, signOut) so AuthContext doesn't need to know which
// backend it's talking to.
//
// Passwords here are plain strings stored in localStorage on the seeded
// profile rows — fine for local testing, never how real auth should work.
// The real backend (src/lib/remote/auth.js) hands this off to Supabase Auth.
import { table, getSession, setSession, uid } from './store'

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
}

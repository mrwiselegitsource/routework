// Supabase-backed auth, matching the same shape as src/lib/local/auth.js
// so AuthContext and RequireAuth can use either without caring which.
import { supabase } from '../supabaseClient'

export const remoteAuth = {
  async getSession() {
    return supabase.auth.getSession()
  },
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session))
  },
  async signInWithPassword({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  },
  async signOut() {
    return supabase.auth.signOut()
  },
  async getProfile(userId) {
    return supabase.from('profiles').select('*').eq('id', userId).single()
  },
}

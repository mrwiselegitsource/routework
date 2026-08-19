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

  // ── Customer Auth ──────────────────────────────────────

  async customerSignUp({ email, password, name, phone }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { data: null, error }
    // Create customer profile row
    if (data.user) {
      await supabase.from('customers').insert({
        id: data.user.id,
        name,
        email,
        phone: phone || '',
      })
    }
    return { data, error: null }
  },

  async customerSignIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  async customerSignOut() {
    return supabase.auth.signOut()
  },

  onCustomerAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session))
  },

  async getCustomerProfile(userId) {
    return supabase.from('customers').select('*').eq('id', userId).single()
  },

  async updateCustomerProfile(userId, fields) {
    const { data, error } = await supabase.from('customers').update(fields).eq('id', userId).select().single()
    if (error) return { data: null, error }
    return { data, error: null }
  },

  async customerResetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email)
  },
}

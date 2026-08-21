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
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
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

  async customerSignInWithOtp({ phone }) {
    return supabase.auth.signInWithOtp({ phone })
  },

  async customerVerifyOtp({ phone, token }) {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) return { data, error }

    // If verification succeeded and there's a user, ensure they have a customer profile
    if (data.user) {
      // Check if profile exists
      const { data: profile } = await supabase.from('customers').select('id').eq('id', data.user.id).single();
      if (!profile) {
        // Create basic profile if they just signed up via OTP
        await supabase.from('customers').insert({
          id: data.user.id,
          name: 'New Customer', // They can change this later in profile settings
          email: '',
          phone: phone,
        });
      }
    }
    return { data, error: null }
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

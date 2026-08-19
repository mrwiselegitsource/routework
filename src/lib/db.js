// Single facade the whole app talks to. If a real Supabase project is
// configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env), every
// call routes to src/lib/remote/*. Otherwise it routes to the
// localStorage-backed src/lib/local/* so the full app — admin CRUD,
// tracking, mock payment, everything — is testable with zero setup.
//
// Components only ever import { db, auth, backendMode } from here.
import { isSupabaseConfigured } from './supabaseClient'
import { localDb } from './local/db'
import { localAuth } from './local/auth'
import { remoteDb } from './remote/db'
import { remoteAuth } from './remote/auth'

export const backendMode = isSupabaseConfigured ? 'supabase' : 'local'

export const db = isSupabaseConfigured ? remoteDb : localDb
export const auth = isSupabaseConfigured ? remoteAuth : localAuth

if (!isSupabaseConfigured) {
  localDb.init()
}

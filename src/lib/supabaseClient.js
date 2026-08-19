// Central Supabase client. Every table/view in Section 4 & 8 of the build
// guide is read through this single client so RLS policies are the one
// source of truth for access control — no service-role key ever ships
// to the browser.
//
// `isSupabaseConfigured` is what src/lib/db.js checks to decide whether to
// talk to this client or fall back to the localStorage-backed mock in
// src/lib/local/ — see db.js for the switch.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.info(
    '[supabase] Not configured — running on the local (localStorage) test ' +
      'backend instead. Copy .env.example to .env and fill in a real ' +
      'Supabase project to switch over.'
  )
}

// A dummy well-formed URL keeps createClient() from throwing when no real
// project is configured; nothing ever actually calls out to it because
// db.js routes every query to the local backend in that case.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

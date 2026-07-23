import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
)

if (!supabaseConfigured) {
  console.warn(
    'Missing or invalid Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Fall back to a harmless placeholder URL so createClient never throws and
// crashes the whole app with a blank screen — the app shows a setup notice
// instead (see main.jsx) when supabaseConfigured is false.
export const supabase = createClient(
  supabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
)

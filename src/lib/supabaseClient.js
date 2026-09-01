import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your project URL and anon key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

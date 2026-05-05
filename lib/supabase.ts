import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Export a function to check if Supabase is configured (useful for debugging)
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


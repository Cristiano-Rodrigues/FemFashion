import { createClient } from '@supabase/supabase-js';

// Next.js env variables (NEXT_PUBLIC_ prefix for client-side access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cudntyjcoepmxhbcqeze.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_upG25f-ZEjFmTCTdVjnfMA_btYy2YYA';

// Helper to determine if Supabase config is active and correct
export const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey && !supabaseAnonKey.startsWith('sb_publishable_PLACEHOLDER');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

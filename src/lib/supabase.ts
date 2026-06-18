import { createClient } from '@supabase/supabase-js';

// Retrieve values from Vite env values, or fallback directly to user provided keys
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://cudntyjcoepmxhbcqeze.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_upG25f-ZEjFmTCTdVjnfMA_btYy2YYA';

// Helper to determine if Supabase config is active and correct
export const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey && !supabaseAnonKey.startsWith('sb_publishable_PLACEHOLDER');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

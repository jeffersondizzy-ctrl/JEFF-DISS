import { createClient } from '@supabase/supabase-js';

// Support both Node.js (process.env) and Vite (import.meta.env)
const supabaseUrl = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : null) || (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY) : null) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Supabase credentials missing in browser! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }
}

export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

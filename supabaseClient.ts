import { createClient } from '@supabase/supabase-js';

// Support both Node.js (process.env) and Vite (import.meta.env)
const rawUrl = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : null) || (import.meta as any).env?.VITE_SUPABASE_URL || '';
const rawKey = (typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY) : null) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Clean up potential "undefined" strings from environment injection
const supabaseUrl = rawUrl === 'undefined' ? '' : rawUrl;
const supabaseKey = rawKey === 'undefined' ? '' : rawKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing or invalid:', { 
    url: supabaseUrl ? 'Set' : 'Missing', 
    key: supabaseKey ? 'Set' : 'Missing' 
  });
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== '' && supabaseKey !== '');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

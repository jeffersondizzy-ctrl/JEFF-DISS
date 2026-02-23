import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Persistence will fall back to local files or memory.');
}

// Create client only if URL is provided to avoid crashing the server
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseKey) 
  : null as any;

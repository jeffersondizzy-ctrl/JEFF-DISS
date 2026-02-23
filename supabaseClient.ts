import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing!');
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
} else {
  console.log('✅ Supabase credentials detected. Initializing client...');
}

// Create client only if URL is provided to avoid crashing the server
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (supabase) {
  console.log('🚀 Supabase client initialized successfully.');
} else {
  console.error('❌ Failed to initialize Supabase client. Persistence will be limited to local memory.');
}

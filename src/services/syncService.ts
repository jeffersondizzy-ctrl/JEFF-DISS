import { supabase } from './supabaseClient';

export const syncToSupabase = async (key: string, content: any) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('app_persistence').upsert({
      key,
      content,
      updated_at: new Date()
    });
    if (error) console.error(`Supabase sync error for ${key}:`, error);
  } catch (err) {
    console.error(`Supabase sync exception for ${key}:`, err);
  }
};

export const loadFromSupabase = async (key: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('app_persistence').select('content').eq('key', key).single();
    if (data && !error) return data.content;
  } catch (err) {
    console.error(`Supabase load exception for ${key}:`, err);
  }
  return null;
};

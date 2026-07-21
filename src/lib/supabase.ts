import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: { headers: { 'x-client-info': 'scrubshop-web' } },
});

export function getGuestId(): string {
  const KEY = 'scrubshop_guest_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID?.() || 'guest-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(KEY, id);
  }
  return id;
}

export async function withGuestContext<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await supabase.rpc('set_config', {
      config_name: 'request.guest_id',
      config_value: getGuestId(),
      is_local: true,
    }).throwOnError();
  } catch { /* ignore */ }
  return fn();
}

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function getGuestId(): string {
  let id = localStorage.getItem('guest_id')
  if (!id) {
    id = 'guest_' + crypto.randomUUID()
    localStorage.setItem('guest_id', id)
  }
  return id
}

export async function withGuestContext<T>(fn: () => Promise<T>): Promise<T> {
  const guestId = getGuestId()
  await supabase.rpc('set_guest_id', { gid: guestId }).maybeSingle()
  return fn()
}

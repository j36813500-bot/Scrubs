import { supabase, getGuestId } from './supabase'
import type { Profile } from './types'

export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback: (session: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    ;(async () => callback(session))()
  })
  return () => data.subscription.unsubscribe()
}

export async function getUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  return data as Profile | null
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  return user?.role === 'admin'
}

export async function signUpCustomer(name: string, phone: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
    options: { data: { full_name: name, phone } },
  })
  if (error) return { error }
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name,
      phone,
      role: 'user',
    })
  }
  return { error: null }
}

export async function signInCustomer(phone: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ phone, password })
  return { error }
}

export async function signInAdmin(username: string, password: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('admin_username', username)
    .eq('role', 'admin')
    .maybeSingle()

  if (!profile) return { error: { message: 'المستخدم غير موجود' } }

  const phone = profile.phone || ''
  if (!phone) return { error: { message: 'لا يوجد رقم هاتف مرتبط' } }

  const { error } = await supabase.auth.signInWithPassword({ phone, password })
  if (error) return { error }
  return { error: null }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function updateProfile(updates: { full_name?: string; phone?: string; email?: string }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'غير مسجل' } }
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  return { error }
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

export async function uploadAvatar(file: File): Promise<{ url: string | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: null, error: 'غير مسجل' }
  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { url: null, error: error.message }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
  return { url: data.publicUrl, error: null }
}

export { getGuestId }

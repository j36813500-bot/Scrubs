import { supabase } from './supabase';

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'customer';
  admin_username: string | null;
  avatar_url: string | null;
};

let currentUser: AppUser | null = null;
const listeners = new Set<(u: AppUser | null) => void>();

export function onAuthChange(cb: (u: AppUser | null) => void) {
  listeners.add(cb);
  cb(currentUser);
  return () => { listeners.delete(cb); };
}

function emit() {
  listeners.forEach(cb => cb(currentUser));
}

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await loadProfile(session.user.id, session.user.email || '');
  }
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await loadProfile(session.user.id, session.user.email || '');
    } else {
      currentUser = null;
      emit();
    }
  });
}

async function loadProfile(userId: string, email: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, role, admin_username, avatar_url')
      .eq('id', userId)
      .single();
    currentUser = {
      id: userId,
      email,
      full_name: data?.full_name || '',
      phone: data?.phone || '',
      role: (data?.role as 'admin' | 'customer') || 'customer',
      admin_username: data?.admin_username || null,
      avatar_url: data?.avatar_url || null,
    };
  } catch {
    currentUser = { id: userId, email, full_name: '', phone: '', role: 'customer', admin_username: null, avatar_url: null };
  }
  emit();
}

export function getUser(): AppUser | null {
  return currentUser;
}

export function isAdmin(): boolean {
  return currentUser?.role === 'admin';
}

export async function signUpCustomer(full_name: string, phone: string, password: string): Promise<{ error: string | null }> {
  const email = `${phone}@scrubshop.app`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, phone, role: 'customer' } },
  });
  if (error) return { error: error.message };
  if (data.user) {
    await supabase.auth.signInWithPassword({ email, password });
  }
  return { error: null };
}

export async function signInCustomer(phone: string, password: string): Promise<{ error: string | null }> {
  const email = `${phone}@scrubshop.app`;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signInAdmin(username: string, password: string): Promise<{ error: string | null }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('admin_username', username)
    .eq('role', 'admin')
    .single();
  if (!profile) return { error: 'اسم المستخدم غير موجود' };
  const email = profile.email || `${username}@scrubshop.app`;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
  emit();
}

export async function updateProfile(updates: { full_name?: string; phone?: string; avatar_url?: string }): Promise<{ error: string | null }> {
  if (!currentUser) return { error: 'غير مسجل' };
  const { error } = await supabase.from('profiles').update(updates).eq('id', currentUser.id);
  if (error) return { error: error.message };
  currentUser = { ...currentUser, ...updates };
  emit();
  return { error: null };
}

export async function changePassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

export async function uploadAvatar(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!currentUser) return { url: null, error: 'غير مسجل' };
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `avatars/${currentUser.id}.${ext}`;
  const { error: upErr } = await supabase.storage.from('customer-avatars').upload(path, file, { upsert: true });
  if (upErr) return { url: null, error: upErr.message };
  const { data } = supabase.storage.from('customer-avatars').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

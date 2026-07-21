/*
# Security fixes
1. Lock down function search_path on handle_new_user
2. Remove broad SELECT policy on customer-avatars bucket (public buckets don't need it)
3. Revoke EXECUTE on handle_new_user from anon + authenticated (internal trigger only)
4. Revoke EXECUTE on is_admin from anon + authenticated
*/

-- ========== 1. Fix mutable search_path on handle_new_user ==========
-- Re-create with explicit, immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

-- ========== 2. Revoke EXECUTE on handle_new_user from anon + authenticated ==========
-- This is an internal trigger function; no client should call it directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ========== 3. Revoke EXECUTE on is_admin from anon + authenticated ==========
-- Switch to SECURITY INVOKER so callers can only use it with their own auth context
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;

-- ========== 4. Remove broad SELECT policy on customer-avatars bucket ==========
-- Public buckets serve objects via URL without any SELECT policy;
-- the broad policy allowed listing all files in the bucket
DROP POLICY IF EXISTS "avatar_select_own" ON storage.objects;

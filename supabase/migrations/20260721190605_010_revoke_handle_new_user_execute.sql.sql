-- Revoke EXECUTE on handle_new_user from anon and authenticated.
-- This is an internal trigger function (fires on auth.users INSERT via trigger),
-- not a client-callable RPC. No client should invoke it via /rest/v1/rpc/.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

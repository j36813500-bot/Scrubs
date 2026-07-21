-- PostgreSQL grants EXECUTE on all functions to PUBLIC by default.
-- REVOKE from anon/authenticated alone is insufficient; must also revoke from PUBLIC.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Re-grant only to the roles that legitimately need it.
-- The trigger fires as the postgres/supabase_admin role, not as anon/authenticated,
-- so no client-facing role needs EXECUTE.

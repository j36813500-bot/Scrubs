-- Fix overly permissive RLS policies on reviews.
-- Reviews are guest-based (no auth): ownership is tracked via guest_id.
-- INSERT must require a guest_id is provided (so rows are attributable).
-- UPDATE is restricted to the row owner (matching guest_id).

DROP POLICY IF EXISTS "anyone_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "owner_update_reviews" ON reviews;

CREATE POLICY "guest_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (guest_id IS NOT NULL AND guest_id = current_setting('request.guest_id', true));

CREATE POLICY "owner_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated
  USING (guest_id IS NOT NULL AND guest_id = current_setting('request.guest_id', true))
  WITH CHECK (guest_id IS NOT NULL AND guest_id = current_setting('request.guest_id', true));

-- Align reviews RLS with the codebase convention used by cart_items & favorites:
-- ownership via auth.uid() = user_id OR guest_id = request.guest_id.

DROP POLICY IF EXISTS "guest_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "owner_update_reviews" ON reviews;

CREATE POLICY "owner_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK ((auth.uid() = user_id) OR (guest_id = current_setting('request.guest_id', true)));

CREATE POLICY "owner_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated
  USING ((auth.uid() = user_id) OR (guest_id = current_setting('request.guest_id', true)))
  WITH CHECK ((auth.uid() = user_id) OR (guest_id = current_setting('request.guest_id', true)));

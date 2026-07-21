/*
# Customer profile: avatar + saved addresses
1. profiles: add avatar_url column
2. New table: saved_addresses (customer shipping addresses)
3. RLS on saved_addresses (owner CRUD)
4. Allow customers to update their own profile (full_name, phone, avatar_url)
*/

-- ========== profiles: avatar_url ==========
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Allow users to update their own profile (name, phone, avatar)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========== saved_addresses ==========
CREATE TABLE IF NOT EXISTS saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'المنزل',
  recipient_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address_ar text NOT NULL DEFAULT '',
  city_ar text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_addresses" ON saved_addresses;
CREATE POLICY "select_own_addresses" ON saved_addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON saved_addresses;
CREATE POLICY "insert_own_addresses" ON saved_addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON saved_addresses;
CREATE POLICY "update_own_addresses" ON saved_addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON saved_addresses;
CREATE POLICY "delete_own_addresses" ON saved_addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Allow customers to read their own orders (by user_id)
DROP POLICY IF EXISTS "customer_select_orders" ON orders;
CREATE POLICY "customer_select_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Allow customers to insert their own orders
DROP POLICY IF EXISTS "customer_insert_orders" ON orders;
CREATE POLICY "customer_insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

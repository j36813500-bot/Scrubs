-- ============================================================
-- اسكربك (ScrubShop) — Complete Database Schema
-- ============================================================
-- Premium Arabic medical-scrubs e-commerce platform.
-- Copy and paste this entire file into the Supabase SQL Editor
-- (Dashboard > SQL Editor > New query) and click RUN.
-- It is idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. CATALOG TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  slug text NOT NULL UNIQUE,
  description_ar text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  composition_ar text,
  description_ar text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  fabric_id uuid REFERENCES fabrics(id) ON DELETE SET NULL,
  name_ar text NOT NULL,
  slug text NOT NULL UNIQUE,
  description_ar text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  gender text NOT NULL DEFAULT 'unisex' CHECK (gender IN ('male','female','unisex')),
  collection_ar text,
  image_url text NOT NULL,
  gallery_urls text[] DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  wash_instructions_ar text,
  specifications_ar text,
  size_guide_ar text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  hex_code text NOT NULL,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
  guest_id text,
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_ar text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. COMMERCE TABLES (guest + auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
  guest_id text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fav_owner CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
  guest_id text,
  color_name_ar text,
  size_label text,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid,
  guest_id text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  shipping_address_ar text NOT NULL,
  city_ar text NOT NULL,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  notes_ar text,
  tracking_number text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name_ar text NOT NULL,
  color_name_ar text,
  size_label text,
  unit_price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. SUPPORT TABLES (AI + human chat)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_id text,
  status text NOT NULL DEFAULT 'ai' CHECK (status IN ('ai','queued','agent','closed')),
  agent_name text,
  agent_status text DEFAULT 'online' CHECK (agent_status IN ('online','typing','offline')),
  last_seen_at timestamptz,
  summary_ar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user','ai','agent','system')),
  content_ar text NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 4. CMS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar text NOT NULL,
  answer_ar text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  subtitle_ar text,
  image_url text,
  cta_text_ar text,
  cta_link text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  label_ar text NOT NULL,
  url text NOT NULL,
  icon text,
  color_hex text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value_ar text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_id text,
  title_ar text NOT NULL,
  body_ar text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_colors_product ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_sizes_product ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_guest ON favorites(guest_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_guest ON cart_items(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_support_conv_guest ON support_conversations(guest_id);
CREATE INDEX IF NOT EXISTS idx_support_msg_conv ON support_messages(conversation_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public catalog read
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_fabrics" ON fabrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_colors" ON product_colors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_sizes" ON product_sizes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_banners" ON banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_social" ON social_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);

-- Reviews: owner by user_id OR guest_id
CREATE POLICY "owner_insert_reviews" ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_update_reviews" ON reviews FOR UPDATE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true))
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- Favorites: owner by user_id OR guest_id
CREATE POLICY "owner_select_favorites" ON favorites FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_insert_favorites" ON favorites FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_delete_favorites" ON favorites FOR DELETE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- Cart: owner by user_id OR guest_id
CREATE POLICY "owner_select_cart" ON cart_items FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_insert_cart" ON cart_items FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_update_cart" ON cart_items FOR UPDATE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true))
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_delete_cart" ON cart_items FOR DELETE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- Orders: owner by user_id OR guest_id
CREATE POLICY "owner_select_orders" ON orders FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_insert_orders" ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true))
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- Order items: owner via parent order
CREATE POLICY "owner_select_order_items" ON order_items FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id
    AND (auth.uid() = o.user_id OR o.guest_id = current_setting('request.guest_id', true))));
CREATE POLICY "owner_insert_order_items" ON order_items FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id
    AND (auth.uid() = o.user_id OR o.guest_id = current_setting('request.guest_id', true))));

-- Support conversations: owner by user_id OR guest_id
CREATE POLICY "owner_select_support_conv" ON support_conversations FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_insert_support_conv" ON support_conversations FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_update_support_conv" ON support_conversations FOR UPDATE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true))
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- Support messages: owner via parent conversation
CREATE POLICY "owner_select_support_msg" ON support_messages FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM support_conversations c WHERE c.id = support_messages.conversation_id
    AND (auth.uid() = c.user_id OR c.guest_id = current_setting('request.guest_id', true))));
CREATE POLICY "owner_insert_support_msg" ON support_messages FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM support_conversations c WHERE c.id = support_messages.conversation_id
    AND (auth.uid() = c.user_id OR c.guest_id = current_setting('request.guest_id', true))));

-- Notifications: owner by user_id OR guest_id
CREATE POLICY "owner_select_notifications" ON notifications FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_insert_notifications" ON notifications FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));
CREATE POLICY "owner_update_notifications" ON notifications FOR UPDATE TO anon, authenticated
  USING (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true))
  WITH CHECK (auth.uid() = user_id OR guest_id = current_setting('request.guest_id', true));

-- ============================================================
-- 7. SAMPLE DATA
-- ============================================================

INSERT INTO categories (name_ar, slug, description_ar, icon, sort_order) VALUES
('أطباء', 'doctors', 'يونيفورمات طبية أنيقة للأطباء', 'stethoscope', 1),
('تمريض', 'nursing', 'يونيفورمات مريحة وعملية للتمريض', 'heart-pulse', 2),
('صيادلة', 'pharmacy', 'يونيفورمات احترافية للصيادلة', 'pill', 3),
('أطباء الأسنان', 'dentistry', 'يونيفورمات عصرية لأطباء الأسنان', 'smile', 4),
('طلاب الطب', 'students', 'يونيفورمات بأسعار تنافسية لطلاب الطب', 'graduation-cap', 5),
('يونيفورمات نسائية', 'women', 'تصاميم أنيقة ومريحة للكوادر النسائية', 'sparkles', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO fabrics (name_ar, composition_ar, description_ar) VALUES
('قطن طبي فاخر', '35% بوليستر / 65% قطن', 'نسيج قطني ناعم ومقاوم للتجعد، مثالي لساعات العمل الطويلة'),
('ميكرو فايبر مرن', '92% بوليستر / 8% إيلاستين', 'خفيف ومرن يمنح حرية الحركة مع رائحة منعشة'),
('نسيج مضاد للبكتيريا', '50% قطن / 50% بوليستر مع معالجة مضادة للميكروبات', 'حماية مضادة للبكتيريا مع تهوية ممتازة')
ON CONFLICT DO NOTHING;

INSERT INTO products (name_ar, slug, description_ar, price, compare_at_price, gender, collection_ar, image_url, gallery_urls, rating, rating_count, in_stock, wash_instructions_ar, specifications_ar, size_guide_ar, is_featured, category_id, fabric_id, sort_order)
SELECT
  p.name_ar, p.slug, p.description_ar, p.price, p.compare_at_price, p.gender, p.collection_ar,
  p.image_url, p.gallery_urls, p.rating, p.rating_count, p.in_stock,
  p.wash_instructions_ar, p.specifications_ar, p.size_guide_ar, p.is_featured,
  c.id, f.id, p.sort_order
FROM (VALUES
  ('يونيفورم طبي كلاسيك وردي', 'classic-rose-scrub', 'يونيفورم طبي أنيق بتصميم كلاسيكي ولون وردي ناعم، مثالي للأطباء والكوادر النسائية. قصّة مريحة وخامة فاخرة تدوم طويلاً.', 249.00, 320.00, 'female', 'مجموعة الورد', 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg', ARRAY['https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg','https://images.pexels.com/photos/4173324/pexels-photo-4173324.jpeg'], 4.8, 124, true, 'غسيل بالماء البارد 30°، لا تستخدم المبيض، تجفيف على حرارة منخفضة', '4 جيوب، خياطة مزدوجة، أزرار مخفية، ياقة V', 'XS: 34-36, S: 38-40, M: 42-44, L: 46-48, XL: 50-52', true, 'doctors', 'قطن طبي فاخر', 1),
  ('يونيفورم تمريض لافندر', 'lavender-nurse-scrub', 'يونيفورم تمريض بلون اللافندر الهادئ، خامة مرنة وخفيفة تمنحك الراحة طوال يوم العمل.', 219.00, 280.00, 'unisex', 'مجموعة اللافندر', 'https://images.pexels.com/photos/4173324/pexels-photo-4173324.jpeg', ARRAY['https://images.pexels.com/photos/4173324/pexels-photo-4173324.jpeg'], 4.7, 89, true, 'غسيل بالماء البارد، تجفيف طبيعي', '3 جيوب، خامة مرنة، حزام جانبي', 'XS, S, M, L, XL, XXL', true, 'nursing', 'ميكرو فايبر مرن', 2),
  ('يونيفورم صيدلي أبيض ذهبي', 'gold-white-pharmacist', 'تصميم احترافي للصيادلة بلون أبيض مع لمسات ذهبية أنيقة تمنح إطلالة راقية.', 269.00, NULL, 'unisex', 'المجموعة الذهبية', 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg', ARRAY['https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg'], 4.9, 56, true, 'غسيل 30°، لا مبيض', 'تصميم بقصة معطف، 2 جيب أمامي', 'S, M, L, XL', true, 'pharmacy', 'نسيج مضاد للبكتيريا', 3),
  ('يونيفورم أسنان بيج', 'beige-dental-scrub', 'يونيفورم عصري لأطباء الأسنان بلون البيج الدافئ، مريح وعملي.', 239.00, 299.00, 'unisex', 'مجموعة البيج', 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg', ARRAY['https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg'], 4.6, 41, true, 'غسيل عادي 40°', 'خامة مضادة للبقع، 3 جيوب', 'XS, S, M, L, XL', false, 'dentistry', 'قطن طبي فاخر', 4),
  ('يونيفورم طلاب الطب الأزرق', 'blue-student-scrub', 'يونيفورم عملي لطلاب الطب بسعر تنافسي وخامة متينة تتحمل الغسيل المتكرر.', 179.00, 220.00, 'unisex', 'مجموعة الطلاب', 'https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg', ARRAY['https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg'], 4.5, 203, true, 'غسيل 40°، يمكن استخدام المبيض', 'تصميم بسيط، 2 جيب، خياطة متينة', 'S, M, L, XL, XXL', true, 'students', 'قطن طبي فاخر', 5),
  ('يونيفورم نسائي وردي فاخر', 'premium-rose-women', 'تصميم نسائي فاخر بقصّة أنيقة ولون وردي ناعم مع تفاصيل دقيقة تمنحك إطلالة راقية.', 289.00, 350.00, 'female', 'مجموعة الورد الفاخرة', 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg', ARRAY['https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg'], 5.0, 38, true, 'غسيل لطيف 30°، تجفيف طبيعي', 'قصّة كيمونو، حزام داخلي، 4 جيوب', 'XS, S, M, L, XL', true, 'women', 'ميكرو فايبر مرن', 6)
) AS p(name_ar, slug, description_ar, price, compare_at_price, gender, collection_ar, image_url, gallery_urls, rating, rating_count, in_stock, wash_instructions_ar, specifications_ar, size_guide_ar, is_featured, category_slug, fabric_name, sort_order)
JOIN categories c ON c.slug = p.category_slug
JOIN fabrics f ON f.name_ar = p.fabric_name
WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.slug = p.slug);

-- Colors per product
INSERT INTO product_colors (product_id, name_ar, hex_code, sort_order)
SELECT p.id, v.name_ar, v.hex_code, v.sort_order
FROM (VALUES
  ('classic-rose-scrub', 'وردي ناعم', '#F7C8D8', 1),
  ('classic-rose-scrub', 'وردي فاتح', '#FCE0EC', 2),
  ('lavender-nurse-scrub', 'لافندر', '#C9B6E4', 1),
  ('lavender-nurse-scrub', 'بنفسجي فاتح', '#E0D4F0', 2),
  ('gold-white-pharmacist', 'أبيض', '#FFFFFF', 1),
  ('gold-white-pharmacist', 'ذهبي', '#D4AF37', 2),
  ('beige-dental-scrub', 'بيج', '#E8DCC4', 1),
  ('beige-dental-scrub', 'بيج فاتح', '#F0E8D8', 2),
  ('blue-student-scrub', 'أزرق سماوي', '#A8C8E8', 1),
  ('blue-student-scrub', 'أزرق فاتح', '#C8DEF0', 2),
  ('premium-rose-women', 'وردي فاخر', '#F4B8D0', 1),
  ('premium-rose-women', 'وردي ناعم', '#F7C8D8', 2)
) AS v(slug, name_ar, hex_code, sort_order)
JOIN products p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id AND pc.name_ar = v.name_ar);

-- Sizes per product
INSERT INTO product_sizes (product_id, size_label, sort_order)
SELECT p.id, v.label, v.sort_order
FROM (VALUES
  ('classic-rose-scrub', 'XS', 1), ('classic-rose-scrub', 'S', 2), ('classic-rose-scrub', 'M', 3), ('classic-rose-scrub', 'L', 4), ('classic-rose-scrub', 'XL', 5),
  ('lavender-nurse-scrub', 'XS', 1), ('lavender-nurse-scrub', 'S', 2), ('lavender-nurse-scrub', 'M', 3), ('lavender-nurse-scrub', 'L', 4), ('lavender-nurse-scrub', 'XL', 5), ('lavender-nurse-scrub', 'XXL', 6),
  ('gold-white-pharmacist', 'S', 1), ('gold-white-pharmacist', 'M', 2), ('gold-white-pharmacist', 'L', 3), ('gold-white-pharmacist', 'XL', 4),
  ('beige-dental-scrub', 'XS', 1), ('beige-dental-scrub', 'S', 2), ('beige-dental-scrub', 'M', 3), ('beige-dental-scrub', 'L', 4), ('beige-dental-scrub', 'XL', 5),
  ('blue-student-scrub', 'S', 1), ('blue-student-scrub', 'M', 2), ('blue-student-scrub', 'L', 3), ('blue-student-scrub', 'XL', 4), ('blue-student-scrub', 'XXL', 5),
  ('premium-rose-women', 'XS', 1), ('premium-rose-women', 'S', 2), ('premium-rose-women', 'M', 3), ('premium-rose-women', 'L', 4), ('premium-rose-women', 'XL', 5)
) AS v(slug, label, sort_order)
JOIN products p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.size_label = v.label);

-- Reviews
INSERT INTO reviews (product_id, author_name, rating, comment_ar, guest_id)
SELECT p.id, v.author, v.rating, v.comment, v.guest_id
FROM (VALUES
  ('classic-rose-scrub', 'د. سارة العلي', 5, 'يونيفورم رائع وخامة ممتازة، مريح جداً خلال ساعات العمل الطويلة', 'g1'),
  ('classic-rose-scrub', 'م. ليلى حداد', 4, 'اللون جميل والقصة أنيقة، لكن المقاس يأتي أصغر قليلاً', 'g2'),
  ('lavender-nurse-scrub', 'م. روان كمال', 5, 'أفضل يونيفورم اشتريته، الخامة المرنة مريحة جداً', 'g3'),
  ('gold-white-pharmacist', 'د. أحمد منصور', 5, 'تصميم احترافي يليق بالصيدلية، اللمسات الذهبية أنيقة جداً', 'g4'),
  ('blue-student-scrub', 'ط. مريم سعيد', 4, 'سعر ممتاز لطلاب الطب، يتحمل الغسيل المتكرر', 'g5'),
  ('premium-rose-women', 'د. نورة الحسن', 5, 'تصميم فاخر بحق، استلمت الكثير من الإطراءات عليه', 'g6')
) AS v(slug, author, rating, comment, guest_id)
JOIN products p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.product_id = p.id AND r.author_name = v.author);

-- FAQs
INSERT INTO faqs (question_ar, answer_ar, sort_order) VALUES
('كيف أختار المقاس المناسب؟', 'يمكنك الاطلاع على دليل المقاسات في صفحة كل منتج. ننصح بقياس محيط الصدر والخصر ومقارنته بالجدول. إذا كنت بين مقاسين، اختر الأكبر للراحة.', 1),
('هل الغسيل يؤثر على جودة اليونيفورم؟', 'أقمشتنا مصممة لتتحمل الغسيل المتكرر. اتبع تعليمات الغسيل المرفقة مع كل منتج للحفاظ على الجودة واللون.', 2),
('كم تستغرق مدة التوصيل؟', 'عادة 2-5 أيام عمل داخل المدن الرئيسية، و5-8 أيام للمناطق الأخرى. ستصلك رسالة تتبع فور شحن طلبك.', 3),
('هل يمكنني استبدال المنتج؟', 'نعم، يمكنك استبدال أو إرجاع المنتج خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية مع البطاقات. راجع صفحة سياسة الاستبدال والاسترجاع.', 4),
('هل توفرون يونيفورمات للطلاب؟', 'نعم، لدينا مجموعة مخصصة لطلاب الطب بأسعار تنافسية وجودة عالية. تصفح مجموعة الطلاب في المتجر.', 5),
('كيف أتتبع طلبي؟', 'ادخل إلى صفحة تتبع الطلبات وأدخل رقم طلبك أو رقم الهاتف لمعرفة حالة الشحنة لحظياً.', 6)
ON CONFLICT DO NOTHING;

-- Banners
INSERT INTO banners (title_ar, subtitle_ar, image_url, cta_text_ar, cta_link, sort_order) VALUES
('مجموعة الورد الفاخرة', 'يونيفورمات طبية بلمسة أنثوية راقية', 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg', 'تسوق الآن', '/store', 1),
('خصومات الطلاب', 'يونيفورمات عالية الجودة بأسعار تنافسية', 'https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg', 'اكتشف المجموعة', '/store?collection=students', 2)
ON CONFLICT DO NOTHING;

-- Social links
INSERT INTO social_links (platform, label_ar, url, icon, color_hex, sort_order) VALUES
('tiktok', 'تيك توك', 'https://tiktok.com', 'music', '#000000', 1),
('facebook', 'فيسبوك', 'https://facebook.com', 'facebook', '#1877F2', 2),
('instagram', 'انستغرام', 'https://instagram.com', 'instagram', '#E4405F', 3),
('whatsapp', 'واتساب', 'https://wa.me/201000000000', 'message-circle', '#25D366', 4)
ON CONFLICT DO NOTHING;

-- Settings
INSERT INTO settings (key, value_ar) VALUES
('brand_name', 'اسكربك'),
('brand_tagline', 'يونيفورمات طبية فاخرة'),
('support_phone', '+20 100 000 0000'),
('support_email', 'support@scrubshop.com'),
('free_shipping_threshold', '500'),
('currency', 'ج.م')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE. The database is ready. Visit the app to browse.
-- ============================================================

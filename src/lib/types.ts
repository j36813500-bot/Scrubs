export type Product = {
  id: string;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  price: number;
  compare_at_price: number | null;
  gender: 'male' | 'female' | 'unisex';
  collection_ar: string | null;
  image_url: string;
  gallery_urls: string[];
  rating: number;
  rating_count: number;
  in_stock: boolean;
  wash_instructions_ar: string | null;
  specifications_ar: string | null;
  size_guide_ar: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  fabric_id: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  icon: string | null;
  sort_order: number;
};

export type Fabric = {
  id: string;
  name_ar: string;
  composition_ar: string | null;
  description_ar: string | null;
};

export type ProductColor = {
  id: string;
  product_id: string;
  name_ar: string;
  hex_code: string;
  image_url: string | null;
  sort_order: number;
};

export type ProductSize = {
  id: string;
  product_id: string;
  size_label: string;
  sort_order: number;
};

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment_ar: string;
  created_at: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  product: Product;
  color_name_ar: string | null;
  size_label: string | null;
  quantity: number;
};

export type Favorite = {
  id: string;
  product_id: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address_ar: string;
  city_ar: string;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  payment_method: string | null;
  notes_ar: string | null;
  user_id: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name_ar: string;
  color_name_ar: string | null;
  size_label: string | null;
  quantity: number;
  unit_price: number;
  product?: { image_url: string; gallery_urls: string[] };
};

export type SavedAddress = {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_ar: string;
  city_ar: string;
  is_default: boolean;
  created_at: string;
};

export type FAQ = {
  id: string;
  question_ar: string;
  answer_ar: string;
  sort_order: number;
};

export type Banner = {
  id: string;
  title_ar: string;
  subtitle_ar: string;
  image_url: string;
  cta_text_ar: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
};

export type SocialLink = {
  id: string;
  platform: string;
  label_ar: string;
  url: string;
  icon: string;
  color_hex: string;
  sort_order: number;
};

export type Setting = {
  key: string;
  value_ar: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'agent';
  content_ar: string;
  attachment_url: string | null;
  created_at: string;
};

export type SupportConversation = {
  id: string;
  status: string;
  agent_name: string | null;
  agent_status: string | null;
  last_seen_at: string | null;
  summary_ar: string | null;
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
};

export type Notification = {
  id: string;
  title_ar: string;
  body_ar: string;
  is_read: boolean;
  created_at: string;
};

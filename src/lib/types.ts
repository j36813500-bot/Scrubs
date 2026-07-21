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

export type Product = {
  id: string;
  category_id: string | null;
  fabric_id: string | null;
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
  // joined
  category?: Category;
  fabric?: Fabric;
  colors?: ProductColor[];
  sizes?: ProductSize[];
};

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment_ar: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  color_name_ar: string | null;
  size_label: string | null;
  quantity: number;
  product?: Product;
};

export type Favorite = {
  id: string;
  product_id: string;
  product?: Product;
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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name_ar: string;
  color_name_ar: string | null;
  size_label: string | null;
  unit_price: number;
  quantity: number;
};

export type SupportConversation = {
  id: string;
  status: 'ai' | 'queued' | 'agent' | 'closed';
  agent_name: string | null;
  agent_status: 'online' | 'typing' | 'offline';
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai' | 'agent' | 'system';
  content_ar: string;
  attachment_url: string | null;
  created_at: string;
};

export type Faq = {
  id: string;
  question_ar: string;
  answer_ar: string;
  sort_order: number;
};

export type Banner = {
  id: string;
  title_ar: string;
  subtitle_ar: string | null;
  image_url: string | null;
  cta_text_ar: string | null;
  cta_link: string | null;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  platform: string;
  label_ar: string;
  url: string;
  icon: string | null;
  color_hex: string | null;
  sort_order: number;
};

export type Setting = {
  key: string;
  value_ar: string;
};

export interface Category {
  id: string
  name_ar: string
  slug: string
  description_ar: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Fabric {
  id: string
  name_ar: string
  composition_ar: string | null
  description_ar: string | null
  created_at: string
}

export interface ProductColor {
  id: string
  product_id: string
  name_ar: string
  hex_code: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

export interface ProductSize {
  id: string
  product_id: string
  size_label: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  fabric_id: string | null
  name_ar: string
  slug: string
  description_ar: string | null
  price: number
  compare_at_price: number | null
  gender: string
  collection_ar: string | null
  image_url: string | null
  gallery_urls: string[]
  rating: number
  rating_count: number
  in_stock: boolean
  wash_instructions_ar: string | null
  specifications_ar: string | null
  size_guide_ar: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string | null
  guest_id: string | null
  author_name: string
  rating: number
  comment_ar: string
  created_at: string
}

export interface CartItem {
  id: string
  product_id: string
  user_id: string | null
  guest_id: string | null
  color_name_ar: string | null
  size_label: string | null
  quantity: number
  created_at: string
  product?: Product
}

export interface Favorite {
  id: string
  product_id: string
  user_id: string | null
  guest_id: string | null
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  shipping_address_ar: string
  city_ar: string
  total_amount: number
  status: string
  notes_ar: string | null
  tracking_number: string | null
  created_at: string
  payment_method: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name_ar: string
  color_name_ar: string | null
  size_label: string | null
  unit_price: number
  quantity: number
  created_at: string
}

export interface SavedAddress {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  address_ar: string
  city_ar: string
  is_default: boolean
  created_at: string
}

export interface FAQ {
  id: string
  question_ar: string
  answer_ar: string
  sort_order: number
  created_at: string
}

export interface Banner {
  id: string
  title_ar: string
  subtitle_ar: string | null
  image_url: string | null
  cta_text_ar: string | null
  cta_link: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SocialLink {
  id: string
  platform: string
  label_ar: string
  url: string
  icon: string
  color_hex: string | null
  sort_order: number
  created_at: string
}

export interface Setting {
  key: string
  value_ar: string
  updated_at: string
}

export interface SupportConversation {
  id: string
  user_id: string | null
  guest_id: string | null
  status: string
  agent_name: string | null
  agent_status: string | null
  last_seen_at: string | null
  summary_ar: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  conversation_id: string
  sender_type: string
  content_ar: string
  attachment_url: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string | null
  guest_id: string | null
  title_ar: string
  body_ar: string
  is_read: boolean
  created_at: string
}

export interface OrderFeedback {
  id: string
  order_id: string
  rating: number
  review: string
  experience: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
  admin_username: string | null
  email: string | null
  avatar_url: string | null
}

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
  category_id: string | null;
  fabric_id: string | null;
  is_featured: boolean;
  in_stock: boolean;
  rating: number;
  rating_count: number;
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

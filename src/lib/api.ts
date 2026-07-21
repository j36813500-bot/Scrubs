import { supabase, getGuestId, withGuestContext } from './supabase';
import type { Product, Category, Review, CartItem, Favorite, Order, OrderItem, SavedAddress } from './types';

// ---------- Products ----------

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('is_featured', true).limit(6);
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return (data || []) as Category[];
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Review[];
}

export async function addReview(productId: string, authorName: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    author_name: authorName,
    rating,
    comment_ar: comment,
  });
  if (error) throw error;
}

// ---------- Cart ----------

export async function fetchCart(): Promise<CartItem[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as CartItem[];
  });
}

export async function addToCart(item: { product_id: string; color_name_ar?: string; size_label?: string; quantity?: number }): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart').insert({
      product_id: item.product_id,
      color_name_ar: item.color_name_ar || null,
      size_label: item.size_label || null,
      quantity: item.quantity || 1,
      guest_id: getGuestId(),
    });
    if (error) throw error;
  });
}

export async function updateCartQuantity(cartId: string, quantity: number): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart').update({ quantity }).eq('id', cartId);
    if (error) throw error;
  });
}

export async function removeFromCart(cartId: string): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart').delete().eq('id', cartId);
    if (error) throw error;
  });
}

// ---------- Favorites ----------

export async function fetchFavorites(): Promise<Favorite[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('favorites').select('*');
    if (error) throw error;
    return (data || []) as Favorite[];
  });
}

export async function toggleFavorite(productId: string): Promise<boolean> {
  return withGuestContext(async () => {
    const { data } = await supabase.from('favorites').select('id').eq('product_id', productId).maybeSingle();
    if (data) {
      await supabase.from('favorites').delete().eq('id', data.id);
      return false;
    } else {
      await supabase.from('favorites').insert({ product_id: productId, guest_id: getGuestId() });
      return true;
    }
  });
}

// ---------- Orders ----------

export async function createOrder(o: {
  customer_name: string;
  customer_phone: string;
  shipping_address_ar: string;
  city_ar: string;
  total_amount: number;
  payment_method: string;
  notes_ar?: string;
  user_id?: string;
}): Promise<Order> {
  const orderNumber = 'SCB-' + Date.now().toString().slice(-6);
  const { data, error } = await supabase.from('orders').insert({
    ...o,
    order_number: orderNumber,
    status: 'pending',
  }).select().single();
  if (error) throw error;
  return data as Order;
}

export async function createOrderItems(items: { order_id: string; product_id: string; product_name_ar: string; color_name_ar: string | null; size_label: string | null; quantity: number; unit_price: number }[]): Promise<void> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) throw error;
}

export async function fetchOrders(): Promise<Order[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  });
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, product:products(image_url, gallery_urls)')
    .eq('order_id', orderId);
  if (error) throw error;
  return (data || []) as unknown as OrderItem[];
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
}

// ---------- Addresses ----------

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const { data, error } = await supabase.from('saved_addresses').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as SavedAddress[];
}

export async function addAddress(a: { label: string; recipient_name: string; phone: string; address_ar: string; city_ar: string; is_default?: boolean }): Promise<void> {
  const { error } = await supabase.from('saved_addresses').insert(a);
  if (error) throw error;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('saved_addresses').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Feedback ----------

export async function submitOrderFeedback(orderId: string, rating: number, review: string, experience: string): Promise<void> {
  const { error } = await supabase.from('order_feedback').insert({ order_id: orderId, rating, review, experience });
  if (error) throw error;
}

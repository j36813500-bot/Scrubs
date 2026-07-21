import { supabase, getGuestId, withGuestContext } from './supabase';
import type { Product, Category, Fabric, ProductColor, ProductSize, Review, CartItem, Favorite, Order, OrderItem, SavedAddress, FAQ, Banner, SocialLink, Setting, SupportConversation, SupportMessage, Notification } from './types';

// ---------- Products ----------
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('is_featured', true).order('sort_order');
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('category_id', categoryId).order('sort_order');
  if (error) throw error;
  return (data || []) as Product[];
}

// ---------- Categories ----------
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return (data || []) as Category[];
}

// ---------- Fabrics ----------
export async function fetchFabrics(): Promise<Fabric[]> {
  const { data, error } = await supabase.from('fabrics').select('*').order('name_ar');
  if (error) throw error;
  return (data || []) as Fabric[];
}

// ---------- Product Colors & Sizes ----------
export async function fetchProductColors(productId: string): Promise<ProductColor[]> {
  const { data, error } = await supabase.from('product_colors').select('*').eq('product_id', productId).order('sort_order');
  if (error) throw error;
  return (data || []) as ProductColor[];
}

export async function fetchProductSizes(productId: string): Promise<ProductSize[]> {
  const { data, error } = await supabase.from('product_sizes').select('*').eq('product_id', productId).order('sort_order');
  if (error) throw error;
  return (data || []) as ProductSize[];
}

// ---------- Reviews ----------
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
    guest_id: getGuestId(),
  });
  if (error) throw error;
}

// ---------- Cart ----------
export async function fetchCart(): Promise<CartItem[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as CartItem[];
  });
}

export async function addToCart(item: { product_id: string; color_name_ar?: string; size_label?: string; quantity?: number }): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart_items').insert({
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
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartId);
    if (error) throw error;
  });
}

export async function removeFromCart(cartId: string): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartId);
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
  customer_name: string; customer_phone: string; shipping_address_ar: string;
  city_ar: string; total_amount: number; payment_method: string; notes_ar?: string; user_id?: string;
}): Promise<Order> {
  const orderNumber = 'SCB-' + Date.now().toString().slice(-6);
  const { data, error } = await supabase.from('orders').insert({
    ...o, order_number: orderNumber, status: 'pending', guest_id: getGuestId(),
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

// ---------- Content: Banners, FAQs, Social Links, Settings ----------
export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data || []) as Banner[];
}

export async function fetchFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order');
  if (error) throw error;
  return (data || []) as FAQ[];
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase.from('social_links').select('*').order('sort_order');
  if (error) throw error;
  return (data || []) as SocialLink[];
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const s of (data || []) as Setting[]) map[s.key] = s.value_ar;
  return map;
}

// ---------- Support Chat ----------
export async function fetchOrCreateConversation(): Promise<SupportConversation> {
  return withGuestContext(async () => {
    const { data: existing } = await supabase.from('support_conversations').select('*').eq('guest_id', getGuestId()).maybeSingle();
    if (existing) {
      const { data: msgs } = await supabase.from('support_messages').select('*').eq('conversation_id', existing.id).order('created_at');
      return { ...existing, messages: msgs || [] } as SupportConversation;
    }
    const { data, error } = await supabase.from('support_conversations').insert({
      guest_id: getGuestId(), status: 'open',
    }).select().single();
    if (error) throw error;
    return { ...data, messages: [] } as SupportConversation;
  });
}

export async function fetchMessages(conversationId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase.from('support_messages').select('*').eq('conversation_id', conversationId).order('created_at');
  if (error) throw error;
  return (data || []) as SupportMessage[];
}

export async function sendMessage(conversationId: string, content: string): Promise<void> {
  const { error } = await supabase.from('support_messages').insert({
    conversation_id: conversationId, sender_type: 'customer', content_ar: content,
  });
  if (error) throw error;
}

// ---------- Notifications ----------
export async function fetchNotifications(): Promise<Notification[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Notification[];
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

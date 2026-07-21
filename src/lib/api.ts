import { supabase, getGuestId, withGuestContext } from './supabase';
import type {
  Product, Category, Fabric, Review, CartItem, Favorite, Order, OrderItem,
  SupportConversation, SupportMessage, Faq, Banner, SocialLink,
} from './types';

// ---------- Catalog ----------

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchFabrics(): Promise<Fabric[]> {
  const { data, error } = await supabase.from('fabrics').select('*');
  if (error) throw error;
  return data || [];
}

export async function fetchProducts(filters?: {
  category?: string;
  collection?: string;
  gender?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}): Promise<Product[]> {
  let q = supabase.from('products').select(`
    *,
    category:categories(*),
    fabric:fabrics(*),
    colors:product_colors(*),
    sizes:product_sizes(*)
  `).order('sort_order');
  if (filters?.category) q = q.eq('category_id', filters.category);
  if (filters?.collection) q = q.ilike('collection_ar', `%${filters.collection}%`);
  if (filters?.gender && filters.gender !== 'all') q = q.eq('gender', filters.gender);
  if (filters?.search) q = q.or(`name_ar.ilike.%${filters.search}%,description_ar.ilike.%${filters.search}%`);
  if (filters?.minPrice != null) q = q.gte('price', filters.minPrice);
  if (filters?.maxPrice != null) q = q.lte('price', filters.maxPrice);
  if (filters?.inStockOnly) q = q.eq('in_stock', true);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, category:categories(*), fabric:fabrics(*), colors:product_colors(*), sizes:product_sizes(*)`)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, colors:product_colors(*), sizes:product_sizes(*)`)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(4);
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addReview(r: { product_id: string; author_name: string; rating: number; comment_ar: string }): Promise<void> {
  const { error } = await supabase.from('reviews').insert({ ...r, guest_id: getGuestId() });
  if (error) throw error;
}

// ---------- Cart ----------

export async function fetchCart(): Promise<CartItem[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*, colors:product_colors(*), sizes:product_sizes(*))')
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

export async function updateCartQuantity(id: string, quantity: number): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id);
    if (error) throw error;
  });
}

export async function removeFromCart(id: string): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (error) throw error;
  });
}

// ---------- Favorites ----------

export async function fetchFavorites(): Promise<Favorite[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, product:products(*, colors:product_colors(*), sizes:product_sizes(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Favorite[];
  });
}

export async function toggleFavorite(productId: string): Promise<boolean> {
  return withGuestContext(async () => {
    const existing = await supabase.from('favorites').select('id').eq('product_id', productId).maybeSingle();
    if (existing.data) {
      await supabase.from('favorites').delete().eq('id', existing.data.id);
      return false;
    }
    await supabase.from('favorites').insert({ product_id: productId, guest_id: getGuestId() });
    return true;
  });
}

// ---------- Orders ----------

export async function createOrder(o: {
  customer_name: string; customer_phone: string; customer_email?: string;
  shipping_address_ar: string; city_ar: string; total_amount: number; notes_ar?: string;
  items: { product_id: string; product_name_ar: string; color_name_ar?: string; size_label?: string; unit_price: number; quantity: number }[];
}): Promise<Order> {
  const orderNumber = 'SCB-' + Date.now().toString(36).toUpperCase();
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_email: o.customer_email || null,
      shipping_address_ar: o.shipping_address_ar,
      city_ar: o.city_ar,
      total_amount: o.total_amount,
      notes_ar: o.notes_ar || null,
      guest_id: getGuestId(),
    }).select().single();
    if (error) throw error;
    const order = data as Order;
    const rows = o.items.map(i => ({ ...i, order_id: order.id }));
    const { error: ie } = await supabase.from('order_items').insert(rows);
    if (ie) throw ie;
    return order;
  });
}

export async function fetchOrders(): Promise<Order[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  });
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (error) throw error;
    return (data || []) as OrderItem[];
  });
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
    if (error) throw error;
    return data as Order | null;
  });
}

// ---------- Support ----------

export async function fetchOrCreateConversation(): Promise<SupportConversation> {
  return withGuestContext(async () => {
    const { data: existing } = await supabase
      .from('support_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return existing as SupportConversation;
    const { data, error } = await supabase.from('support_conversations').insert({
      guest_id: getGuestId(),
      status: 'ai',
    }).select().single();
    if (error) throw error;
    return data as SupportConversation;
  });
}

export async function fetchMessages(conversationId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as SupportMessage[];
}

export async function sendMessage(conversationId: string, senderType: 'user' | 'ai' | 'agent' | 'system', content: string, attachmentUrl?: string): Promise<void> {
  const { error } = await supabase.from('support_messages').insert({
    conversation_id: conversationId,
    sender_type: senderType,
    content_ar: content,
    attachment_url: attachmentUrl || null,
  });
  if (error) throw error;
}

export async function requestHumanAgent(conversationId: string): Promise<void> {
  await withGuestContext(async () => {
    const { error } = await supabase.from('support_conversations').update({
      status: 'queued',
      agent_name: 'خدمة العملاء',
      agent_status: 'online',
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', conversationId);
    if (error) throw error;
  });
}

// ---------- CMS ----------

export async function fetchFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase.from('social_links').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data || []).forEach((s: { key: string; value_ar: string }) => { map[s.key] = s.value_ar; });
  return map;
}

// ---------- Admin: Orders ----------

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

export async function fetchAllOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, product:products(image_url, gallery_urls)')
    .eq('order_id', orderId);
  if (error) throw error;
  return (data || []) as unknown as OrderItem[];
}

export async function fetchOrderFeedback(orderId: string): Promise<{ rating: number; review: string; experience: string } | null> {
  const { data, error } = await supabase
    .from('order_feedback')
    .select('rating, review, experience')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data as { rating: number; review: string; experience: string } | null;
}

export async function fetchAllFeedback(): Promise<{ id: string; order_id: string; rating: number; review: string; experience: string; created_at: string; order?: { order_number: string; customer_name: string } }[]> {
  const { data, error } = await supabase
    .from('order_feedback')
    .select('*, order:orders(order_number, customer_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as any;
}

// ---------- Admin: Products ----------

export async function createProduct(p: {
  name_ar: string; slug: string; description_ar?: string; price: number;
  compare_at_price?: number; gender: string; collection_ar?: string;
  image_url: string; gallery_urls: string[]; category_id?: string;
  is_featured?: boolean; in_stock?: boolean;
}): Promise<Product> {
  const { data, error } = await supabase.from('products').insert({
    name_ar: p.name_ar,
    slug: p.slug,
    description_ar: p.description_ar || null,
    price: p.price,
    compare_at_price: p.compare_at_price || null,
    gender: p.gender,
    collection_ar: p.collection_ar || null,
    image_url: p.image_url,
    gallery_urls: p.gallery_urls,
    category_id: p.category_id || null,
    is_featured: p.is_featured || false,
    in_stock: p.in_stock !== false,
    rating: 0,
    rating_count: 0,
  }).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(name_ar: string, slug: string, icon?: string): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert({
    name_ar,
    slug,
    icon: icon || 'cross',
    sort_order: 999,
  }).select().single();
  if (error) throw error;
  return data as Category;
}

// ---------- Customer: Feedback ----------

export async function submitOrderFeedback(orderId: string, rating: number, review: string, experience: string): Promise<void> {
  const { error } = await supabase.from('order_feedback').insert({
    order_id: orderId,
    rating,
    review,
    experience,
  });
  if (error) throw error;
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  return withGuestContext(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  });
}

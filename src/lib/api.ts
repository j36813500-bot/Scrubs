import { supabase, getGuestId } from './supabase'
import type {
  Product, Category, Fabric, ProductColor, ProductSize, Review,
  CartItem, Favorite, Order, OrderItem, SavedAddress, FAQ, Banner,
  SocialLink, Setting, SupportConversation, SupportMessage, Notification,
  OrderFeedback,
} from './types'

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('is_featured', true).order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
  if (!cat) return []
  const { data, error } = await supabase.from('products').select('*').eq('category_id', cat.id).order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchFabrics(): Promise<Fabric[]> {
  const { data, error } = await supabase.from('fabrics').select('*')
  if (error) throw error
  return data || []
}

export async function fetchProductColors(productId: string): Promise<ProductColor[]> {
  const { data, error } = await supabase.from('product_colors').select('*').eq('product_id', productId).order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchProductSizes(productId: string): Promise<ProductSize[]> {
  const { data, error } = await supabase.from('product_sizes').select('*').eq('product_id', productId).order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addReview(productId: string, authorName: string, rating: number, comment: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user?.id || null,
    guest_id: user?.id ? null : getGuestId(),
    author_name: authorName,
    rating,
    comment_ar: comment,
  })
}

export async function fetchCart(): Promise<CartItem[]> {
  const { data: { user } } = await supabase.auth.getUser()
  let query = supabase.from('cart_items').select('*, product:products(*)')
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('guest_id', getGuestId())
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as CartItem[]
}

export async function addToCart(productId: string, quantity: number, colorName?: string, sizeLabel?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('cart_items').insert({
    product_id: productId,
    user_id: user?.id || null,
    guest_id: user?.id ? null : getGuestId(),
    quantity,
    color_name_ar: colorName || null,
    size_label: sizeLabel || null,
  })
}

export async function updateCartQuantity(cartId: string, quantity: number): Promise<void> {
  await supabase.from('cart_items').update({ quantity }).eq('id', cartId)
}

export async function removeFromCart(cartId: string): Promise<void> {
  await supabase.from('cart_items').delete().eq('id', cartId)
}

export async function fetchFavorites(): Promise<Favorite[]> {
  const { data: { user } } = await supabase.auth.getUser()
  let query = supabase.from('favorites').select('*, product:products(*)')
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('guest_id', getGuestId())
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Favorite[]
}

export async function toggleFavorite(productId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  const filter = user
    ? { user_id: user.id, product_id: productId }
    : { guest_id: getGuestId(), product_id: productId }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .match(filter)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('favorites').insert({
      product_id: productId,
      user_id: user?.id || null,
      guest_id: user?.id ? null : getGuestId(),
    })
    return true
  }
}

export async function createOrder(order: {
  customer_name: string
  customer_phone: string
  customer_email?: string
  shipping_address: string
  city: string
  total_amount: number
  notes?: string
  payment_method?: string
}): Promise<Order | null> {
  const { data: { user } } = await supabase.auth.getUser()
  const orderNumber = 'ORD-' + Date.now().toString().slice(-8)
  const { data, error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    user_id: user?.id || null,
    guest_id: user?.id ? null : getGuestId(),
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email || null,
    shipping_address_ar: order.shipping_address,
    city_ar: order.city,
    total_amount: order.total_amount,
    notes_ar: order.notes || null,
    payment_method: order.payment_method || 'cod',
    status: 'pending',
  }).select('*').single()
  if (error) throw error
  return data
}

export async function createOrderItems(items: { order_id: string; product_id: string; product_name: string; color_name?: string; size_label?: string; unit_price: number; quantity: number }[]): Promise<void> {
  const rows = items.map(i => ({
    order_id: i.order_id,
    product_id: i.product_id,
    product_name_ar: i.product_name,
    color_name_ar: i.color_name || null,
    size_label: i.size_label || null,
    unit_price: i.unit_price,
    quantity: i.quantity,
  }))
  await supabase.from('order_items').insert(rows)
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId)
  if (error) throw error
  return data || []
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('order_number', orderNumber).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await supabase.from('orders').update({ status }).eq('id', orderId)
}

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('saved_addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addAddress(addr: { recipient_name: string; phone: string; address: string; city: string; label?: string }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('saved_addresses').insert({
    user_id: user.id,
    recipient_name: addr.recipient_name,
    phone: addr.phone,
    address_ar: addr.address,
    city_ar: addr.city,
    label: addr.label || 'المنزل',
  })
}

export async function deleteAddress(id: string): Promise<void> {
  await supabase.from('saved_addresses').delete().eq('id', id)
}

export async function submitOrderFeedback(orderId: string, rating: number, review: string, experience: string): Promise<void> {
  await supabase.from('order_feedback').insert({ order_id: orderId, rating, review, experience })
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase.from('social_links').select('*').order('sort_order')
  if (error) throw error
  return data || []
}

export async function fetchSettings(): Promise<Setting[]> {
  const { data, error } = await supabase.from('settings').select('*')
  if (error) throw error
  return data || []
}

export async function fetchOrCreateConversation(): Promise<SupportConversation | null> {
  const { data: { user } } = await supabase.auth.getUser()
  const guestId = getGuestId()
  let query = supabase.from('support_conversations').select('*')
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('guest_id', guestId)
  }
  const { data: existing } = await query.maybeSingle()
  if (existing) return existing
  const { data, error } = await supabase.from('support_conversations').insert({
    user_id: user?.id || null,
    guest_id: user?.id ? null : guestId,
    status: 'ai',
    agent_status: 'online',
  }).select('*').single()
  if (error) throw error
  return data
}

export async function fetchMessages(conversationId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase.from('support_messages').select('*').eq('conversation_id', conversationId).order('created_at')
  if (error) throw error
  return data || []
}

export async function sendMessage(conversationId: string, content: string, senderType: string = 'user'): Promise<void> {
  await supabase.from('support_messages').insert({
    conversation_id: conversationId,
    sender_type: senderType,
    content_ar: content,
  })
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser()
  let query = supabase.from('notifications').select('*')
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('guest_id', getGuestId())
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function fetchOrderFeedback(orderId: string): Promise<OrderFeedback | null> {
  const { data, error } = await supabase.from('order_feedback').select('*').eq('order_id', orderId).maybeSingle()
  if (error) throw error
  return data
}

// Admin: product CRUD
export async function createProduct(p: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase.from('products').insert(p).select('*').single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await supabase.from('products').update(updates).eq('id', id)
}

export async function deleteProduct(id: string): Promise<void> {
  await supabase.from('products').delete().eq('id', id)
}

export async function createCategory(c: Partial<Category>): Promise<void> {
  await supabase.from('categories').insert(c)
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await supabase.from('categories').update(updates).eq('id', id)
}

export async function deleteCategory(id: string): Promise<void> {
  await supabase.from('categories').delete().eq('id', id)
}

export async function updateProductColors(productId: string, colors: { name_ar: string; hex_code: string; image_url?: string }[]): Promise<void> {
  await supabase.from('product_colors').delete().eq('product_id', productId)
  if (colors.length) {
    await supabase.from('product_colors').insert(colors.map((c, i) => ({
      product_id: productId,
      name_ar: c.name_ar,
      hex_code: c.hex_code,
      image_url: c.image_url || null,
      sort_order: i,
    })))
  }
}

export async function updateProductSizes(productId: string, sizes: string[]): Promise<void> {
  await supabase.from('product_sizes').delete().eq('product_id', productId)
  if (sizes.length) {
    await supabase.from('product_sizes').insert(sizes.map((s, i) => ({
      product_id: productId,
      size_label: s,
      sort_order: i,
    })))
  }
}

export async function fetchAllProfiles(): Promise<any[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await supabase.from('settings').upsert({ key, value_ar: value, updated_at: new Date().toISOString() })
}

export async function updateSocialLink(id: string, updates: any): Promise<void> {
  await supabase.from('social_links').update(updates).eq('id', id)
}

export async function createSocialLink(link: any): Promise<void> {
  await supabase.from('social_links').insert(link)
}

export async function deleteSocialLink(id: string): Promise<void> {
  await supabase.from('social_links').delete().eq('id', id)
}

export async function updateFAQ(id: string, updates: any): Promise<void> {
  await supabase.from('faqs').update(updates).eq('id', id)
}

export async function createFAQ(faq: any): Promise<void> {
  await supabase.from('faqs').insert(faq)
}

export async function deleteFAQ(id: string): Promise<void> {
  await supabase.from('faqs').delete().eq('id', id)
}

export async function updateBanner(id: string, updates: any): Promise<void> {
  await supabase.from('banners').update(updates).eq('id', id)
}

export async function createBanner(b: any): Promise<void> {
  await supabase.from('banners').insert(b)
}

export async function deleteBanner(id: string): Promise<void> {
  await supabase.from('banners').delete().eq('id', id)
}

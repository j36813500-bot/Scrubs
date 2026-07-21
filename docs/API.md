# API / Data Access Layer

All data access is centralized in `src/lib/api.ts`. It uses the Supabase JS client (`src/lib/supabase.ts`) and exposes typed functions.

## Catalog

### `fetchCategories(): Promise<Category[]>`
Returns all categories ordered by `sort_order`.

### `fetchFabrics(): Promise<Fabric[]>`
Returns all fabrics.

### `fetchProducts(filters?): Promise<Product[]>`
Fetches all products with joined `category`, `fabric`, `colors`, `sizes`. Optional filters:
- `category` — category id
- `collection` — collection name (ilike)
- `gender` — 'male' | 'female' | 'unisex'
- `search` — matches name_ar or description_ar (ilike)
- `minPrice`, `maxPrice` — numeric range
- `inStockOnly` — boolean

### `fetchProductBySlug(slug): Promise<Product | null>`
Single product by slug with all joins. Uses `maybeSingle()`.

### `fetchRelatedProducts(categoryId, excludeId): Promise<Product[]>`
Up to 4 products in the same category, excluding the current product.

### `fetchReviews(productId): Promise<Review[]>`
All reviews for a product, newest first.

### `addReview({ product_id, author_name, rating, comment_ar }): Promise<void>`
Inserts a review with the current guest id.

## Cart (owner-scoped via guest context)

- `fetchCart()` — all cart items with joined product
- `addToCart({ product_id, color_name_ar?, size_label?, quantity? })`
- `updateCartQuantity(id, quantity)`
- `removeFromCart(id)`

## Favorites (owner-scoped)

- `fetchFavorites()` — all favorites with joined product
- `toggleFavorite(productId)` — returns `true` if added, `false` if removed

## Orders (owner-scoped)

- `createOrder({ customer_*, shipping_*, total_amount, items[] })` — creates order + order_items, returns the order with an auto-generated `order_number`
- `fetchOrders()` — all orders for the current guest/user
- `fetchOrderItems(orderId)` — line items for an order
- `fetchOrderByNumber(orderNumber)` — for the tracking page

## Support (owner-scoped)

- `fetchOrCreateConversation()` — returns the latest conversation or creates a new one
- `fetchMessages(conversationId)` — all messages in order
- `sendMessage(conversationId, senderType, content, attachmentUrl?)`
- `requestHumanAgent(conversationId)` — transitions from AI to human agent, sets agent status

## CMS (public)

- `fetchFaqs()`, `fetchBanners()`, `fetchSocialLinks()`, `fetchSettings()`

## Supabase Client (`src/lib/supabase.ts`)

- `supabase` — singleton client instance
- `getGuestId()` — returns or creates a stable UUID from `localStorage`
- `withGuestContext(fn)` — sets `request.guest_id` session config then runs `fn`, used by all owner-scoped operations

## Types (`src/lib/types.ts`)

All TypeScript interfaces mirror the database schema exactly. Import from `src/lib/types` for type safety.

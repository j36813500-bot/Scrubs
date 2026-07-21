# Database Schema & RLS Reference

## Overview

The database has 17 tables across 4 groups: **Catalog**, **Commerce**, **Support**, and **CMS**. Row Level Security is enabled on every table.

## Catalog Tables (public read)

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name_ar | text | Arabic name |
| slug | text UNIQUE | URL slug |
| description_ar | text | |
| icon | text | icon identifier |
| sort_order | int | |

### fabrics
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name_ar | text | |
| composition_ar | text | e.g. "65% cotton / 35% polyester" |
| description_ar | text | |

### products
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category_id | uuid FK → categories | |
| fabric_id | uuid FK → fabrics | |
| name_ar | text | |
| slug | text UNIQUE | |
| description_ar | text | |
| price | numeric(10,2) | |
| compare_at_price | numeric(10,2) | original price for discounts |
| gender | text | 'male' / 'female' / 'unisex' |
| collection_ar | text | collection name |
| image_url | text | main image |
| gallery_urls | text[] | additional images |
| rating | numeric(2,1) | 0-5 |
| rating_count | int | |
| in_stock | boolean | |
| wash_instructions_ar | text | |
| specifications_ar | text | |
| size_guide_ar | text | |
| is_featured | boolean | shown on homepage |
| sort_order | int | |

### product_colors
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| product_id | uuid FK → products (CASCADE) | |
| name_ar | text | |
| hex_code | text | e.g. #F7C8D8 |
| image_url | text | optional per-color image |
| sort_order | int | |

### product_sizes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| product_id | uuid FK → products (CASCADE) | |
| size_label | text | e.g. "S", "M", "L" |
| sort_order | int | |

### reviews
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| product_id | uuid FK → products (CASCADE) | |
| user_id | uuid | nullable (guest reviews) |
| guest_id | text | nullable |
| author_name | text | |
| rating | int | 1-5 |
| comment_ar | text | |

## Commerce Tables (owner-scoped)

### favorites, cart_items
Both have `user_id` (nullable) and `guest_id` (nullable) with a CHECK constraint requiring at least one. `cart_items` also has `color_name_ar`, `size_label`, `quantity`.

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| order_number | text UNIQUE | e.g. "SCB-XYZ123" |
| user_id / guest_id | | owner |
| customer_name, customer_phone, customer_email | text | |
| shipping_address_ar, city_ar | text | |
| total_amount | numeric(10,2) | |
| status | text | pending/confirmed/shipped/delivered/cancelled |
| tracking_number | text | |
| notes_ar | text | |

### order_items
Line items linked to an order, snapshotting `product_name_ar`, `unit_price`, `quantity`, `color_name_ar`, `size_label`.

## Support Tables (owner-scoped)

### support_conversations
| Column | Type | Notes |
|--------|------|-------|
| status | text | 'ai' / 'queued' / 'agent' / 'closed' |
| agent_name | text | |
| agent_status | text | 'online' / 'typing' / 'offline' |
| last_seen_at | timestamptz | |

### support_messages
| Column | Type | Notes |
|--------|------|-------|
| sender_type | text | 'user' / 'ai' / 'agent' / 'system' |
| content_ar | text | |
| attachment_url | text | |

## CMS Tables (public read)

- **faqs**: question_ar, answer_ar, sort_order
- **banners**: title_ar, subtitle_ar, image_url, cta_text_ar, cta_link, is_active
- **social_links**: platform, label_ar, url, icon, color_hex, sort_order
- **settings**: key (PK), value_ar — site-wide config
- **notifications**: title_ar, body_ar, is_read (owner-scoped)

## RLS Policy Summary

| Table group | Read | Write |
|-------------|------|-------|
| Catalog (categories, products, etc.) | `anon, authenticated` (public) | Reviews: anyone can insert |
| Commerce (favorites, cart, orders) | Owner (`user_id` OR `guest_id` via `request.guest_id`) | Owner only |
| Support | Owner via conversation | Owner only |
| CMS | Public read | (service role for admin) |
| Notifications | Owner | Owner |

### How guest scoping works

Anonymous visitors get a stable UUID stored in `localStorage` (`scrubshop_guest_id`). Before any owner-scoped query, the client calls `set_config('request.guest_id', <id>, true)` so RLS policies can match `guest_id = current_setting('request.guest_id')`. This lets cart, favorites, orders, and support conversations persist for guests without requiring sign-in.

## Indexes

Created on all frequently-queried columns: `products(category_id)`, `products(slug)`, `products(is_featured)`, `product_colors(product_id)`, `product_sizes(product_id)`, `reviews(product_id)`, `favorites(user_id/guest_id)`, `cart_items(user_id/guest_id)`, `orders(user_id/guest_id)`, `order_items(order_id)`, `support_conversations(guest_id)`, `support_messages(conversation_id)`.

## Idempotency

The entire `schema.sql` is safe to run multiple times — tables use `IF NOT EXISTS`, sample data uses `WHERE NOT EXISTS` guards, and policies use `DROP POLICY IF EXISTS` before creation.

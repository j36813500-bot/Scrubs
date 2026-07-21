# Components Reference

## Layout Components

### `CinematicBackground` (`src/components/CinematicBackground.tsx`)
Fixed full-screen animated background. Renders:
- Base gradient (blush → lavender → beige)
- 4 large floating blurred orbs with staggered animations
- A canvas with 28 glowing particles drifting slowly (GPU-accelerated, 60 FPS)

### `Navbar` (`src/components/Navbar.tsx`)
Cinematic glass navigation bar.
- Glass pill that intensifies shadow on scroll
- Logo with gradient + animated brand text
- Desktop nav links with active-state gradient pill
- Cart + favorites buttons with live count badges (fetched from Supabase)
- Mobile drawer with all links (including footer policy links)
- RTL layout

### `Footer` (`src/components/Footer.tsx`)
Glass card footer with brand story, quick links, and support CTA.

### `ProductCard` (`src/components/ProductCard.tsx`)
Premium floating 3D product card. Features:
- Mouse-move tilt (rotateX/rotateY) with perspective
- Image zoom on hover + reflection sheen sweep
- Favorite button (toggles in Supabase)
- Discount badge
- Quick preview overlay
- Color swatches + size pills
- Price (with compare-at strikethrough) + add button
- Staggered fade-in-up entrance animation

## Page Components (`src/pages/`)

### `HomePage`
- Cinematic 3D hero: rotating ring, breathing product image, floating glass info panels, parallax medical icons, stats
- Category grid with gradient icon tiles
- Banner carousel (from `banners` table)
- Featured products grid (from `is_featured` products)
- Features strip (shipping, quality, returns, support)
- CTA section

### `StorePage`
- Live search with dropdown suggestions (debounced)
- Advanced filter panel: category, gender, collection, fabric, price range, availability
- Sort: featured / price asc / price desc / rating
- Responsive product grid with loading skeletons and empty state

### `ProductPage`
- **3D virtual fitting**: drag to rotate a mannequin 360°, auto-rotate toggle, reset, dual-face image for back view, rotating rings, platform shadow
- Color + size selectors
- Quantity stepper
- Add to cart / Buy now
- Tabs: description, specifications, wash instructions, size guide, reviews
- Reviews list + add-review form
- Related products

### `CartPage`
- Cart items with quantity controls and remove
- Order summary with shipping calculation
- Checkout form (name, phone, email, address, city, notes)
- Order placement → success screen with order number

### `FavoritesPage`
- Grid of favorited products with remove buttons

### `TrackPage`
- Search by order number
- Order detail card with status progress timeline (pending → confirmed → shipped → delivered)
- List of previous orders

### `AboutPage` (من نحن)
- Brand story hero
- Vision / Mission / Values glass cards
- Stats banner
- Social media glass cards (TikTok, Facebook, Instagram, WhatsApp) with glow hover effects

### `SupportPage` (اتكلم معانا)
- AI chat assistant with:
  - Animated message bubbles (user right, AI left, system centered)
  - Typing indicators (3 bouncing dots)
  - Smart suggestion chips
  - Emoji bar
  - Image attachment + voice-ready UI buttons
  - Auto-scroll
- **Human handoff**: "التواصل مع خدمة العملاء" button transitions conversation to agent, preserves history, shows live status (online / typing / last seen)
- Rule-based Arabic AI responder (no external API needed)

### `FaqPage`
- Accordion of FAQs from the database

### `PolicyPage` (returns / privacy / terms)
- Numbered glass cards with policy sections

## Router (`src/lib/router.tsx`)
Lightweight hash-based router (no dependencies). Provides `useRouter()` with `path`, `query`, and `navigate(to)`. Scroll-to-top on navigation.

## Page Transitions (`src/App.tsx`)
On route change, a radial blur overlay fades in then out, and the page mounts with `page-enter` / `page-enter-active` CSS classes for a cinematic scene transition.

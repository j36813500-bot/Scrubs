# اسكربك — Premium Arabic Medical Scrubs E-commerce

A breathtaking, futuristic, cinematic Arabic e-commerce platform for selling high-quality medical scrubs to doctors, nurses, pharmacists, dentists, medical students, and all healthcare professionals.

Built with **React + TypeScript + Vite + Tailwind CSS + Supabase**.

---

## ✨ Features

- **Cinematic 3D hero** with rotating virtual model, floating medical icons, parallax depth, and particle effects
- **Premium floating 3D product cards** with tilt, reflection, lighting, favorite, quick preview, and add-to-cart
- **3D virtual fitting experience** — drag to rotate a mannequin 360°, auto-rotate, zoom, inspect details
- **Intelligent search** with live suggestions and typo-tolerant predictive filtering
- **Advanced filters** by color, size, price, gender, collection, fabric, availability
- **AI-powered chat assistant** (اتكلم معانا) with typing indicators, emoji, attachments, smart suggestions, and seamless handoff to a human agent with live status (online / typing / last seen)
- **Full Arabic pages**: الرئيسية، المتجر، السلة، المفضلة، تتبع الطلبات، من نحن، اتكلم معانا، الأسئلة الشائعة، سياسة الاستبدال والاسترجاع، سياسة الخصوصية، الشروط والأحكام
- **Cinematic page transitions** with blur, depth, and smooth camera-like motion
- **Mobile-first responsive** design with 60 FPS GPU-accelerated animations
- **Supabase backend** — production-ready database with RLS, indexes, relationships, and sample data
- **Guest cart & favorites** that persist via a stable guest ID (no login required)

---

## 🎨 Design System

- **Palette**: soft pink / blush, lavender, white, warm beige, subtle gold accents
- **Typography**: Cairo + Tajawal (modern Arabic fonts)
- **Effects**: glassmorphism, soft lighting, realistic shadows, floating UI, premium micro-interactions
- **Spacing**: 8px system, 150% body line-height, 120% headings

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Inline SVG (lucide-react available) |
| Backend | Supabase (Postgres + RLS) |
| Fonts | Google Fonts (Cairo, Tajawal) |

---

## 📦 Installation (Beginner Guide)

### Step 1 — Install Node.js
Download and install Node.js LTS from https://nodejs.org (version 18 or higher).

### Step 2 — Get the project files
Unzip the project package to a folder on your computer.

### Step 3 — Install dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### Step 4 — Set up environment variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```
Find these in your Supabase Dashboard → **Settings → API**.

### Step 5 — Set up the database
1. Open your Supabase Dashboard → **SQL Editor** → **New query**.
2. Open `database/schema.sql` from this project.
3. Copy the entire file content and paste it into the SQL editor.
4. Click **RUN**. This creates all tables, RLS policies, indexes, and sample data.

### Step 6 — Run the project
```bash
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173).

### Step 7 — Build for production
```bash
npm run build
```
The optimized output goes to the `dist/` folder.

---

## 📁 Folder Structure

```
اسكربك/
├── database/
│   └── schema.sql          # Complete SQL — copy/paste into Supabase SQL Editor
├── docs/
│   ├── API.md              # Data access layer documentation
│   ├── COMPONENTS.md       # Component reference
│   └── DATABASE.md         # Schema & RLS documentation
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CinematicBackground.tsx   # Animated particle + orb background
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx                 # Cinematic glass nav with mobile drawer
│   │   └── ProductCard.tsx           # 3D tilt floating card
│   ├── lib/
│   │   ├── api.ts                     # All Supabase data access functions
│   │   ├── router.tsx                 # Lightweight hash router
│   │   ├── supabase.ts                # Supabase client + guest context
│   │   └── types.ts                   # TypeScript types matching the schema
│   ├── pages/
│   │   ├── HomePage.tsx               # Cinematic 3D hero + featured products
│   │   ├── StorePage.tsx              # Search + advanced filters + grid
│   │   ├── ProductPage.tsx            # 3D virtual fitting + details + reviews
│   │   ├── CartPage.tsx               # Cart + checkout + order placement
│   │   ├── FavoritesPage.tsx
│   │   ├── TrackPage.tsx              # Order tracking with progress timeline
│   │   ├── AboutPage.tsx              # من نحن + social glass cards
│   │   ├── SupportPage.tsx            # اتكلم معانا — AI chat + human handoff
│   │   ├── FaqPage.tsx
│   │   └── PolicyPage.tsx             # Returns / Privacy / Terms
│   ├── App.tsx                         # Router + page transitions
│   ├── main.tsx
│   └── index.css                      # Design system: colors, glass, animations
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🗄 Database Overview

17 tables with Row Level Security enabled on every table:

| Table | Purpose |
|-------|---------|
| `categories` | Product collections by medical profession |
| `fabrics` | Fabric/material definitions |
| `products` | Scrubs catalog |
| `product_colors` | Available colors per product |
| `product_sizes` | Available sizes per product |
| `reviews` | Customer ratings + comments |
| `favorites` | User wishlist (guest + auth) |
| `cart_items` | Shopping cart (guest + auth) |
| `orders` | Placed orders |
| `order_items` | Line items per order |
| `support_conversations` | AI + human support sessions |
| `support_messages` | Messages in a support conversation |
| `faqs` | Frequently asked questions |
| `banners` | Homepage banners |
| `social_links` | Social media links |
| `settings` | Site-wide key/value settings |
| `notifications` | User notifications |

See `docs/DATABASE.md` for the full schema and RLS policy reference.

---

## 🔐 Security

- RLS enabled on **every** table
- Catalog tables: public read (`anon, authenticated`)
- Ownership tables: scoped by `user_id` (auth) or `guest_id` (anonymous) via `request.guest_id` session config
- Guest IDs are stable UUIDs stored in `localStorage`

---

## 🚀 Deployment

This project is ready to deploy on any static host (Vercel, Netlify, Cloudflare Pages, etc.):

1. Run `npm run build`
2. Deploy the `dist/` folder
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your host

---

## 📝 Notes

- Product images use Pexels stock photos (referenced, not downloaded)
- The AI chat assistant is rule-based (Arabic) — no external API key required. To upgrade to a real LLM, deploy a Supabase Edge Function that proxies an AI API and update `SupportPage.tsx`.
- The 3D fitting experience uses CSS 3D transforms (no heavy WebGL libs) for maximum performance on mobile.

---

© 2026 اسكربك. Built with love for healthcare professionals.

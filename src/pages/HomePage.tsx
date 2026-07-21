import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchFeaturedProducts, fetchProducts, fetchCategories, fetchBanners } from '../lib/api';
import type { Product, Category, Banner } from '../lib/types';

// ============================================================================
// HomePage — Premium Arabic (RTL) medical scrubs e-commerce landing page
// Palette: blush (pink) · lavender (purple) · beige (neutral) · gold (accent)
// Effects: glass morphism, ambient glow orbs, premium gradient text, float
// ============================================================================

const AUTO_ROTATE_MS = 5000;

// ----------------------------------------------------------------------------
// Inline SVG icons (lucide-react style, stroke-based, 24x24 viewBox)
// ----------------------------------------------------------------------------
type IconProps = { className?: string };

function ArrowLeftIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function StarIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
    </svg>
  );
}

// Default category icon when none is provided
function GridIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Ambient glow orbs — blurred, animated background accents
// ----------------------------------------------------------------------------
function GlowOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="animate-float-medium absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)' }}
      />
      <div
        className="animate-float-medium absolute top-1/3 -left-32 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 70%)', animationDelay: '1.2s' }}
      />
      <div
        className="animate-float-medium absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)', animationDelay: '2.1s' }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Skeleton blocks
// ----------------------------------------------------------------------------
function BannerSkeleton() {
  return (
    <div className="glass-card relative h-56 sm:h-64 w-full overflow-hidden rounded-3xl">
      <div className="h-full w-full animate-pulse bg-gradient-to-l from-blush-100/60 to-lavender-100/60" />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="glass-card flex h-28 w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl">
      <div className="h-10 w-10 animate-pulse rounded-full bg-blush-200/50" />
      <div className="h-3 w-20 animate-pulse rounded-full bg-lavender-200/50" />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="aspect-[3/4] w-full animate-pulse bg-gradient-to-br from-blush-100/60 to-lavender-100/60" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-blush-200/50" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-lavender-200/50" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Section heading with premium gradient text
// ----------------------------------------------------------------------------
function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="premium-gradient-text text-2xl font-bold tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

// ----------------------------------------------------------------------------
// Product card
// ----------------------------------------------------------------------------
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card group block w-full overflow-hidden rounded-2xl text-right transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name_ar}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Featured badge */}
        {product.is_featured && (
          <span className="absolute top-2 right-2 rounded-full bg-gradient-to-br from-gold-400 to-blush-400 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
            مميز
          </span>
        )}
        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-stone-700">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-stone-800">{product.name_ar}</h3>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1">
            <StarIcon className="h-3.5 w-3.5 text-gold-400" />
            <span className="text-xs font-medium text-stone-500">
              {product.rating.toFixed(1)} ({product.rating_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-blush-600">
            {product.price.toLocaleString('ar-EG')} ر.س
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-stone-400 line-through">
              {product.compare_at_price.toLocaleString('ar-EG')}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ----------------------------------------------------------------------------
// Category card
// ----------------------------------------------------------------------------
function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card group flex h-28 w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl text-center transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender-400/60"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blush-200 to-lavender-200 text-blush-700 transition-colors group-hover:from-blush-300 group-hover:to-lavender-300">
        <GridIcon className="h-6 w-6" />
      </span>
      <span className="line-clamp-1 px-2 text-sm font-semibold text-stone-800">
        {category.name_ar}
      </span>
    </button>
  );
}

// ----------------------------------------------------------------------------
// Banner slide
// ----------------------------------------------------------------------------
function BannerSlide({
  banner,
  onCta,
  active,
}: {
  banner: Banner;
  onCta: () => void;
  active: boolean;
}) {
  return (
    <div
      className={[
        'glass-card absolute inset-0 overflow-hidden rounded-3xl transition-opacity duration-700',
        active ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!active}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={banner.image_url}
          alt={banner.title_ar}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-center gap-2 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white drop-shadow-md sm:text-2xl">
          {banner.title_ar}
        </h3>
        {banner.subtitle_ar && (
          <p className="max-w-md text-sm text-white/90 drop-shadow-sm sm:text-base">
            {banner.subtitle_ar}
          </p>
        )}
        {banner.cta_text_ar && (
          <button
            type="button"
            onClick={onCta}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-lavender-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blush-500/30 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {banner.cta_text_ar}
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HomePage component
// ============================================================================
export default function HomePage() {
  const { navigate } = useRouter();

  // ---- State ----
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const [activeBanner, setActiveBanner] = useState(0);

  // ---- Data fetching ----
  useEffect(() => {
    let cancelled = false;

    fetchBanners()
      .then((data) => {
        if (!cancelled) setBanners(data);
      })
      .catch(() => {
        /* banners are non-critical; silently ignore */
      })
      .finally(() => {
        if (!cancelled) setBannersLoading(false);
      });

    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategoriesLoading(false);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    fetchFeaturedProducts()
      .then((data) => {
        if (!cancelled) setFeatured(data);
      })
      .catch(() => {
        if (!cancelled) setFeaturedLoading(false);
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });

    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setProductsLoading(false);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Banner auto-rotation ----
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  // ---- Navigation handlers ----
  const goStore = () => navigate('/store');
  const goProduct = (slug: string) => navigate(`/product/${slug}`);
  const goCategory = (slug: string) => navigate(`/store?cat=${slug}`);
  const goBannerCta = (link: string) => {
    if (link) navigate(link);
    else goStore();
  };

  // ---- Render ----
  return (
    <div dir="rtl" className="relative min-h-screen w-full bg-beige-50 text-stone-800">
      <GlowOrbs />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <header className="animate-fade-in-up relative px-4 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          {/* Logo */}
          <div className="animate-float-medium flex h-20 w-20 items-center justify-center rounded-full shadow-xl shadow-blush-300/40 sm:h-24 sm:w-24"
            style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 100%)' }}
          >
            <span className="text-4xl font-bold text-white drop-shadow-sm sm:text-5xl">س</span>
          </div>

          {/* Brand name */}
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            اسكربك
          </h1>

          {/* Tagline */}
          <p className="text-base font-medium text-stone-600 sm:text-lg">
            يونيفورمات طبية فاخرة
          </p>

          {/* CTA */}
          <button
            type="button"
            onClick={goStore}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-lavender-500 px-7 py-3 text-base font-bold text-white shadow-lg shadow-blush-500/30 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            تصفح المتجر
            <ArrowLeftIcon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Banner carousel                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-4 py-6" aria-label="العروض المميزة">
        <div className="mx-auto max-w-5xl">
          {bannersLoading ? (
            <BannerSkeleton />
          ) : banners.length === 0 ? null : (
            <div className="relative h-56 sm:h-64">
              {banners.map((banner, i) => (
                <BannerSlide
                  key={banner.id}
                  banner={banner}
                  active={i === activeBanner}
                  onCta={() => goBannerCta(banner.cta_link)}
                />
              ))}

              {/* Dots */}
              {banners.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveBanner(i)}
                      aria-label={`الشريحة ${i + 1}`}
                      className={[
                        'h-2 rounded-full transition-all duration-300',
                        i === activeBanner
                          ? 'w-6 bg-gradient-to-l from-blush-400 to-lavender-400'
                          : 'w-2 bg-white/60 hover:bg-white/80',
                      ].join(' ')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Categories                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-6" aria-label="الفئات">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-4">
            <SectionHeading>تسوق حسب الفئة</SectionHeading>
          </div>

          {categoriesLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : categories.length === 0 ? null : (
            <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => goCategory(category.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured products                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-6" aria-label="المنتجات المميزة">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4">
            <SectionHeading>منتجات مميزة</SectionHeading>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : featured.length === 0 ? null : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => goProduct(product.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* All products                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-6 pb-28 lg:pb-10" aria-label="جميع المنتجات">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4">
            <SectionHeading>جميع المنتجات</SectionHeading>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">لا توجد منتجات حالياً.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => goProduct(product.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

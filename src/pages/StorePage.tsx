import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories } from '../lib/api';
import type { Product, Category } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Format a number as a localized Arabic price string. */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Parse the current URL's query string into a simple key/value map. */
function getQueryParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/* Skeleton card (loading state)                                              */
/* -------------------------------------------------------------------------- */

const SkeletonCard: React.FC = () => (
  <div className="glass-card rounded-3xl overflow-hidden">
    <div className="aspect-3/4 w-full bg-gradient-to-br from-beige-100/60 to-beige-200/40 animate-pulse" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 w-3/4 rounded-full bg-beige-200/60 animate-pulse" />
      <div className="h-5 w-1/3 rounded-full bg-beige-200/50 animate-pulse" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Product card                                                               */
/* -------------------------------------------------------------------------- */

type ProductCardProps = {
  product: Product;
  onClick: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group glass-card rounded-3xl overflow-hidden text-right w-full transition-all duration-300 hover:scale-[1.03] hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
    >
      {/* Image */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-beige-100/40">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name_ar}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-beige-300">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9 4.5 4h15L21 9" />
              <path d="M3 9v11h18V9" />
              <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            </svg>
          </div>
        )}

        {/* Out-of-stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-beige-700/80 px-4 py-1.5 text-xs font-semibold text-white">
              غير متوفر
            </span>
          </div>
        )}

        {/* Compare-at price badge */}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-3 right-3 rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
            خصم
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-beige-800 leading-snug">
          {product.name_ar}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-blush-600">
            {formatPrice(product.price)} ج.م
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-beige-400 line-through">
              {formatPrice(product.compare_at_price)} ج.م
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-beige-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="text-gold-400"
            >
              <path d="M12 2.5l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.6 5.9 20.9l1.4-6.8L2.2 9.5l6.9-.7L12 2.5z" />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-beige-300">({product.rating_count})</span>
          </div>
        )}
      </div>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* StorePage                                                                   */
/* -------------------------------------------------------------------------- */

const StorePage: React.FC = () => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  /* ----------------------------------------------------------------------- */
  /* Initial data load + URL param sync                                      */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [allProducts, allCategories] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        if (cancelled) return;
        setProducts(allProducts);
        setCategories(allCategories);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load store data:', err);
        setError('تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Read URL query params (cat + collection) on mount and on popstate. */
  useEffect(() => {
    function syncFromUrl() {
      const params = getQueryParams();
      if (params['cat']) setActiveCategory(params['cat']);
      if (params['collection']) setCollectionFilter(params['collection']);
    }

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Derived: filtered products                                               */
  /* ----------------------------------------------------------------------- */

  const filteredProducts: Product[] = products.filter((p) => {
    // Category filter
    if (activeCategory !== 'all' && p.category_id !== activeCategory) return false;

    // Collection filter
    if (collectionFilter && p.collection_ar !== collectionFilter) return false;

    // Search filter (by Arabic name, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (!p.name_ar.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  /* ----------------------------------------------------------------------- */
  /* Handlers                                                                 */
  /* ----------------------------------------------------------------------- */

  function handleCategorySelect(catId: string): void {
    setActiveCategory(catId);
    // Update the URL so the selection is shareable / survives refresh.
    const params = new URLSearchParams(window.location.search);
    if (catId === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', catId);
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }

  function navigateToProduct(slug: string): void {
    router.push(`/product/${slug}`);
  }

  function clearFilters(): void {
    setSearchQuery('');
    setActiveCategory('all');
    setCollectionFilter(null);
    window.history.replaceState(null, '', window.location.pathname);
  }

  /* ----------------------------------------------------------------------- */
  /* Render                                                                   */
  /* ----------------------------------------------------------------------- */

  const activeCategoryLabel =
    activeCategory === 'all'
      ? 'الكل'
      : categories.find((c) => c.id === activeCategory)?.name_ar ?? 'الكل';

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-300/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            المتجر
          </h1>
          <p className="mt-2 text-sm text-beige-500">
            اكتشف تشكيلتنا الفاخرة من الزي الطبي
          </p>
        </header>

        {/* Search bar */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-xl">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              aria-label="بحث عن منتج"
              className="input-premium w-full rounded-full py-3 pr-12 pl-4 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
            />
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-beige-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* Collection filter banner (when active) */}
        {collectionFilter && (
          <div className="mb-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blush-100 to-lavender-100 px-4 py-2 text-sm text-beige-700">
              <span>مجموعة:</span>
              <span className="font-semibold">{collectionFilter}</span>
              <button
                type="button"
                onClick={() => {
                  setCollectionFilter(null);
                  const params = new URLSearchParams(window.location.search);
                  params.delete('collection');
                  const qs = params.toString();
                  const newUrl = qs
                    ? `${window.location.pathname}?${qs}`
                    : window.location.pathname;
                  window.history.replaceState(null, '', newUrl);
                }}
                className="mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-beige-500 transition hover:bg-white hover:text-blush-500"
                aria-label="إزالة فلتر المجموعة"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="mb-8">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 px-1">
            {/* "الكل" pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={
                'whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ' +
                (activeCategory === 'all'
                  ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow'
                  : 'glass text-beige-600 hover:text-beige-800')
              }
            >
              الكل
            </button>

            {/* Category pills */}
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={
                    'whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ' +
                    (isActive
                      ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow'
                      : 'glass text-beige-600 hover:text-beige-800')
                  }
                >
                  {cat.name_ar}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between px-1">
            <p className="text-sm text-beige-500">
              {filteredProducts.length > 0
                ? `${filteredProducts.length} منتج`
                : 'لا توجد منتجات'}
              {activeCategory !== 'all' && ` في "${activeCategoryLabel}"`}
            </p>
            {(searchQuery || activeCategory !== 'all' || collectionFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-blush-500 underline-offset-2 hover:underline"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        )}

        {/* Grid: loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-blush-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-beige-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-beige-100 to-beige-200/60 text-beige-400">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9 4.5 4h15L21 9" />
                <path d="M3 9v11h18V9" />
                <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-beige-700">لا توجد منتجات مطابقة</h3>
            <p className="mt-1 max-w-xs text-sm text-beige-500">
              لم نعثر على منتجات تطابق بحثك أو الفلاتر المحددة. جرّب تعديل الفلاتر أو مسحها.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigateToProduct(product.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;

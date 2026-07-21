import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchFavorites, fetchProducts, toggleFavorite } from '../lib/api';
import type { Product, Favorite } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Format a number as a localized Arabic price string. */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 0,
  }).format(value);
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
/* Favorite product card                                                       */
/* -------------------------------------------------------------------------- */

type FavoriteCardProps = {
  product: Product;
  onNavigate: () => void;
  onRemove: () => void;
  removing: boolean;
};

const FavoriteCard: React.FC<FavoriteCardProps> = ({
  product,
  onNavigate,
  onRemove,
  removing,
}) => {
  return (
    <div className="group glass-card relative rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-glow">
      {/* Remove-from-favorites button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={removing}
        aria-label="إزالة من المفضلة"
        className="absolute top-3 left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-blush-500 shadow-md transition-all duration-200 hover:bg-white hover:scale-110 hover:text-blush-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={removing ? 'none' : 'currentColor'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={removing ? 'animate-pulse' : ''}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Clickable area → product page */}
      <button
        type="button"
        onClick={onNavigate}
        className="block w-full text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60 rounded-3xl"
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

          {/* Discount badge */}
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
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FavoritesPage                                                               */
/* -------------------------------------------------------------------------- */

const FavoritesPage: React.FC = () => {
  const router = useRouter();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  /* ----------------------------------------------------------------------- */
  /* Initial data load                                                        */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [favs, allProducts] = await Promise.all([
          fetchFavorites(),
          fetchProducts(),
        ]);
        if (cancelled) return;
        setFavorites(favs);
        setProducts(allProducts);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load favorites:', err);
        setError('تعذر تحميل المفضلة. يرجى المحاولة مرة أخرى.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Derived: favorite products (preserve favorites order)                    */
  /* ----------------------------------------------------------------------- */

  const favoriteProducts: Product[] = favorites
    .map((fav) => products.find((p) => p.id === fav.product_id))
    .filter((p): p is Product => p !== undefined);

  /* ----------------------------------------------------------------------- */
  /* Handlers                                                                 */
  /* ----------------------------------------------------------------------- */

  function navigateToProduct(slug: string): void {
    router.push(`/product/${slug}`);
  }

  async function handleRemove(productId: string): Promise<void> {
    setRemovingId(productId);
    try {
      const nowFavorite = await toggleFavorite(productId);
      if (!nowFavorite) {
        // toggleFavorite returns false when the item was removed.
        setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingId(null);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Render                                                                   */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30"
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-300/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            المفضلة
          </h1>
          <p className="mt-2 text-sm text-beige-500">
            قطعك المختارة بعناية في مكان واحد
          </p>
        </header>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-blush-400">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
        {!loading && !error && favoriteProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blush-100 to-lavender-100/60 text-blush-400 shadow-md">
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-beige-700">
              لا توجد منتجات في المفضلة
            </h3>
            <p className="mt-1 max-w-xs text-sm text-beige-500">
              استكشف متجرنا واضغط على رمز القلب لإضافة القطع التي تحبها هنا.
            </p>
            <button
              type="button"
              onClick={() => router.push('/store')}
              className="mt-6 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-7 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
            >
              تصفح المتجر
            </button>
          </div>
        )}

        {/* Favorites grid */}
        {!loading && !error && favoriteProducts.length > 0 && (
          <>
            {/* Count */}
            <div className="mb-5 px-1">
              <p className="text-sm text-beige-500">
                {favoriteProducts.length}{' '}
                {favoriteProducts.length === 1 ? 'منتج' : 'منتجات'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {favoriteProducts.map((product) => (
                <FavoriteCard
                  key={product.id}
                  product={product}
                  onNavigate={() => navigateToProduct(product.slug)}
                  onRemove={() => handleRemove(product.id)}
                  removing={removingId === product.id}
                />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => router.push('/store')}
                className="rounded-full glass-card px-7 py-2.5 text-sm font-semibold text-beige-700 transition hover:scale-105 hover:text-blush-600"
              >
                تصفّح المزيد من القطع
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

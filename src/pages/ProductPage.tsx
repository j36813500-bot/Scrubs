import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import {
  fetchProductBySlug,
  fetchReviews,
  addReview,
  addToCart,
  toggleFavorite,
  fetchFavorites,
  fetchProductColors,
  fetchProductSizes,
} from '../lib/api';
import { getUser } from '../lib/auth';
import type { Product, Review, ProductColor, ProductSize } from '../lib/types';
import ImageViewer from '../components/ImageViewer';
import AuthGateModal from '../components/AuthGateModal';

/* ============================================================
 * ProductPage — premium Arabic (RTL) medical scrubs product detail
 * ------------------------------------------------------------
 * Reads slug from the URL path, fetches the product + reviews +
 * colors + sizes, and renders a full PDP with image gallery, 3D
 * viewer, color/size selectors, collapsible spec sections, quantity,
 * add-to-cart / buy-now, favorites, and a reviews section.
 * ============================================================ */

/* ---------- small presentational helpers ---------- */

function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  // value is 0..5 (can be fractional). Render 5 stars; filled portion uses gold.
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = i === full && hasHalf;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled || half ? 'url(#starGold)' : 'none'}
            stroke={filled || half ? '#d4a017' : '#d1d5db'}
            strokeWidth="1.6"
            strokeLinejoin="round"
            aria-hidden
          >
            {half && (
              <defs>
                <linearGradient id="starGold" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#d4a017" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2.5l2.9 6.0 6.6.9-4.8 4.6 1.2 6.6L12 18.9 6.1 21.2l1.2-6.6L2.5 9.9l6.6-.9L12 2.5z" />
          </svg>
        );
      })}
    </div>
  );
}

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-lavender-200/60 rounded-2xl bg-white/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-right font-arabic text-sm font-semibold text-plum-800 transition hover:bg-lavender-50"
      >
        <span>{title}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-plum-700 font-arabic whitespace-pre-line">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function ProductPage() {
  const router = useRouter();
  const path = router.path;
  const slug = path.replace('/product/', '');

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // image gallery
  const galleryImages: string[] = (() => {
    if (!product) return [];
    const g = (product.gallery_urls || []).slice(0, 3);
    return g.length > 0 ? g : [product.image_url];
  })();
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // selections
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  // favorites
  const [isFavorite, setIsFavorite] = useState(false);

  // auth gate
  const [authGateOpen, setAuthGateOpen] = useState(false);

  // review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // action feedback
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  /* ----- fetch product + related data ----- */
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchProductBySlug(slug);
        if (cancelled) return;
        if (!p) {
          setError('المنتج غير موجود');
          setLoading(false);
          return;
        }
        setProduct(p);
        setSelectedImage(0);
        setQuantity(1);

        const [revs, cols, szs] = await Promise.all([
          fetchReviews(p.id),
          fetchProductColors(p.id),
          fetchProductSizes(p.id),
        ]);
        if (cancelled) return;
        setReviews(revs);
        setColors(cols);
        setSizes(szs);
        setSelectedColor(cols[0] || null);
        setSelectedSize(szs[0] || null);
        setLoading(false);

        // favorites check
        try {
          const favs = await fetchFavorites();
          if (cancelled) return;
          setIsFavorite(favs.some((f) => f.product_id === p.id));
        } catch {
          /* favorites optional */
        }
      } catch (e) {
        if (!cancelled) {
          setError('تعذّر تحميل المنتج');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ----- handlers ----- */

  function handleFavoriteToggle() {
    if (!product) return;
    toggleFavorite(product.id)
      .then((nowFav) => setIsFavorite(nowFav))
      .catch(() => {});
  }

  async function handleAddToCart(buyNow = false) {
    if (!product) return;
    const user = getUser();
    if (!user) {
      setAuthGateOpen(true);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart({
        product_id: product.id,
        color_name_ar: selectedColor?.name_ar || undefined,
        size_label: selectedSize?.size_label || undefined,
        quantity,
      });
      if (buyNow) {
        router.push('/cart');
        return;
      }
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2200);
    } catch {
      // silent — could add a toast
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview(product.id, reviewName.trim(), reviewRating, reviewComment.trim());
      const fresh = await fetchReviews(product.id);
      setReviews(fresh);
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
    } catch {
      /* noop */
    } finally {
      setSubmittingReview(false);
    }
  }

  /* ----- loading / error states ----- */

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-[60vh] items-center justify-center bg-beige-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blush-300 border-t-blush-600" />
          <p className="mt-4 font-arabic text-sm text-plum-500">جارٍ التحميل…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div dir="rtl" className="flex min-h-[60vh] items-center justify-center bg-beige-50 px-4">
        <div className="text-center">
          <p className="font-arabic text-lg font-semibold text-plum-800">
            {error || 'المنتج غير موجود'}
          </p>
          <button
            onClick={() => router.push('/store')}
            className="btn-premium mt-6"
          >
            العودة إلى المتجر
          </button>
        </div>
      </div>
    );
  }

  /* ----- derived ----- */

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  /* ----- render ----- */

  return (
    <div dir="rtl" className="min-h-screen bg-beige-50 pb-16">
      {/* ---- Breadcrumb ---- */}
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <nav className="flex items-center gap-1.5 font-arabic text-xs text-plum-500">
          <button onClick={() => router.push('/')} className="transition hover:text-blush-600">
            الرئيسية
          </button>
          <span className="text-plum-300">/</span>
          <button onClick={() => router.push('/store')} className="transition hover:text-blush-600">
            المتجر
          </button>
          <span className="text-plum-300">/</span>
          <span className="truncate font-semibold text-plum-800">{product.name_ar}</span>
        </nav>
      </div>

      {/* ---- Main grid ---- */}
      <div className="mx-auto mt-5 grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
        {/* ============ LEFT: Gallery ============ */}
        <div className="flex flex-col gap-4">
          {/* Main image */}
          <div className="group relative">
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="relative block w-full overflow-hidden rounded-3xl bg-white shadow-premium transition"
              style={{ aspectRatio: '3 / 4' }}
            >
              <img
                src={galleryImages[selectedImage] || product.image_url}
                alt={product.name_ar}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* gradient overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,0.06) 100%)',
                }}
              />

              {/* 3D View badge button */}
              <span
                className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blush-500 to-lavender-500 px-3.5 py-1.5 font-arabic text-xs font-bold text-white shadow-lg transition group-hover:scale-105"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
                العرض ثلاثي الأبعاد
              </span>

              {/* hover hint */}
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 rounded-full bg-black/55 px-4 py-1.5 font-arabic text-xs text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ backdropFilter: 'blur(6px)' }}>
                اضغط لتجربة العرض ثلاثي الأبعاد
              </span>
            </button>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative overflow-hidden rounded-2xl bg-white transition ${
                    selectedImage === i
                      ? 'ring-2 ring-blush-400 ring-offset-2 ring-offset-beige-50'
                      : 'ring-1 ring-lavender-200/60 hover:ring-blush-300'
                  }`}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <img src={img} alt={`${product.name_ar} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============ RIGHT: Details ============ */}
        <div className="flex flex-col gap-5">
          {/* Name + favorite */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="font-display text-2xl font-black text-plum-900">{product.name_ar}</h1>
              {product.collection_ar && (
                <p className="mt-1 font-arabic text-sm font-medium text-blush-600">
                  {product.collection_ar}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lavender-200 bg-white transition hover:scale-105 hover:border-blush-300"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={isFavorite ? '#ec4899' : 'none'}
                stroke={isFavorite ? '#ec4899' : '#9ca3af'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRow value={product.rating || 0} />
            <span className="font-arabic text-xs text-plum-500">
              {product.rating?.toFixed(1) || '0.0'} ({product.rating_count || 0} تقييم)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="premium-gradient-text font-display text-3xl font-black">
              {product.price.toLocaleString('ar')} ر.س
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="font-arabic text-lg text-plum-400 line-through">
                  {product.compare_at_price.toLocaleString('ar')} ر.س
                </span>
                <span className="rounded-full bg-blush-100 px-2.5 py-1 font-arabic text-xs font-bold text-blush-700">
                  خصم {discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description_ar && (
            <p className="font-arabic text-sm leading-relaxed text-plum-700">
              {product.description_ar}
            </p>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="mb-2 font-arabic text-sm font-semibold text-plum-800">
                اللون: {selectedColor && <span className="text-plum-500">{selectedColor.name_ar}</span>}
              </p>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => {
                  const active = selectedColor?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      aria-label={c.name_ar}
                      title={c.name_ar}
                      className={`relative h-10 w-10 rounded-full transition hover:scale-110 ${
                        active ? 'ring-2 ring-blush-400 ring-offset-2 ring-offset-beige-50' : 'ring-1 ring-lavender-200'
                      }`}
                      style={{ backgroundColor: c.hex_code }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="mb-2 font-arabic text-sm font-semibold text-plum-800">المقاس</p>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((s) => {
                  const active = selectedSize?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] rounded-full px-4 py-2 font-arabic text-sm font-semibold transition ${
                        active
                          ? 'bg-gradient-to-r from-blush-500 to-lavender-500 text-white shadow-md'
                          : 'border border-lavender-200 bg-white text-plum-700 hover:border-blush-300'
                      }`}
                    >
                      {s.size_label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsible sections */}
          <div className="flex flex-col gap-3">
            {product.size_guide_ar && (
              <Collapsible title="دليل المقاسات">
                {product.size_guide_ar}
              </Collapsible>
            )}
            {product.specifications_ar && (
              <Collapsible title="المواصفات">
                {product.specifications_ar}
              </Collapsible>
            )}
            {product.wash_instructions_ar && (
              <Collapsible title="تعليمات الغسيل">
                {product.wash_instructions_ar}
              </Collapsible>
            )}
          </div>

          {/* Stock status */}
          <div>
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-arabic text-xs font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                متوفر في المخزون
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-arabic text-xs font-semibold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                غير متوفر حالياً
              </span>
            )}
          </div>

          {/* Quantity + Add to cart + Buy now */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="font-arabic text-sm font-semibold text-plum-800">الكمية</span>
              <div className="flex items-center rounded-full border border-lavender-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-plum-600 transition hover:text-blush-600 disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="إنقاص"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-10 text-center font-arabic text-sm font-bold text-plum-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="flex h-9 w-9 items-center justify-center text-plum-600 transition hover:text-blush-600"
                  aria-label="زيادة"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!product.in_stock || addingToCart}
                className="btn-premium flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingToCart ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : cartAdded ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    تمت الإضافة
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    أضف إلى السلة
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={!product.in_stock || addingToCart}
                className="btn-ghost flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                اشترِ الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Reviews Section ============ */}
      <div className="mx-auto mt-14 max-w-4xl px-4">
        <h2 className="mb-6 font-display text-xl font-black text-plum-900">تقييمات العملاء</h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Review form */}
          <form
            onSubmit={handleSubmitReview}
            className="rounded-3xl border border-lavender-200/60 bg-white/70 p-6 shadow-sm"
          >
            <h3 className="mb-4 font-arabic text-base font-bold text-plum-800">أضف تقييمك</h3>

            <label className="mb-1 block font-arabic text-xs font-semibold text-plum-600">الاسم</label>
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
              className="mb-4 w-full rounded-xl border border-lavender-200 bg-white px-4 py-2.5 font-arabic text-sm text-plum-900 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-200"
              placeholder="اكتب اسمك"
            />

            <label className="mb-1 block font-arabic text-xs font-semibold text-plum-600">التقييم</label>
            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReviewRating(i + 1)}
                  className="p-0.5 transition hover:scale-110"
                  aria-label={`${i + 1} نجوم`}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill={i < reviewRating ? '#d4a017' : 'none'}
                    stroke={i < reviewRating ? '#d4a017' : '#d1d5db'}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 2.5l2.9 6.0 6.6.9-4.8 4.6 1.2 6.6L12 18.9 6.1 21.2l1.2-6.6L2.5 9.9l6.6-.9L12 2.5z" />
                  </svg>
                </button>
              ))}
            </div>

            <label className="mb-1 block font-arabic text-xs font-semibold text-plum-600">التعليق</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              rows={4}
              className="mb-4 w-full resize-none rounded-xl border border-lavender-200 bg-white px-4 py-2.5 font-arabic text-sm text-plum-900 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-200"
              placeholder="شاركنا رأيك في المنتج…"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-premium w-full disabled:opacity-60"
            >
              {submittingReview ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
            </button>
          </form>

          {/* Reviews list */}
          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-lavender-300 bg-white/50 px-6 py-12 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4b5d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2.5l2.9 6.0 6.6.9-4.8 4.6 1.2 6.6L12 18.9 6.1 21.2l1.2-6.6L2.5 9.9l6.6-.9L12 2.5z" />
                </svg>
                <p className="mt-3 font-arabic text-sm text-plum-500">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-lavender-200/60 bg-white/70 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-sm font-bold text-plum-800">{r.author_name}</span>
                    <StarRow value={r.rating} size={14} />
                  </div>
                  <p className="mt-2 font-arabic text-sm leading-relaxed text-plum-600">{r.comment_ar}</p>
                  <p className="mt-2 font-arabic text-xs text-plum-400">
                    {new Date(r.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============ Modals ============ */}
      {viewerOpen && (
        <ImageViewer
          product={{
            name_ar: product.name_ar,
            gallery_urls: product.gallery_urls,
            image_url: product.image_url,
          }}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {authGateOpen && <AuthGateModal open={authGateOpen} onClose={() => setAuthGateOpen(false)} onAuthenticated={() => setAuthGateOpen(false)} />}
    </div>
  );
}

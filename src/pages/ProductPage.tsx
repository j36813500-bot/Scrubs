import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../lib/router'
import {
  fetchProductBySlug,
  fetchProductColors,
  fetchProductSizes,
  fetchReviews,
  addReview,
  addToCart,
  toggleFavorite,
} from '../lib/api'
import type {
  Product,
  ProductColor,
  ProductSize,
  Review,
} from '../lib/types'
import ImageViewer from '../components/ImageViewer'
import AuthGateModal from '../components/AuthGateModal'

// ── Stars component ──────────────────────────────────────────────
function Stars({ rating, size = 20 }: { rating: number; size?: number }): JSX.Element {
  const full: number = Math.floor(rating)
  const half: boolean = rating - full >= 0.5
  const empty: number = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="halfStarProd">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStarProd)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width={size} height={size} viewBox="0 0 24 24" fill="#e5e7eb">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ── Collapsible section ───────────────────────────────────────────
interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={(): void => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-right"
      >
        <span className="text-base font-bold text-gray-800">{title}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-blush-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Review form ───────────────────────────────────────────────────
interface ReviewFormProps {
  productId: string
  onSubmitted: () => void
}

function ReviewForm({ productId, onSubmitted }: ReviewFormProps): JSX.Element {
  const [name, setName] = useState<string>('')
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>('')
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      setError('الرجاء إدخال الاسم والتعليق')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await addReview(productId, name.trim(), rating, comment.trim())
      setName('')
      setRating(5)
      setComment('')
      onSubmitted()
    } catch (err) {
      setError('حدث خطأ أثناء إرسال التقييم')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h4 className="text-lg font-bold text-gray-800">أضف تقييمك</h4>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم</label>
        <input
          type="text"
          value={name}
          onChange={(e): void => setName(e.target.value)}
          placeholder="اسمك الكريم"
          className="input-premium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">التقييم</label>
        <div className="flex items-center gap-1" dir="ltr" onMouseLeave={(): void => setHoverRating(0)}>
          {Array.from({ length: 5 }).map((_, i) => {
            const val: number = i + 1
            return (
              <button
                key={i}
                type="button"
                onClick={(): void => setRating(val)}
                onMouseEnter={(): void => setHoverRating(val)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={(hoverRating || rating) >= val ? '#f59e0b' : '#e5e7eb'}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">التعليق</label>
        <textarea
          value={comment}
          onChange={(e): void => setComment(e.target.value)}
          placeholder="شاركنا تجربتك..."
          rows={3}
          className="input-premium resize-none"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function ProductPage(): JSX.Element {
  const { path, navigate } = useRouter()

  // Extract slug from path like /product/:slug
  const slug: string = path.replace('/product/', '').trim()

  const [product, setProduct] = useState<Product | null>(null)
  const [colors, setColors] = useState<ProductColor[]>([])
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [activeImage, setActiveImage] = useState<number>(0)
  const [viewerOpen, setViewerOpen] = useState<boolean>(false)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false)
  const [authAction, setAuthAction] = useState<'cart' | 'favorite'>('cart')
  const [addingToCart, setAddingToCart] = useState<boolean>(false)
  const [cartMessage, setCartMessage] = useState<string | null>(null)

  // Build gallery images (max 3 thumbnails)
  const galleryImages: string[] = product
    ? product.gallery_urls.length > 0
      ? product.gallery_urls.slice(0, 3)
      : product.image_url
        ? [product.image_url]
        : []
    : []

  // Load product data
  useEffect((): void => {
    if (!slug) return
    (async (): Promise<void> => {
      setLoading(true)
      try {
        const p: Product | null = await fetchProductBySlug(slug)
        setProduct(p)
        if (p) {
          const [c, s, r] = await Promise.all([
            fetchProductColors(p.id),
            fetchProductSizes(p.id),
            fetchReviews(p.id),
          ])
          setColors(c)
          setSizes(s)
          setReviews(r)
        }
      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const refreshReviews = useCallback(async (): Promise<void> => {
    if (!product) return
    try {
      const r: Review[] = await fetchReviews(product.id)
      setReviews(r)
    } catch (err) {
      console.error('Failed to refresh reviews:', err)
    }
  }, [product])

  const handleAddToCart = async (): Promise<void> => {
    if (!product) return
    setAddingToCart(true)
    setCartMessage(null)
    try {
      await addToCart(
        product.id,
        quantity,
        selectedColor || undefined,
        selectedSize || undefined
      )
      setCartMessage('تمت الإضافة إلى السلة بنجاح!')
      setTimeout((): void => setCartMessage(null), 3000)
    } catch (err) {
      setCartMessage('حدث خطأ أثناء الإضافة للسلة')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleFavoriteToggle = async (): Promise<void> => {
    if (!product) return
    try {
      const result: boolean = await toggleFavorite(product.id)
      setIsFavorite(result)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24" dir="rtl">
        <div className="glass-card p-8 text-center">
          <svg className="animate-spin mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
          <p className="text-gray-600 font-bold">جارٍ تحميل المنتج...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24" dir="rtl">
        <div className="glass-card p-8 text-center">
          <p className="text-lg font-bold text-gray-700 mb-4">المنتج غير موجود</p>
          <button onClick={(): void => navigate('/store')} className="btn-premium">
            العودة للمتجر
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Breadcrumb ── */}
      <div className="px-4 pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={(): void => navigate('/')} className="hover:text-blush-600 transition-colors">
              الرئيسية
            </button>
            <span>/</span>
            <button onClick={(): void => navigate('/store')} className="hover:text-blush-600 transition-colors">
              المتجر
            </button>
            <span>/</span>
            <span className="text-gray-700 font-bold line-clamp-1">{product.name_ar}</span>
          </nav>
        </div>
      </div>

      {/* ── Product detail ── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div
              className="relative aspect-[3/4] glass-card overflow-hidden cursor-pointer group"
              onClick={(): void => setViewerOpen(true)}
            >
              {galleryImages[activeImage] ? (
                <img
                  src={galleryImages[activeImage]}
                  alt={product.name_ar}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {/* 3D badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full glass shadow-glow px-3 py-1.5 text-xs font-extrabold text-blush-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                عرض ثلاثي الأبعاد
              </div>
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-3">
                {galleryImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={(): void => setActiveImage(i)}
                    className={`relative aspect-square w-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                      activeImage === i
                        ? 'ring-2 ring-blush-500 shadow-glow'
                        : 'glass opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name_ar} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Name + favorite */}
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.collection_ar && (
                  <p className="mb-1 text-sm font-bold text-lavender-600">{product.collection_ar}</p>
                )}
                <h1 className="text-3xl font-extrabold text-gray-800">{product.name_ar}</h1>
              </div>
              <button
                onClick={handleFavoriteToggle}
                className="glass rounded-full p-3 transition-all hover:shadow-glow"
                aria-label="المفضلة"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? '#e85c8a' : 'none'}
                  stroke={isFavorite ? '#e85c8a' : '#916dba'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <Stars rating={product.rating || 0} />
              <span className="text-sm text-gray-500">
                ({product.rating_count || 0} تقييم)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold premium-gradient-text">
                {product.price} <span className="text-xl">ج.م</span>
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {product.compare_at_price} ج.م
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_ar && (
              <p className="text-gray-600 leading-relaxed">{product.description_ar}</p>
            )}

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اللون: {selectedColor || 'اختر'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: ProductColor) => (
                    <button
                      key={color.id}
                      onClick={(): void => setSelectedColor(color.name_ar)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        selectedColor === color.name_ar
                          ? 'btn-premium'
                          : 'glass text-gray-600 hover:text-blush-600'
                      }`}
                    >
                      {color.hex_code && (
                        <span
                          className="h-4 w-4 rounded-full border border-white/50"
                          style={{ backgroundColor: color.hex_code }}
                        />
                      )}
                      {color.name_ar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المقاس: {selectedSize || 'اختر'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: ProductSize) => (
                    <button
                      key={size.id}
                      onClick={(): void => setSelectedSize(size.size_label)}
                      className={`min-w-[3rem] rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                        selectedSize === size.size_label
                          ? 'btn-premium'
                          : 'glass text-gray-600 hover:text-blush-600'
                      }`}
                    >
                      {size.size_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الكمية</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={(): void => setQuantity(Math.max(1, quantity - 1))}
                  className="glass rounded-full h-10 w-10 flex items-center justify-center text-blush-600 font-bold text-lg"
                >
                  −
                </button>
                <span className="text-xl font-extrabold w-10 text-center">{quantity}</span>
                <button
                  onClick={(): void => setQuantity(quantity + 1)}
                  className="glass rounded-full h-10 w-10 flex items-center justify-center text-blush-600 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingToCart}
                className="btn-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!product.in_stock
                  ? 'نفذت الكمية'
                  : addingToCart
                    ? 'جارٍ الإضافة...'
                    : 'أضف إلى السلة'}
              </button>

              {cartMessage && (
                <div className="rounded-2xl bg-green-50/80 border border-green-200 px-4 py-3 text-sm font-bold text-green-700 animate-fade-in">
                  {cartMessage}
                </div>
              )}
            </div>

            {/* Collapsible sections */}
            <div className="space-y-3">
              {product.size_guide_ar && (
                <Collapsible title="دليل المقاسات">
                  <pre className="whitespace-pre-wrap font-sans">{product.size_guide_ar}</pre>
                </Collapsible>
              )}
              {product.specifications_ar && (
                <Collapsible title="المواصفات">
                  <pre className="whitespace-pre-wrap font-sans">{product.specifications_ar}</pre>
                </Collapsible>
              )}
              {product.wash_instructions_ar && (
                <Collapsible title="تعليمات الغسيل">
                  <pre className="whitespace-pre-wrap font-sans">{product.wash_instructions_ar}</pre>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-extrabold premium-gradient-text">التقييمات</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-500">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
                </div>
              ) : (
                reviews.map((review: Review) => (
                  <div key={review.id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{review.author_name}</span>
                      <Stars rating={review.rating} size={16} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment_ar}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Review form */}
            <ReviewForm productId={product.id} onSubmitted={refreshReviews} />
          </div>
        </div>
      </section>

      {/* ── Image viewer modal ── */}
      {viewerOpen && (
        <ImageViewer
          product={product}
          onClose={(): void => setViewerOpen(false)}
        />
      )}

      {/* ── Auth gate modal ── */}
      <AuthGateModal
        open={authModalOpen}
        onClose={(): void => setAuthModalOpen(false)}
        onAuthenticated={(): void => {
          setAuthModalOpen(false)
          if (authAction === 'cart') {
            handleAddToCart()
          } else {
            handleFavoriteToggle()
          }
        }}
      />
    </div>
  )
}

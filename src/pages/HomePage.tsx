import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from '../lib/router'
import {
  fetchBanners,
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
} from '../lib/api'
import type { Banner, Category, Product } from '../lib/types'
import ProductCard from '../components/ProductCard'

// ── Skeleton helpers ──────────────────────────────────────────────
function BannerSkeleton(): JSX.Element {
  return (
    <div className="shimmer-bg animate-pulse h-64 sm:h-80 lg:h-96 rounded-3xl" />
  )
}

function CategorySkeleton(): JSX.Element {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shimmer-bg animate-pulse h-20 w-32 rounded-2xl shrink-0" />
      ))}
    </div>
  )
}

function ProductSkeleton(): JSX.Element {
  return (
    <div className="glass-card overflow-hidden">
      <div className="shimmer-bg animate-pulse aspect-square rounded-t-3xl" />
      <div className="p-4 space-y-2">
        <div className="shimmer-bg animate-pulse h-4 w-3/4 rounded-full" />
        <div className="shimmer-bg animate-pulse h-3 w-1/2 rounded-full" />
        <div className="shimmer-bg animate-pulse h-6 w-1/3 rounded-full" />
      </div>
    </div>
  )
}

function ProductGridSkeleton({ count = 8 }: { count: number }): JSX.Element {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Floating logo ─────────────────────────────────────────────────
function FloatingLogo(): JSX.Element {
  return (
    <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center animate-float-medium">
      <div className="absolute inset-0 rounded-full glass shadow-glow" />
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-blush-300/50 animate-spin-slow" />
      <div className="absolute inset-4 rounded-full border border-lavender-300/40" />
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#heroGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#e85c8a" />
            <stop offset="50%" stopColor="#916dba" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

// ── Banner carousel ───────────────────────────────────────────────
function BannerCarousel({ banners }: { banners: Banner[] }): JSX.Element {
  const { navigate } = useRouter()
  const [current, setCurrent] = useState<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback((): void => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const goTo = useCallback((idx: number): void => {
    setCurrent(idx)
  }, [])

  useEffect((): (() => void) => {
    if (banners.length <= 1) return (): void => {}
    timerRef.current = setInterval(next, 5000)
    return (): void => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [next, banners.length])

  if (banners.length === 0) return <></>

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-premium">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(${current * 100}%)` }}
      >
        {banners.map((banner: Banner) => (
          <div key={banner.id} className="min-w-full">
            <div
              className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-3xl"
              onClick={(): void => {
                if (banner.cta_link) navigate(banner.cta_link)
              }}
            >
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title_ar}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blush-100 via-lavender-100 to-gold-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 right-0 p-6 sm:p-10 text-right">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
                  {banner.title_ar}
                </h2>
                {banner.subtitle_ar && (
                  <p className="text-sm sm:text-lg text-white/90 mb-4 drop-shadow">
                    {banner.subtitle_ar}
                  </p>
                )}
                {banner.cta_text_ar && (
                  <button className="btn-premium text-sm sm:text-base">
                    {banner.cta_text_ar}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_: Banner, i: number) => (
            <button
              key={i}
              onClick={(): void => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Category scroll ──────────────────────────────────────────────
function CategoryScroll({ categories }: { categories: Category[] }): JSX.Element {
  const { navigate } = useRouter()
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
      {categories.map((cat: Category) => (
        <button
          key={cat.id}
          onClick={(): void => navigate(`/store?cat=${cat.slug}`)}
          className="glass-card group flex min-w-[120px] flex-col items-center gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass text-2xl">
            {cat.icon || '🩺'}
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-blush-600 transition-colors">
            {cat.name_ar}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle: string; onSeeAll?: () => void }): JSX.Element {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold premium-gradient-text">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="btn-ghost text-sm whitespace-nowrap">
          عرض الكل
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function HomePage(): JSX.Element {
  const { navigate } = useRouter()

  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [bannersLoading, setBannersLoading] = useState<boolean>(true)
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true)
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(true)
  const [productsLoading, setProductsLoading] = useState<boolean>(true)

  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Banner[] = await fetchBanners()
        setBanners(data)
      } catch (err) {
        console.error('Failed to load banners:', err)
      } finally {
        setBannersLoading(false)
      }
    })()
  }, [])

  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Category[] = await fetchCategories()
        setCategories(data)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setCategoriesLoading(false)
      }
    })()
  }, [])

  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Product[] = await fetchFeaturedProducts()
        setFeatured(data)
      } catch (err) {
        console.error('Failed to load featured products:', err)
      } finally {
        setFeaturedLoading(false)
      }
    })()
  }, [])

  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Product[] = await fetchProducts()
        setProducts(data)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setProductsLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-12 lg:pt-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-lavender-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 flex justify-center">
            <FloatingLogo />
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold premium-gradient-text mb-3 animate-fade-in-up">
            اسكربك
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium animate-fade-in-up">
            يونيفورمات طبية فاخرة
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={(): void => navigate('/store')} className="btn-premium">
              تسوق الآن
            </button>
            <button onClick={(): void => navigate('/track')} className="btn-ghost">
              تتبع طلبك
            </button>
          </div>
        </div>
      </section>

      {/* ── Banner carousel ── */}
      <section className="px-4 mb-12">
        <div className="mx-auto max-w-7xl">
          {bannersLoading ? (
            <BannerSkeleton />
          ) : (
            <BannerCarousel banners={banners} />
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="px-4 mb-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="التشكيلات"
            subtitle="تصفح حسب الفئة"
            onSeeAll={(): void => navigate('/store')}
          />
          {categoriesLoading ? (
            <CategorySkeleton />
          ) : (
            <CategoryScroll categories={categories} />
          )}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="px-4 mb-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="منتجات مميزة"
            subtitle="مختارات خاصة لك"
            onSeeAll={(): void => navigate('/store')}
          />
          {featuredLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(): void => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── All products ── */}
      <section className="px-4 mb-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="كل المنتجات"
            subtitle="استكشف تشكيلتنا الكاملة"
            onSeeAll={(): void => navigate('/store')}
          />
          {productsLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(): void => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../lib/router'
import {
  fetchProducts,
  fetchProductsByCategory,
  fetchCategories,
} from '../lib/api'
import type { Product, Category } from '../lib/types'
import ProductCard from '../components/ProductCard'

// ── Skeleton ──────────────────────────────────────────────────────
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

function CategoryPillSkeleton(): JSX.Element {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer-bg animate-pulse h-10 w-24 rounded-full shrink-0" />
      ))}
    </div>
  )
}

// ── Category pills ────────────────────────────────────────────────
interface CategoryPillsProps {
  categories: Category[]
  activeCat: string | null
  onSelect: (slug: string | null) => void
}

function CategoryPills({ categories, activeCat, onSelect }: CategoryPillsProps): JSX.Element {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      <button
        onClick={(): void => onSelect(null)}
        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
          activeCat === null
            ? 'btn-premium'
            : 'glass text-gray-600 hover:text-blush-600'
        }`}
      >
        الكل
      </button>
      {categories.map((cat: Category) => (
        <button
          key={cat.id}
          onClick={(): void => onSelect(cat.slug)}
          className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
            activeCat === cat.slug
              ? 'btn-premium'
              : 'glass text-gray-600 hover:text-blush-600'
          }`}
        >
          {cat.name_ar}
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function StorePage(): JSX.Element {
  const { query, navigate } = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [catLoading, setCatLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [activeCat, setActiveCat] = useState<string | null>(query.cat || null)

  // Sync activeCat when URL query changes
  useEffect((): void => {
    setActiveCat(query.cat || null)
  }, [query.cat])

  // Load categories
  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Category[] = await fetchCategories()
        setCategories(data)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setCatLoading(false)
      }
    })()
  }, [])

  // Load products based on activeCat
  const loadProducts = useCallback(async (cat: string | null): Promise<void> => {
    setLoading(true)
    try {
      if (cat) {
        const data: Product[] = await fetchProductsByCategory(cat)
        setProducts(data)
      } else {
        const data: Product[] = await fetchProducts()
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to load products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect((): void => {
    loadProducts(activeCat)
  }, [activeCat, loadProducts])

  // Filter by search
  const filteredProducts: Product[] = search.trim()
    ? products.filter((p: Product) =>
        p.name_ar.toLowerCase().includes(search.toLowerCase().trim()) ||
        (p.description_ar || '').toLowerCase().includes(search.toLowerCase().trim())
      )
    : products

  // Filter by collection if present in query
  const collectionFilter: string | null = query.collection || null
  const finalProducts: Product[] = collectionFilter
    ? filteredProducts.filter((p: Product) => p.collection_ar === collectionFilter)
    : filteredProducts

  const handleSelectCat = (slug: string | null): void => {
    setActiveCat(slug)
    if (slug) {
      navigate(`/store?cat=${slug}`)
    } else {
      navigate('/store')
    }
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Header ── */}
      <section className="px-4 pt-24 pb-6 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-1 text-3xl sm:text-4xl font-extrabold premium-gradient-text">
            المتجر
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            {collectionFilter
              ? `تشكيلة: ${collectionFilter}`
              : 'استكشف تشكيلتنا الكاملة من اليونيفورمات الطبية'}
          </p>

          {/* Search bar */}
          <div className="relative mb-6">
            <svg
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e): void => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="input-premium pr-12"
            />
          </div>

          {/* Category pills */}
          {catLoading ? (
            <CategoryPillSkeleton />
          ) : (
            <CategoryPills
              categories={categories}
              activeCat={activeCat}
              onSelect={handleSelectCat}
            />
          )}
        </div>
      </section>

      {/* ── Products grid ── */}
      <section className="px-4">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : finalProducts.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full glass">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-700">لا توجد منتجات</h3>
              <p className="text-sm text-gray-500">لم نعثر على منتجات مطابقة. جرب تغيير الفلتر أو البحث.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">
                {finalProducts.length} منتج
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {finalProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={(): void => navigate(`/product/${product.slug}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

import type { Product } from '../lib/types'

interface ProductCardProps {
  product: Product
  onClick: () => void
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStar)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#e5e7eb">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const outOfStock = !product.in_stock
  const hasDiscount =
    product.compare_at_price != null &&
    product.compare_at_price > product.price

  return (
    <div
      onClick={onClick}
      className="glass-card group relative cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-glow hover:-translate-y-1.5"
    >
      {/* Featured badge */}
      {product.is_featured && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-400 to-blush-500 px-3 py-1 text-xs font-extrabold text-white shadow-premium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          مميز
        </div>
      )}

      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-20 rounded-full bg-blush-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-premium">
          -{Math.round((1 - product.price / (product.compare_at_price as number)) * 100)}%
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-gradient-to-br from-blush-50 to-lavender-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name_ar}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <span className="rounded-full glass px-5 py-2 text-sm font-extrabold text-blush-700 shadow-glow">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-base font-bold text-gray-800 group-hover:text-blush-600 transition-colors">
          {product.name_ar}
        </h3>
        {product.collection_ar && (
          <p className="mb-2 text-xs text-lavender-600 font-medium">{product.collection_ar}</p>
        )}

        <div className="mb-2 flex items-center gap-1.5">
          <Stars rating={product.rating || 0} />
          <span className="text-xs text-gray-500">({product.rating_count || 0})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold premium-gradient-text">
            {product.price} <span className="text-sm">ج.م</span>
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {product.compare_at_price} ج.م
            </span>
          )}
        </div>
      </div>

      {/* Hover glow line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blush-500 via-lavender-500 to-gold-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { fetchFavorites, removeFromCart } from '../lib/api'
import type { Favorite } from '../lib/types'
import ProductCard from '../components/ProductCard'
import { useRouter } from '../lib/router'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchFavorites().then(f => { setFavorites(f); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl shimmer-bg animate-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass-card p-12 rounded-3xl">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="text-2xl font-bold mb-2">قائمة المفضلة فارغة</h2>
          <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
          <button onClick={() => router.navigate('/store')} className="btn-premium">
            تصفح المتجر
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 premium-gradient-text">المفضلة</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map(fav => (
          <ProductCard key={fav.id} product={fav.product!} onClick={() => router.navigate(`/product/${fav.product!.slug}`)} />
        ))}
      </div>
    </div>
  )
}

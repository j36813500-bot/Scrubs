import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchFavorites, toggleFavorite } from '../lib/api';
import type { Favorite } from '../lib/types';
import ProductCard from '../components/ProductCard';

export default function FavoritesPage() {
  const { navigate } = useRouter();
  const [favs, setFavs] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setFavs(await fetchFavorites()); } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRemove = async (productId: string) => {
    setFavs(prev => prev.filter(f => f.product_id !== productId));
    try { await toggleFavorite(productId); } catch { load(); }
  };

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-center mb-8 animate-fade-in-up">
          <span className="premium-gradient-text">المفضلة</span>
        </h1>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-3xl" />)}</div>
        ) : favs.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">💝</div>
            <h3 className="font-display font-bold text-xl text-beige-800 mb-2">لا توجد منتجات مفضلة</h3>
            <p className="text-beige-600 mb-4">اضغط على القلب في أي منتج لإضافته هنا</p>
            <button onClick={() => navigate('/store')} className="btn-premium">تصفح المتجر</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {favs.map((f, i) => f.product && (
              <div key={f.id} className="relative">
                <ProductCard product={f.product} index={i} />
                <button
                  onClick={() => handleRemove(f.product_id)}
                  className="absolute top-2 left-2 z-10 glass rounded-full px-3 py-1 text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  إزالة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

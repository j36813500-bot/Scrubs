import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories } from '../lib/api';
import type { Product, Category } from '../lib/types';

export default function StorePage() {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(p);
        setCategories(c);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const filtered = products.filter(p => {
    if (activeCat !== 'all' && p.category_id !== activeCat) return false;
    if (search && !p.name_ar.includes(search)) return false;
    return true;
  });

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-lavender-200/20 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <h1 className="font-display font-black text-3xl mb-6 animate-fade-in-up">
          <span className="premium-gradient-text">المتجر</span>
        </h1>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="input-premium text-sm mb-4"
        />

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCat('all')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCat === 'all' ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'glass text-beige-600'}`}>الكل</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCat === c.id ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'glass text-beige-600'}`}>{c.name_ar}</button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-80 skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-beige-600">لا توجد منتجات</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, i) => (
              <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)} className="glass-card rounded-3xl overflow-hidden text-right hover:scale-[1.02] transition-transform animate-fade-in-up group" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={p.image_url} alt={p.name_ar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-beige-900 text-sm line-clamp-1 mb-1">{p.name_ar}</h3>
                  <span className="font-display font-bold text-blush-600">{p.price} ج.م</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

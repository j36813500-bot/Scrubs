import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchFeaturedProducts, fetchProducts } from '../lib/api';
import type { Product } from '../lib/types';

export default function HomePage() {
  const { navigate } = useRouter();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, a] = await Promise.all([fetchFeaturedProducts(), fetchProducts()]);
        setFeatured(f);
        setAll(a);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-lavender-200/20 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Hero */}
        <div className="text-center py-12 md:py-20 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow mb-6 animate-float-medium">
            <span className="text-white font-display font-black text-3xl">س</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
            <span className="premium-gradient-text">اسكربك</span>
          </h1>
          <p className="text-beige-600 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            يونيفورمات طبية فاخرة — جودة استثنائية وتصميم أنيق لكل من يعمل في المجال الطبي
          </p>
          <button onClick={() => navigate('/store')} className="btn-premium text-base px-8 py-4">
            تصفح المتجر
          </button>
        </div>

        {/* Featured products */}
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display font-bold text-2xl text-beige-900 mb-6 text-center">منتجات مميزة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onClick={() => navigate(`/product/${p.slug}`)} />
              ))}
            </div>
          </div>
        )}

        {/* All products */}
        <div>
          <h2 className="font-display font-bold text-2xl text-beige-900 mb-6 text-center">كل المنتجات</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-80 skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {all.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onClick={() => navigate(`/product/${p.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, index, onClick }: { product: Product; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-3xl overflow-hidden text-right hover:scale-[1.02] transition-transform animate-fade-in-up group"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        {product.compare_at_price && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-blush-500 text-white text-xs font-bold">خصم</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-beige-900 text-sm line-clamp-1 mb-1">{product.name_ar}</h3>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-blush-600">{product.price} ج.م</span>
          {product.compare_at_price && <span className="text-beige-400 line-through text-xs">{product.compare_at_price}</span>}
        </div>
      </div>
    </button>
  );
}

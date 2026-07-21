import { useRef, useState } from 'react';
import type { Product } from '../lib/types';
import { useRouter } from '../lib/router';
import { toggleFavorite } from '../lib/api';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { navigate } = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hover, setHover] = useState(false);
  const [fav, setFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ rx: (py - 0.5) * -12, ry: (px - 0.5) * 12 });
  };

  const onLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setHover(false);
    setShowQuick(false);
  };

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      const isFav = await toggleFavorite(product.id);
      setFav(isFav);
    } catch { /* ignore */ }
    setFavLoading(false);
  };

  const open = () => navigate(`/product/${product.slug}`);

  return (
    <div
      className="perspective-1000 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        onClick={open}
        className="card-3d glass-card rounded-3xl overflow-hidden cursor-pointer group gpu"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
          boxShadow: hover
            ? '0 30px 60px -15px rgba(192,166,226,0.5), 0 0 0 1px rgba(255,255,255,0.8) inset'
            : '0 8px 32px 0 rgba(247,168,198,0.2)',
        }}
      >
        {/* Image area */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blush-100/40 to-lavender-100/40"
          />
          <img
            src={product.image_url}
            alt={product.name_ar}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ transform: hover ? 'scale(1.08)' : 'scale(1)' }}
          />
          {/* reflection sheen */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
            }}
          />
          {/* fav button */}
          <button
            onClick={handleFav}
            className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            aria-label="إضافة للمفضلة"
          >
            <svg
              className={`w-5 h-5 transition-colors ${fav ? 'text-blush-500 fill-blush-400' : 'text-blush-400'}`}
              viewBox="0 0 24 24"
              fill={fav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {/* discount badge */}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-blush-500 to-lavender-500 text-white text-xs font-bold shadow-glow">
              -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
            </div>
          )}
          {/* quick preview overlay */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-500 ${
              showQuick ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="w-full glass rounded-full py-2.5 text-sm font-bold text-blush-700 hover:bg-white/80 transition-colors"
            >
              معاينة سريعة
            </button>
          </div>
          {/* hover hint */}
          {!showQuick && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuick(true); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-beige-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              مرّر للمعاينة
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-beige-900 line-clamp-1">{product.name_ar}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-4 h-4 text-gold-400 fill-gold-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-bold text-beige-700">{product.rating || '—'}</span>
            </div>
          </div>

          {/* colors */}
          <div className="flex items-center gap-1.5 mb-2">
            {(product.colors || []).slice(0, 5).map(c => (
              <span
                key={c.id}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: c.hex_code }}
                title={c.name_ar}
              />
            ))}
            {(product.colors || []).length > 5 && (
              <span className="text-xs text-beige-600">+{(product.colors || []).length - 5}</span>
            )}
          </div>

          {/* sizes */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(product.sizes || []).slice(0, 5).map(s => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-beige-700 font-semibold">
                {s.size_label}
              </span>
            ))}
          </div>

          {/* price + add */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-lg text-blush-700">{product.price} ج.م</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-beige-500 line-through">{product.compare_at_price}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-white flex items-center justify-center shadow-glow hover:scale-110 active:scale-90 transition-transform"
              aria-label="أضف للسلة"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

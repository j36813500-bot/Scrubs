import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProductBySlug, fetchReviews, addReview, addToCart, toggleFavorite, fetchFavorites } from '../lib/api';
import { getUser } from '../lib/auth';
import type { Product, Review } from '../lib/types';
import Cinematic3DViewer from '../components/Cinematic3DViewer';
import AuthGateModal from '../components/AuthGateModal';

export default function ProductPage() {
  const { path, navigate } = useRouter();
  const slug = path.replace('/product/', '');
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await fetchProductBySlug(slug);
        setProduct(p);
        if (p) {
          setReviews(await fetchReviews(p.id));
          const favs = await fetchFavorites();
          setIsFav(favs.some(f => f.product_id === p.id));
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!getUser()) {
      setShowAuth(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { /* ignore */ }
    setAdding(false);
  };

  const handleFav = async () => {
    if (!product) return;
    try { setIsFav(await toggleFavorite(product.id)); } catch { /* ignore */ }
  };

  const handleReview = async () => {
    if (!product || !reviewForm.name || !reviewForm.comment) return;
    try {
      await addReview(product.id, reviewForm.name, reviewForm.rating, reviewForm.comment);
      setReviews(await fetchReviews(product.id));
      setReviewForm({ name: '', rating: 5, comment: '' });
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="pt-28 px-4 pb-12">
        <div className="mx-auto max-w-5xl glass-card rounded-3xl h-96 skeleton" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 px-4 pb-12 text-center">
        <p className="text-beige-600 mb-4">المنتج غير موجود</p>
        <button onClick={() => navigate('/store')} className="btn-premium">تصفح المتجر</button>
      </div>
    );
  }

  const images = (product.gallery_urls?.length ? product.gallery_urls : [product.image_url]).slice(0, 3);

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-lavender-200/20 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-beige-500">
          <button onClick={() => navigate('/')} className="hover:text-blush-600">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/store')} className="hover:text-blush-600">المتجر</button>
          <span>/</span>
          <span className="text-beige-700">{product.name_ar}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            {/* Main image — clickable to open 3D viewer */}
            <button
              onClick={() => setShow3D(true)}
              className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden glass-card group"
            >
              <img
                src={images[selectedImg]}
                alt={product.name_ar}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* 3D badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 animate-float-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/><path d="M9 12l2 2 4-4"/></svg>
                العرض ثلاثي الأبعاد
              </div>
              {/* Click hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                اضغط لتجربة العرض ثلاثي الأبعاد
              </div>
            </button>

            {/* Thumbnail gallery */}
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden transition-all ${selectedImg === i ? 'ring-2 ring-blush-400 scale-105' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display font-black text-2xl text-beige-900 mb-2">{product.name_ar}</h1>
                {product.collection_ar && <p className="text-beige-600 text-sm mb-2">{product.collection_ar}</p>}
              </div>
              <button onClick={handleFav} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform">
                <svg className={`w-5 h-5 ${isFav ? 'text-blush-500 fill-blush-400' : 'text-beige-400'}`} viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span className="text-sm text-beige-600">({product.rating_count} تقييم)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display font-black text-3xl premium-gradient-text">{product.price} ج.م</span>
              {product.compare_at_price && (
                <span className="text-beige-400 line-through text-lg">{product.compare_at_price} ج.م</span>
              )}
            </div>

            {/* Description */}
            {product.description_ar && (
              <p className="text-beige-700 text-sm leading-relaxed mb-6">{product.description_ar}</p>
            )}

            {/* Stock */}
            <div className="mb-4">
              {product.in_stock ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">متوفر</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">غير متوفر</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-beige-700">الكمية</span>
              <div className="flex items-center gap-2 glass rounded-full p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-bold text-beige-700">−</button>
                <span className="w-8 text-center font-bold text-beige-900">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-bold text-beige-700">+</button>
              </div>
            </div>

            {/* Add to cart */}
            <button onClick={handleAddToCart} disabled={adding || !product.in_stock} className="btn-premium w-full mb-3">
              {added ? '✓ تمت الإضافة للسلة' : adding ? 'جارٍ...' : 'أضف إلى السلة'}
            </button>
            <button onClick={() => { if (!getUser()) { setShowAuth(true); return; } handleAddToCart(); navigate('/cart'); }} className="btn-ghost w-full">
              اشترِ الآن
            </button>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-12">
          <h2 className="font-display font-bold text-xl text-beige-900 mb-4">التقييمات ({reviews.length})</h2>

          {/* Add review form */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h3 className="font-bold text-beige-900 mb-3">أضف تقييمك</h3>
            <div className="space-y-3">
              <input value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} placeholder="اسمك" className="input-premium text-sm" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}>
                    <svg className={`w-6 h-6 ${i < reviewForm.rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="اكتب تعليقك..." className="input-premium !rounded-2xl text-sm min-h-[80px]" />
              {reviewSubmitted && <p className="text-green-600 text-sm font-bold">تم إرسال تقييمك بنجاح!</p>}
              <button onClick={handleReview} className="btn-premium">إرسال التقييم</button>
            </div>
          </div>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center text-beige-600">لا توجد تقييمات بعد</div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="glass-card rounded-3xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-beige-900">{r.author_name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < r.rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-beige-700">{r.comment_ar}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3D Viewer */}
      {show3D && product && <Cinematic3DViewer product={product} onClose={() => setShow3D(false)} />}

      {/* Auth gate */}
      <AuthGateModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={() => { setShowAuth(false); handleAddToCart(); }}
        title="سجّل الدخول لإضافة المنتج للسلة"
        subtitle="يمكنك التصفح بحرية، فقط سجّل الدخول عند الشراء"
      />
    </div>
  );
}

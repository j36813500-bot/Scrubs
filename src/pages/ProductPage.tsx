import { useEffect, useRef, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, addReview, addToCart } from '../lib/api';
import type { Product, Review } from '../lib/types';
import ProductCard from '../components/ProductCard';
import Cinematic3DViewer from '../components/Cinematic3DViewer';

export default function ProductPage() {
  const { path, navigate } = useRouter();
  const slug = path.replace('/product/', '');
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'specs' | 'wash' | 'size' | 'reviews'>('desc');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // 3D mannequin rotation
  const stageRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setProduct(null);
    (async () => {
      try {
        const p = await fetchProductBySlug(slug);
        setProduct(p);
        if (p) {
          setSelectedColor(p.colors?.[0]?.name_ar || '');
          setSelectedSize(p.sizes?.[0]?.size_label || '');
          if (p.category_id) setRelated(await fetchRelatedProducts(p.category_id, p.id));
          setReviews(await fetchReviews(p.id));
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [slug]);

  // auto rotate
  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    const tick = () => { setRotation(r => r + 0.3); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    setAutoRotate(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotation(r => r + dx * 0.5);
  };
  const onUp = () => { dragging.current = false; };

  const handleAdd = async (buyNow = false) => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart({
        product_id: product.id,
        color_name_ar: selectedColor,
        size_label: selectedSize,
        quantity: qty,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (buyNow) navigate('/cart');
    } catch { /* ignore */ }
    setAdding(false);
  };

  const submitReview = async (author: string, rating: number, comment: string) => {
    if (!product) return;
    try {
      await addReview({ product_id: product.id, author_name: author, rating, comment_ar: comment });
      setReviews(await fetchReviews(product.id));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="pt-28 px-4">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-8">
          <div className="aspect-[3/4] skeleton rounded-3xl" />
          <div className="space-y-4"><div className="h-10 skeleton rounded-2xl" /><div className="h-6 w-1/2 skeleton rounded-full" /><div className="h-40 skeleton rounded-3xl" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 px-4 text-center">
        <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
          <h2 className="font-display font-bold text-2xl text-beige-800 mb-4">المنتج غير موجود</h2>
          <button onClick={() => navigate('/store')} className="btn-premium">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-7xl">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-beige-600 mb-6 animate-fade-in">
          <button onClick={() => navigate('/')} className="hover:text-blush-600">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/store')} className="hover:text-blush-600">المتجر</button>
          <span>/</span>
          <span className="text-blush-700 font-semibold">{product.name_ar}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ===== 3D VIRTUAL FITTING ===== */}
          <div className="animate-fade-in-up">
            <div
              ref={stageRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden mannequin-stage cursor-grab active:cursor-grabbing select-none gpu"
              style={{ touchAction: 'none' }}
            >
              {/* rotating rings */}
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-blush-200/40 animate-spin-slower pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-lavender-200/30 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />
              {/* platform shadow */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full bg-beige-900/10 blur-xl" />

              {/* mannequin + scrub — rotating */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative w-56 h-80 sm:w-64 sm:h-96 preserve-3d gpu"
                  style={{ transform: `rotateY(${rotation}deg)`, transition: dragging.current ? 'none' : 'transform 0.1s linear' }}
                >
                  {/* back layer (back of scrub) */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden shadow-premium" style={{ transform: 'rotateY(180deg)' }}>
                    <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-beige-900/20 to-transparent" />
                  </div>
                  {/* front layer */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden shadow-premium">
                    <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover" />
                    {/* fabric lighting overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blush-100/10 to-lavender-100/10" />
                  </div>
                </div>
              </div>

              {/* controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setAutoRotate(a => !a)}
                  className="glass rounded-full p-2.5 text-blush-700 hover:scale-110 transition-transform"
                  aria-label="تدوير تلقائي"
                >
                  {autoRotate ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  onClick={() => { setAutoRotate(false); setRotation(0); }}
                  className="glass rounded-full p-2.5 text-lavender-700 hover:scale-110 transition-transform"
                  aria-label="إعادة"
                >
                  <ResetIcon />
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs font-semibold text-beige-700 pointer-events-none">
                اسحب للتدوير • 360°
              </div>
              {/* open full-screen 3D */}
              <button
                onClick={() => setShow3D(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-xs font-bold text-blush-700 hover:scale-105 hover:shadow-glow transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10M12 2v4M12 2l3 3M2 12h4M2 12l3-3M12 22a10 10 0 0 0 10-10M12 22v-4M12 22l-3-3"/></svg>
                عرض ثلاثي الأبعاد
              </button>
            </div>

            {/* gallery thumbnails */}
            <div className="flex gap-2 mt-4">
              {product.gallery_urls.map((url, i) => (
                <div key={i} className="w-16 h-20 rounded-xl overflow-hidden glass">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* ===== INFO ===== */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-2">
              {product.collection_ar && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-800 text-xs font-bold">
                  {product.collection_ar}
                </span>
              )}
              {product.in_stock ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">متوفر</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">غير متوفر</span>
              )}
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-beige-900 mb-3">{product.name_ar}</h1>

            {/* rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <span className="text-sm text-beige-600">{product.rating} ({product.rating_count} تقييم)</span>
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-bold text-4xl premium-gradient-text">{product.price} ج.م</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-beige-400 line-through">{product.compare_at_price} ج.م</span>
              )}
            </div>

            {/* colors */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-beige-800 mb-2">اللون: <span className="text-blush-600">{selectedColor}</span></label>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.name_ar)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === c.name_ar ? 'border-blush-500 scale-110 shadow-glow' : 'border-white'}`}
                    style={{ backgroundColor: c.hex_code }}
                    title={c.name_ar}
                  />
                ))}
              </div>
            </div>

            {/* sizes */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-beige-800 mb-2">المقاس: <span className="text-blush-600">{selectedSize}</span></label>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size_label)}
                    className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${selectedSize === s.size_label ? 'bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-glow scale-105' : 'glass text-beige-700 hover:scale-105'}`}
                  >
                    {s.size_label}
                  </button>
                ))}
              </div>
            </div>

            {/* qty */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-beige-800 mb-2">الكمية</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full glass font-bold text-lg">-</button>
                <span className="font-display font-bold text-xl w-10 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full glass font-bold text-lg">+</button>
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={() => handleAdd(false)} disabled={adding} className="btn-premium flex-1">
                {added ? '✓ تمت الإضافة' : adding ? 'جارٍ...' : 'أضف للسلة'}
              </button>
              <button onClick={() => handleAdd(true)} className="btn-premium btn-gold flex-1">
                اشترِ الآن
              </button>
            </div>

            {/* tabs */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="flex border-b border-white/40 overflow-x-auto no-scrollbar">
                {([
                  ['desc', 'الوصف'],
                  ['specs', 'المواصفات'],
                  ['wash', 'الغسيل'],
                  ['size', 'دليل المقاسات'],
                  ['reviews', `التقييمات (${reviews.length})`],
                ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${tab === k ? 'text-blush-700 border-b-2 border-blush-400' : 'text-beige-600'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="p-5 text-beige-700 text-sm leading-relaxed">
                {tab === 'desc' && <p>{product.description_ar}</p>}
                {tab === 'specs' && <p>{product.specifications_ar || 'لا توجد مواصفات إضافية.'}</p>}
                {tab === 'wash' && <p>{product.wash_instructions_ar || 'غسيل عادي.'}</p>}
                {tab === 'size' && <p className="whitespace-pre-line">{product.size_guide_ar}</p>}
                {tab === 'reviews' && <ReviewsTab reviews={reviews} onSubmit={submitReview} />}
              </div>
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display font-bold text-2xl text-beige-900 mb-6 text-center">منتجات ذات صلة</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
      {show3D && product && <Cinematic3DViewer product={product} onClose={() => setShow3D(false)} />}
    </div>
  );
}

function ReviewsTab({ reviews, onSubmit }: { reviews: Review[]; onSubmit: (a: string, r: number, c: string) => void }) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div>
      <div className="space-y-3 mb-6">
        {reviews.map(r => (
          <div key={r.id} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-beige-900">{r.author_name}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
            </div>
            <p className="text-sm text-beige-700">{r.comment_ar}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-beige-500 text-center py-4">لا توجد تقييمات بعد. كن أول من يقيّم!</p>}
      </div>

      <div className="glass rounded-2xl p-4">
        <h4 className="font-bold text-beige-900 mb-3">أضف تقييمك</h4>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="اسمك" className="input-premium mb-2 text-sm" />
        <div className="flex gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} onClick={() => setRating(i + 1)}>
              <svg className={`w-6 h-6 ${i < rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="رأيك في المنتج..." className="input-premium !rounded-2xl mb-2 text-sm min-h-[80px]" />
        <button
          onClick={() => { if (author && comment) { onSubmit(author, rating, comment); setAuthor(''); setComment(''); setRating(5); } }}
          className="btn-premium text-sm w-full"
        >
          إرسال التقييم
        </button>
      </div>
    </div>
  );
}

function PauseIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>; }
function PlayIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>; }
function ResetIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>; }

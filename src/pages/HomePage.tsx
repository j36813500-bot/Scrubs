import { useEffect, useRef, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories, fetchBanners } from '../lib/api';
import type { Product, Category, Banner } from '../lib/types';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [p, c, b] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBanners(),
        ]);
        setProducts(p);
        setCategories(c);
        setBanners(b);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const featured = products.filter(p => p.is_featured).slice(0, 8);

  return (
    <div className="pt-24">
      {/* ===== CINEMATIC HERO ===== */}
      <section ref={heroRef} className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-4">
        {/* floating medical icons */}
        <FloatingIcon className="top-[15%] left-[8%] text-blush-300" delay="0s" icon="stetho" parallax={parallax} depth={1.5} />
        <FloatingIcon className="top-[25%] right-[10%] text-lavender-300" delay="1s" icon="mask" parallax={parallax} depth={-1.2} />
        <FloatingIcon className="bottom-[20%] left-[12%] text-gold-300" delay="2s" icon="pulse" parallax={parallax} depth={1} />
        <FloatingIcon className="bottom-[30%] right-[8%] text-blush-400" delay="0.5s" icon="cross" parallax={parallax} depth={-1.5} />
        <FloatingIcon className="top-[50%] left-[5%] text-lavender-400" delay="1.5s" icon="glove" parallax={parallax} depth={0.8} />

        <div className="relative z-10 max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Text side */}
          <div className="text-center lg:text-right animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <span className="w-2 h-2 rounded-full bg-blush-400 animate-pulse-soft" />
              <span className="text-sm font-semibold text-beige-700">مجموعة 2026 الفاخرة</span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight mb-6 text-balance">
              <span className="premium-gradient-text">يونيفورمات طبية</span>
              <br />
              <span className="text-beige-900">ترتديها بثقة</span>
            </h1>
            <p className="text-lg text-beige-700 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ادخل إلى صالة عرض افتراضية فاخرة، واستكشف تشكيلتنا الفاخرة من اليونيفورمات الطبية المصممة بعناية للأطباء والممرضين والصيادلة وكل الكوادر الصحية.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/store')} className="btn-premium">
                اكتشف المتجر
              </button>
              <button onClick={() => navigate('/about')} className="btn-ghost">
                قصتنا
              </button>
            </div>
            {/* stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto lg:mx-0">
              {[
                { n: '+5000', l: 'عميل سعيد' },
                { n: '+120', l: 'تصميم فاخر' },
                { n: '4.9', l: 'تقييم العملاء' },
              ].map(s => (
                <div key={s.l} className="glass rounded-2xl p-3 text-center">
                  <div className="font-display font-bold text-2xl premium-gradient-text">{s.n}</div>
                  <div className="text-xs text-beige-600 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D model stage */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] animate-scale-in">
            <div className="absolute inset-0 mannequin-stage rounded-full" />
            {/* rotating ring */}
            <div className="absolute inset-8 rounded-full border-2 border-dashed border-blush-200/50 animate-spin-slower" />
            <div className="absolute inset-16 rounded-full border border-lavender-200/40 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            {/* central "model" — premium product image with rotation + lighting */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
              }}
            >
              <div className="relative w-56 h-72 sm:w-72 sm:h-96 animate-breathe">
                {/* glow behind */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blush-200/60 to-lavender-200/60 blur-2xl scale-110" />
                {/* image */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-premium animate-float-medium gpu">
                  <img
                    src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg"
                    alt="يونيفورم طبي فاخر"
                    className="w-full h-full object-cover"
                  />
                  {/* studio light overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30" />
                </div>
                {/* floating glass panels */}
                <div className="absolute -top-4 -right-6 glass rounded-2xl px-3 py-2 text-xs font-bold text-blush-700 animate-float-fast">
                  قطن فاخر
                </div>
                <div className="absolute -bottom-4 -left-6 glass rounded-2xl px-3 py-2 text-xs font-bold text-lavender-700 animate-float-medium" style={{ animationDelay: '1s' }}>
                  مقاوم للبكتيريا
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-beige-600 font-semibold">مرّر للأسفل</span>
          <svg className="w-5 h-5 text-blush-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="تسوّق حسب التخصص" subtitle="تشكيلات مصممة لكل مهنة طبية" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate(`/store?category=${c.slug}`)}
                className="glass-card rounded-3xl p-6 text-center group hover:scale-105 hover:shadow-glow transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blush-200 to-lavender-200 flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform">
                  <CategoryIcon name={c.icon} />
                </div>
                <div className="font-display font-bold text-beige-900 text-sm">{c.name_ar}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNERS ===== */}
      {banners.length > 0 && (
        <section className="px-4 py-8">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-6">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => navigate(b.cta_link || '/store')}
                className="relative h-48 rounded-3xl overflow-hidden group animate-fade-in-up text-right"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <img src={b.image_url || ''} alt={b.title_ar} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-l from-blush-900/60 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-center p-6 text-white">
                  <h3 className="font-display font-bold text-2xl mb-1">{b.title_ar}</h3>
                  <p className="text-sm opacity-90 mb-3">{b.subtitle_ar}</p>
                  <span className="inline-block px-4 py-2 rounded-full bg-white/30 backdrop-blur text-sm font-bold w-fit">
                    {b.cta_text_ar}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <SectionTitle title="تشكيلتنا المميزة" subtitle="قطع مختارة بعناية" />
            <button onClick={() => navigate('/store')} className="btn-ghost text-sm">
              عرض الكل
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card rounded-3xl overflow-hidden">
                  <div className="aspect-[3/4] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton rounded-full" />
                    <div className="h-4 w-2/3 skeleton rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'truck', t: 'شحن سريع', d: 'توصيل خلال 2-5 أيام' },
            { icon: 'shield', t: 'جودة مضمونة', d: 'أقمشة فاخرة معتمدة' },
            { icon: 'refresh', t: 'استبدال سهل', d: 'خلال 14 يوماً' },
            { icon: 'headset', t: 'دعم ذكي', d: 'مساعد ذكي + خدمة عملاء' },
          ].map((f, i) => (
            <div key={f.t} className="glass-card rounded-3xl p-6 text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blush-200 to-lavender-200 flex items-center justify-center mb-3">
                <FeatureIcon name={f.icon} />
              </div>
              <div className="font-display font-bold text-beige-900 mb-1">{f.t}</div>
              <div className="text-sm text-beige-600">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blush-200/40 blur-3xl animate-breathe" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-lavender-200/40 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />
          <div className="relative z-10">
            <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
              <span className="premium-gradient-text">جاهز لإطلالة استثنائية؟</span>
            </h2>
            <p className="text-beige-700 mb-8 max-w-xl mx-auto">انضم لآلاف الكوادر الصحية الذين اختاروا اسكربك ليونيفورماتهم الفاخرة</p>
            <button onClick={() => navigate('/store')} className="btn-premium text-lg">
              ابدأ التسوق الآن
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-beige-900 mb-2">{title}</h2>
      <p className="text-beige-600">{subtitle}</p>
    </div>
  );
}

function FloatingIcon({ className, delay, icon, parallax, depth }: { className: string; delay: string; icon: string; parallax: { x: number; y: number }; depth: number }) {
  return (
    <div
      className={`absolute ${className} animate-float-medium`}
      style={{ animationDelay: delay, transform: `translate(${parallax.x * depth}px, ${parallax.y * depth}px)` }}
    >
      <div className="glass rounded-3xl p-4 shadow-glass">
        <IconShape name={icon} />
      </div>
    </div>
  );
}

function IconShape({ name }: { name: string }) {
  const cls = "w-8 h-8";
  switch (name) {
    case 'stetho': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 3v6a6 6 0 0 0 12 0V3M8 3v6a2 2 0 0 0 4 0V3M10 15v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="14" r="2"/></svg>;
    case 'mask': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8l9-3 9 3v5a9 9 0 0 1-18 0V8z"/><path d="M7 12h10M7 16h10"/></svg>;
    case 'pulse': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>;
    case 'cross': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z"/></svg>;
    case 'glove': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3v8M12 2v9M16 3v8M6 11h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-6z"/></svg>;
    default: return null;
  }
}

function CategoryIcon({ name }: { name: string | null }) {
  return <IconShape name={name || 'cross'} />;
}

function FeatureIcon({ name }: { name: string }) {
  const cls = "w-6 h-6 text-blush-700";
  switch (name) {
    case 'truck': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'shield': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'refresh': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>;
    case 'headset': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg>;
    default: return null;
  }
}

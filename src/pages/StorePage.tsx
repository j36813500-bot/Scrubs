import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories, fetchFabrics } from '../lib/api';
import type { Product, Category, Fabric } from '../lib/types';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const { query, navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [gender, setGender] = useState<string>('all');
  const [categorySlug, setCategorySlug] = useState<string>(query.get('category') || '');
  const [collection, setCollection] = useState<string>(query.get('collection') || '');
  const [fabricId, setFabricId] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, f] = await Promise.all([fetchProducts(), fetchCategories(), fetchFabrics()]);
        setProducts(p);
        setCategories(c);
        setFabrics(f);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // live suggestions
  const suggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return products
      .filter(p => p.name_ar.includes(search) || (p.description_ar || '').includes(search))
      .slice(0, 5);
  }, [search, products]);

  const collections = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.collection_ar) set.add(p.collection_ar); });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (debouncedSearch) {
        const ok = p.name_ar.includes(debouncedSearch) || (p.description_ar || '').includes(debouncedSearch);
        if (!ok) return false;
      }
      if (gender !== 'all' && p.gender !== gender && p.gender !== 'unisex') return false;
      if (categorySlug) {
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat && p.category_id !== cat.id) return false;
      }
      if (collection && p.collection_ar !== collection) return false;
      if (fabricId && p.fabric_id !== fabricId) return false;
      if (minPrice !== '' && p.price < minPrice) return false;
      if (maxPrice !== '' && p.price > maxPrice) return false;
      if (inStockOnly && !p.in_stock) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, debouncedSearch, gender, categorySlug, collection, fabricId, minPrice, maxPrice, inStockOnly, sort, categories]);

  const reset = () => {
    setSearch(''); setGender('all'); setCategorySlug(''); setCollection('');
    setFabricId(''); setMinPrice(''); setMaxPrice(''); setInStockOnly(false); setSort('featured');
    navigate('/store');
  };

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="font-display font-black text-4xl sm:text-5xl mb-2">
            <span className="premium-gradient-text">المتجر</span>
          </h1>
          <p className="text-beige-600">استكشف تشكيلتنا الفاخرة من اليونيفورمات الطبية</p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className="relative">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-beige-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن يونيفورم، لون، تخصص..."
              className="input-premium pr-12 text-right"
            />
          </div>
          {/* live suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full inset-x-0 mt-2 glass-card rounded-2xl p-2 z-30 animate-fade-in">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  onClick={() => { navigate(`/product/${p.slug}`); setSearch(''); }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 transition-colors text-right"
                >
                  <img src={p.image_url} alt={p.name_ar} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-beige-900 text-sm">{p.name_ar}</div>
                    <div className="text-xs text-blush-600">{p.price} ج.م</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter toggle + sort */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => setShowFilters(s => !s)}
            className="btn-ghost text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            الفلاتر
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-premium !w-auto !py-2 text-sm"
          >
            <option value="featured">الأكثر تميزاً</option>
            <option value="price-asc">السعر: الأقل أولاً</option>
            <option value="price-desc">السعر: الأعلى أولاً</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="glass-card rounded-3xl p-6 mb-8 animate-fade-in-up">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="التخصص">
                <select value={categorySlug} onChange={e => setCategorySlug(e.target.value)} className="input-premium text-sm">
                  <option value="">الكل</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name_ar}</option>)}
                </select>
              </Field>
              <Field label="الجنس">
                <select value={gender} onChange={e => setGender(e.target.value)} className="input-premium text-sm">
                  <option value="all">الكل</option>
                  <option value="female">نسائي</option>
                  <option value="male">رجالي</option>
                  <option value="unisex">للجنسين</option>
                </select>
              </Field>
              <Field label="المجموعة">
                <select value={collection} onChange={e => setCollection(e.target.value)} className="input-premium text-sm">
                  <option value="">الكل</option>
                  {collections.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="القماش">
                <select value={fabricId} onChange={e => setFabricId(e.target.value)} className="input-premium text-sm">
                  <option value="">الكل</option>
                  {fabrics.map(f => <option key={f.id} value={f.id}>{f.name_ar}</option>)}
                </select>
              </Field>
              <Field label="السعر الأدنى">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))} className="input-premium text-sm" placeholder="0" />
              </Field>
              <Field label="السعر الأعلى">
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} className="input-premium text-sm" placeholder="500" />
              </Field>
              <Field label="التوفر">
                <label className="flex items-center gap-2 input-premium !rounded-2xl cursor-pointer">
                  <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-5 h-5 accent-blush-500" />
                  <span className="text-sm">المتوفر فقط</span>
                </label>
              </Field>
              <div className="flex items-end">
                <button onClick={reset} className="btn-ghost w-full text-sm">إعادة تعيين</button>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-center text-beige-600 text-sm mb-6">
          {loading ? 'جارٍ التحميل...' : `${filtered.length} منتج`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden">
                <div className="aspect-[3/4] skeleton" />
                <div className="p-4 space-y-2"><div className="h-4 skeleton rounded-full" /><div className="h-4 w-2/3 skeleton rounded-full" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl text-beige-800 mb-2">لا توجد نتائج</h3>
            <p className="text-beige-600 mb-4">جرّب تعديل الفلاتر أو كلمة البحث</p>
            <button onClick={reset} className="btn-premium">إعادة تعيين الفلاتر</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-beige-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

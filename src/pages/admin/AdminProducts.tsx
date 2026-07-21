import { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories, createCategory } from '../../lib/api';
import type { Product, Category } from '../../lib/types';

const SCRUB_IMAGES = [
  'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg',
  'https://images.pexels.com/photos/4173324/pexels-photo-4173324.jpeg',
  'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg',
  'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg',
  'https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg',
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
    } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try { await deleteProduct(id); load(); } catch { /* ignore */ }
  };

  const toggleFeatured = async (p: Product) => {
    try { await updateProduct(p.id, { is_featured: !p.is_featured }); load(); } catch { /* ignore */ }
  };

  const toggleStock = async (p: Product) => {
    try { await updateProduct(p.id, { in_stock: !p.in_stock }); load(); } catch { /* ignore */ }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl animate-fade-in-up">
          <span className="premium-gradient-text">إدارة المنتجات</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCatForm(true)} className="btn-ghost text-sm">إضافة قسم</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-premium text-sm">+ منتج جديد</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-40 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="glass-card rounded-3xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
              <div className="flex gap-3">
                <img src={p.image_url} alt={p.name_ar} className="w-20 h-24 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-beige-900 text-sm mb-1 line-clamp-1">{p.name_ar}</h3>
                  <div className="font-display font-bold text-lg text-blush-700">{p.price} ج.م</div>
                  <div className="flex gap-1 mt-1">
                    {p.is_featured && <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 text-xs font-bold">مميز</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.in_stock ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex-1 glass rounded-full py-1.5 text-xs font-bold text-beige-700 hover:bg-white/70 transition-colors">تعديل</button>
                <button onClick={() => toggleFeatured(p)} className="glass rounded-full px-3 py-1.5 text-xs font-bold text-gold-600 hover:bg-white/70 transition-colors">★</button>
                <button onClick={() => toggleStock(p)} className="glass rounded-full px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-white/70 transition-colors">↻</button>
                <button onClick={() => handleDelete(p.id)} className="glass rounded-full px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
      {showCatForm && (
        <CategoryForm onClose={() => setShowCatForm(false)} onSaved={() => { setShowCatForm(false); load(); }} />
      )}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name_ar: product?.name_ar || '',
    slug: product?.slug || '',
    description_ar: product?.description_ar || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    gender: product?.gender || 'unisex',
    collection_ar: product?.collection_ar || '',
    image_url: product?.image_url || SCRUB_IMAGES[0],
    gallery_urls: (product?.gallery_urls?.length ? product.gallery_urls : [SCRUB_IMAGES[0], SCRUB_IMAGES[1], SCRUB_IMAGES[2]]).join('\n'),
    category_id: product?.category_id || '',
    is_featured: product?.is_featured || false,
    in_stock: product?.in_stock !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name_ar || !form.slug || !form.price || !form.image_url) {
      setError('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const gallery = form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean);
      if (product) {
        await updateProduct(product.id, {
          name_ar: form.name_ar,
          slug: form.slug,
          description_ar: form.description_ar || null,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          gender: form.gender as any,
          collection_ar: form.collection_ar || null,
          image_url: form.image_url,
          gallery_urls: gallery,
          category_id: form.category_id || null,
          is_featured: form.is_featured,
          in_stock: form.in_stock,
        });
      } else {
        await createProduct({
          name_ar: form.name_ar,
          slug: form.slug,
          description_ar: form.description_ar,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : undefined,
          gender: form.gender,
          collection_ar: form.collection_ar,
          image_url: form.image_url,
          gallery_urls: gallery,
          category_id: form.category_id,
          is_featured: form.is_featured,
          in_stock: form.in_stock,
        });
      }
      onSaved();
    } catch (e: any) { setError(e.message || 'حدث خطأ'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(20,10,30,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="glass-card rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-beige-900">{product ? 'تعديل المنتج' : 'منتج جديد'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-red-100 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">اسم المنتج *</label>
            <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="input-premium text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">المعرف (slug) *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-premium text-sm" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">الوصف</label>
            <textarea value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} className="input-premium !rounded-2xl text-sm min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">السعر *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-premium text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">سعر قبل الخصم</label>
              <input type="number" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} className="input-premium text-sm" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">النوع</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-premium text-sm">
                <option value="unisex">للجنسين</option>
                <option value="male">رجالي</option>
                <option value="female">نسائي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">القسم</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-premium text-sm">
                <option value="">بدون قسم</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">المجموعة</label>
            <input value={form.collection_ar} onChange={e => setForm({ ...form, collection_ar: e.target.value })} className="input-premium text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">الصورة الرئيسية *</label>
            <select value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-premium text-sm">
              {SCRUB_IMAGES.map(u => <option key={u} value={u}>{u.split('/').pop()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-beige-700 mb-1">صور المعرض (رابط كل سطر)</label>
            <textarea value={form.gallery_urls} onChange={e => setForm({ ...form, gallery_urls: e.target.value })} className="input-premium !rounded-2xl text-sm min-h-[80px]" dir="ltr" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-beige-700">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
              منتج مميز
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-beige-700">
              <input type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} className="w-4 h-4" />
              متوفر
            </label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button onClick={handleSave} disabled={saving} className="btn-premium w-full">
            {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !slug) return;
    setSaving(true);
    try { await createCategory(name, slug); onSaved(); } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(20,10,30,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="glass-card rounded-3xl max-w-sm w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-bold text-xl text-beige-900 mb-4">قسم جديد</h2>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم القسم" className="input-premium text-sm" />
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="slug" className="input-premium text-sm" dir="ltr" />
          <button onClick={handleSave} disabled={saving} className="btn-premium w-full">{saving ? '...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
}

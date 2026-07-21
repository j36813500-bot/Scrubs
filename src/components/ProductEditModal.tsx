import { useEffect, useState, FormEvent } from 'react'
import type { Product, Category, Fabric, ProductColor, ProductSize } from '../lib/types'
import { fetchProductColors, fetchProductSizes } from '../lib/api'

interface ProductEditModalProps {
  product: Product | null
  categories: Category[]
  fabrics: Fabric[]
  onClose: () => void
  onSave: (product: Partial<Product>) => void
}

interface ColorRow {
  name_ar: string
  hex_code: string
  image_url: string
}

export default function ProductEditModal({
  product,
  categories,
  fabrics,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const isEdit = !!product

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [gender, setGender] = useState('unisex')
  const [collection, setCollection] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [inStock, setInStock] = useState(true)
  const [washInstructions, setWashInstructions] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [sizeGuide, setSizeGuide] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fabricId, setFabricId] = useState('')
  const [colors, setColors] = useState<ColorRow[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newColor, setNewColor] = useState<ColorRow>({ name_ar: '', hex_code: '#e85c8a', image_url: '' })
  const [newSize, setNewSize] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (product) {
      setName(product.name_ar || '')
      setDescription(product.description_ar || '')
      setPrice(String(product.price ?? ''))
      setCompareAtPrice(product.compare_at_price != null ? String(product.compare_at_price) : '')
      setGender(product.gender || 'unisex')
      setCollection(product.collection_ar || '')
      setImageUrl(product.image_url || '')
      setGalleryUrls((product.gallery_urls || []).join(', '))
      setIsFeatured(product.is_featured || false)
      setInStock(product.in_stock ?? true)
      setWashInstructions(product.wash_instructions_ar || '')
      setSpecifications(product.specifications_ar || '')
      setSizeGuide(product.size_guide_ar || '')
      setCategoryId(product.category_id || '')
      setFabricId(product.fabric_id || '')

      if (isEdit) {
        setLoading(true)
        Promise.all([fetchProductColors(product.id), fetchProductSizes(product.id)])
          .then(([c, s]) => {
            setColors(
              c.map((col: ProductColor) => ({
                name_ar: col.name_ar,
                hex_code: col.hex_code || '#e85c8a',
                image_url: col.image_url || '',
              }))
            )
            setSizes(s.map((sz: ProductSize) => sz.size_label))
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      }
    }
  }, [product])

  const addColor = () => {
    if (!newColor.name_ar.trim()) return
    setColors([...colors, { ...newColor }])
    setNewColor({ name_ar: '', hex_code: '#e85c8a', image_url: '' })
  }

  const removeColor = (i: number) => {
    setColors(colors.filter((_, idx) => idx !== i))
  }

  const addSize = () => {
    const s = newSize.trim()
    if (!s || sizes.includes(s)) return
    setSizes([...sizes, s])
    setNewSize('')
  }

  const removeSize = (i: number) => {
    setSizes(sizes.filter((_, idx) => idx !== i))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const gallery = galleryUrls
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean)

    const payload: Partial<Product> & { colors?: ColorRow[]; sizes?: string[] } = {
      name_ar: name,
      description_ar: description || null,
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      gender,
      collection_ar: collection || null,
      image_url: imageUrl || null,
      gallery_urls: gallery,
      is_featured: isFeatured,
      in_stock: inStock,
      wash_instructions_ar: washInstructions || null,
      specifications_ar: specifications || null,
      size_guide_ar: sizeGuide || null,
      category_id: categoryId || null,
      fabric_id: fabricId || null,
    }

    if (isEdit && product) {
      ;(payload as any).id = product.id
    }

    onSave(payload as Partial<Product>)
  }

  const inputCls = 'input-premium'
  const labelCls = 'block text-sm font-bold text-gray-700 mb-1.5'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="glass-card relative max-h-[92vh] w-full max-w-3xl overflow-y-auto no-scrollbar p-6 animate-scale-in shadow-glow md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full glass text-gray-600 transition-colors hover:text-blush-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full glass shadow-premium animate-float-medium">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#editGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="editGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#e85c8a" />
                  <stop offset="50%" stopColor="#916dba" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold premium-gradient-text">
            {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>اسم المنتج</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="اسم المنتج" required />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>الوصف</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} rows={3} placeholder="وصف المنتج" />
              </div>

              <div>
                <label className={labelCls}>السعر (ج.م)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="0.00" required />
              </div>

              <div>
                <label className={labelCls}>السعر قبل الخصم (اختياري)</label>
                <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className={inputCls} placeholder="0.00" />
              </div>

              <div>
                <label className={labelCls}>النوع</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                  <option value="unisex">للجنسين</option>
                  <option value="men">رجالي</option>
                  <option value="women">حريمي</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>المجموعة</label>
                <input value={collection} onChange={(e) => setCollection(e.target.value)} className={inputCls} placeholder="مجموعة الصيف" />
              </div>

              <div>
                <label className={labelCls}>التصنيف</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>القماش</label>
                <select value={fabricId} onChange={(e) => setFabricId(e.target.value)} className={inputCls}>
                  <option value="">بدون قماش</option>
                  {fabrics.map((f) => (
                    <option key={f.id} value={f.id}>{f.name_ar}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>رابط الصورة الرئيسية</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputCls} dir="ltr" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>رابط معرض الصور (مفصولة بفاصلة)</label>
                <input value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} className={inputCls} dir="ltr" placeholder="url1, url2, url3" />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                  isFeatured ? 'btn-premium' : 'btn-ghost'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                منتج مميز
              </button>

              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                  inStock ? 'btn-premium' : 'btn-ghost'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={inStock ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                متوفر في المخزون
              </button>
            </div>

            {/* Colors */}
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-sm font-extrabold text-gray-800">الألوان</h3>
              <div className="mb-3 flex flex-wrap gap-2">
                {colors.length === 0 && <p className="text-xs text-gray-500">لا توجد ألوان مضافة</p>}
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full glass px-3 py-1.5">
                    <span className="h-4 w-4 rounded-full border border-white/60" style={{ background: c.hex_code }} />
                    <span className="text-xs font-bold text-gray-700">{c.name_ar}</span>
                    <button type="button" onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">الاسم</label>
                  <input value={newColor.name_ar} onChange={(e) => setNewColor({ ...newColor, name_ar: e.target.value })} className="input-premium" placeholder="أحمر" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">اللون</label>
                  <input type="color" value={newColor.hex_code} onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })} className="h-[50px] w-16 rounded-2xl border border-blush-200 bg-white p-1" />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="mb-1 block text-xs text-gray-500">رابط صورة (اختياري)</label>
                  <input value={newColor.image_url} onChange={(e) => setNewColor({ ...newColor, image_url: e.target.value })} className="input-premium" dir="ltr" placeholder="https://..." />
                </div>
                <button type="button" onClick={addColor} className="btn-ghost py-3">إضافة لون</button>
              </div>
            </div>

            {/* Sizes */}
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-sm font-extrabold text-gray-800">المقاسات</h3>
              <div className="mb-3 flex flex-wrap gap-2">
                {sizes.length === 0 && <p className="text-xs text-gray-500">لا توجد مقاسات مضافة</p>}
                {sizes.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5">
                    <span className="text-xs font-bold text-gray-700">{s}</span>
                    <button type="button" onClick={() => removeSize(i)} className="text-red-400 hover:text-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">إضافة مقاس</label>
                  <input value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize() } }} className="input-premium" placeholder="S, M, L, XL" />
                </div>
                <button type="button" onClick={addSize} className="btn-ghost py-3">إضافة</button>
              </div>
            </div>

            {/* Extra fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>تعليمات الغسيل</label>
                <textarea value={washInstructions} onChange={(e) => setWashInstructions(e.target.value)} className={inputCls} rows={2} placeholder="تعليمات العناية" />
              </div>
              <div>
                <label className={labelCls}>المواصفات</label>
                <textarea value={specifications} onChange={(e) => setSpecifications(e.target.value)} className={inputCls} rows={3} placeholder="المواصفات الفنية" />
              </div>
              <div>
                <label className={labelCls}>دليل المقاسات</label>
                <textarea value={sizeGuide} onChange={(e) => setSizeGuide(e.target.value)} className={inputCls} rows={2} placeholder="جدول المقاسات" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-premium flex-1">
                {isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

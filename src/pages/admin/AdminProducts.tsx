import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from '../../lib/router'
import {
  fetchProducts,
  fetchCategories,
  fetchFabrics,
  deleteProduct,
  updateProduct,
  createProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../lib/api'
import type { Product, Category, Fabric } from '../../lib/types'
import ProductEditModal from '../../components/ProductEditModal'

interface CategoryFormData {
  name_ar: string
  slug: string
  description_ar: string
  icon: string
  sort_order: number
}

const emptyCategoryForm: CategoryFormData = {
  name_ar: '',
  slug: '',
  description_ar: '',
  icon: '',
  sort_order: 0,
}

export default function AdminProducts(): JSX.Element {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showCategories, setShowCategories] = useState<boolean>(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(emptyCategoryForm)
  const [savingCategory, setSavingCategory] = useState<boolean>(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const [p, c, f] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchFabrics(),
      ])
      setProducts(p)
      setCategories(c)
      setFabrics(f)
    } catch (err: unknown) {
      console.error('Failed to load products data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredProducts: Product[] = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name_ar.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        !filterCategory || p.category_id === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, filterCategory])

  const getCategoryName = useCallback(
    (categoryId: string | null): string => {
      if (!categoryId) return 'بدون تصنيف'
      const cat = categories.find((c) => c.id === categoryId)
      return cat ? cat.name_ar : 'بدون تصنيف'
    },
    [categories]
  )

  const handleAddProduct = useCallback((): void => {
    setEditProduct(null)
    setShowEditModal(true)
  }, [])

  const handleEditProduct = useCallback((product: Product): void => {
    setEditProduct(product)
    setShowEditModal(true)
  }, [])

  const handleCloseModal = useCallback((): void => {
    setShowEditModal(false)
    setEditProduct(null)
  }, [])

  const handleSaveProduct = useCallback(
    async (productData: Partial<Product>): Promise<void> => {
      try {
        if (editProduct) {
          const { id, ...updates } = productData as Product & { id?: string }
          await updateProduct(editProduct.id, updates)
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editProduct.id ? { ...p, ...updates } : p
            )
          )
        } else {
          const created = await createProduct(productData)
          if (created) {
            setProducts((prev) => [...prev, created])
          }
        }
        setShowEditModal(false)
        setEditProduct(null)
      } catch (err: unknown) {
        console.error('Failed to save product:', err)
      }
    },
    [editProduct]
  )

  const handleDeleteProduct = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteProduct(id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setConfirmDeleteId(null)
      } catch (err: unknown) {
        console.error('Failed to delete product:', err)
      }
    },
    []
  )

  const handleToggleFeatured = useCallback(
    async (product: Product): Promise<void> => {
      try {
        const updated = !product.is_featured
        await updateProduct(product.id, { is_featured: updated })
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, is_featured: updated } : p
          )
        )
      } catch (err: unknown) {
        console.error('Failed to toggle featured:', err)
      }
    },
    []
  )

  const handleToggleStock = useCallback(
    async (product: Product): Promise<void> => {
      try {
        const updated = !product.in_stock
        await updateProduct(product.id, { in_stock: updated })
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, in_stock: updated } : p
          )
        )
      } catch (err: unknown) {
        console.error('Failed to toggle stock:', err)
      }
    },
    []
  )

  const handleEditCategory = useCallback((cat: Category): void => {
    setEditingCategory(cat)
    setCategoryForm({
      name_ar: cat.name_ar,
      slug: cat.slug,
      description_ar: cat.description_ar || '',
      icon: cat.icon || '',
      sort_order: cat.sort_order,
    })
  }, [])

  const handleCancelCategoryEdit = useCallback((): void => {
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
  }, [])

  const handleSaveCategory = useCallback(async (): Promise<void> => {
    if (!categoryForm.name_ar.trim() || !categoryForm.slug.trim()) return
    setSavingCategory(true)
    try {
      const payload = {
        name_ar: categoryForm.name_ar,
        slug: categoryForm.slug,
        description_ar: categoryForm.description_ar || null,
        icon: categoryForm.icon || null,
        sort_order: categoryForm.sort_order,
      }
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload)
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...payload } : c
          )
        )
      } else {
        await createCategory(payload)
        const fresh = await fetchCategories()
        setCategories(fresh)
      }
      setEditingCategory(null)
      setCategoryForm(emptyCategoryForm)
    } catch (err: unknown) {
      console.error('Failed to save category:', err)
    } finally {
      setSavingCategory(false)
    }
  }, [categoryForm, editingCategory])

  const handleDeleteCategory = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } catch (err: unknown) {
        console.error('Failed to delete category:', err)
      }
    },
    []
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row md:text-right">
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-extrabold premium-gradient-text">إدارة المنتجات</h1>
            <p className="mt-2 text-sm font-bold text-gray-500">إضافة وتعديل وحذف المنتجات والتصنيفات</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.navigate('/admin')} className="btn-ghost">
              رجوع
            </button>
            <button
              onClick={() => {
                setShowCategories(!showCategories)
                setEditingCategory(null)
                setCategoryForm(emptyCategoryForm)
              }}
              className="btn-ghost"
            >
              {showCategories ? 'المنتجات' : 'التصنيفات'}
            </button>
            {!showCategories && (
              <button onClick={handleAddProduct} className="btn-premium">
                + إضافة منتج
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : showCategories ? (
          /* Categories management */
          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
              <h2 className="mb-6 text-xl font-extrabold text-gray-800">
                {editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">اسم التصنيف</label>
                  <input
                    value={categoryForm.name_ar}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name_ar: e.target.value })
                    }
                    className="input-premium"
                    placeholder="اسم التصنيف"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">المعرّف (slug)</label>
                  <input
                    value={categoryForm.slug}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, slug: e.target.value })
                    }
                    className="input-premium"
                    dir="ltr"
                    placeholder="category-slug"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">الوصف</label>
                  <textarea
                    value={categoryForm.description_ar}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description_ar: e.target.value })
                    }
                    className="input-premium"
                    rows={2}
                    placeholder="وصف التصنيف"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">الأيقونة</label>
                  <input
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                    className="input-premium"
                    dir="ltr"
                    placeholder="icon-name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">ترتيب الفرز</label>
                  <input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-premium"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSaveCategory}
                  disabled={savingCategory}
                  className="btn-premium"
                >
                  {savingCategory ? 'جاري الحفظ...' : editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
                </button>
                {editingCategory && (
                  <button onClick={handleCancelCategoryEdit} className="btn-ghost">
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="mb-6 text-xl font-extrabold text-gray-800">التصنيفات الحالية</h2>
              {categories.length === 0 ? (
                <p className="py-8 text-center text-sm font-bold text-gray-500">لا توجد تصنيفات</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat, i) => (
                    <div
                      key={cat.id}
                      className="glass rounded-2xl p-4 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-gray-800">{cat.name_ar}</p>
                          <p className="text-xs text-gray-500" dir="ltr">{cat.slug}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-blush-600 transition-colors hover:text-blush-700"
                            aria-label="تعديل"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-red-500 transition-colors hover:text-red-600"
                            aria-label="حذف"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {cat.description_ar && (
                        <p className="text-xs text-gray-600">{cat.description_ar}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Products management */
          <>
            {/* Search & filter */}
            <div className="glass-card mb-6 flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#916dba"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium pr-10"
                  placeholder="ابحث عن منتج..."
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-premium md:w-64"
              >
                <option value="">كل التصنيفات</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
              <div className="glass-card py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                    <path d="M20 7l-8-4-8 4 8 4 8-4z" />
                    <path d="M4 7v10l8 4 8-4V7" />
                    <path d="M12 11v10" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-500">لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="glass-card group overflow-hidden p-5 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    {/* Image */}
                    <div className="mb-4 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blush-50 to-lavender-50" style={{ height: '160px' }}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name_ar}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                          <path d="M20 7l-8-4-8 4 8 4 8-4z" />
                          <path d="M4 7v10l8 4 8-4V7" />
                          <path d="M12 11v10" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mb-3">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-gray-800">{product.name_ar}</h3>
                        <div className="flex flex-shrink-0 gap-1.5">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-blush-600 transition-colors hover:text-blush-700"
                            aria-label="تعديل"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-red-500 transition-colors hover:text-red-600"
                            aria-label="حذف"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{getCategoryName(product.category_id)}</p>
                      <p className="mt-1 text-lg font-extrabold premium-gradient-text">
                        {product.price} ج.م
                      </p>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          product.is_featured ? 'btn-premium' : 'btn-ghost'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={product.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        مميز
                      </button>
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          product.in_stock ? 'btn-premium' : 'btn-ghost'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={product.in_stock ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {product.in_stock ? 'متوفر' : 'نفذ'}
                      </button>
                    </div>

                    {/* Delete confirmation */}
                    {confirmDeleteId === product.id && (
                      <div className="mt-3 rounded-2xl bg-red-50 p-3 animate-fade-in">
                        <p className="mb-2 text-center text-xs font-bold text-red-600">
                          هل أنت متأكد من حذف هذا المنتج؟
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600"
                          >
                            نعم، احذف
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 rounded-xl glass px-3 py-2 text-xs font-bold text-gray-600"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Product edit modal */}
      {showEditModal && (
        <ProductEditModal
          product={editProduct}
          categories={categories}
          fabrics={fabrics}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import {
  fetchSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../lib/api'
import type { SocialLink } from '../../lib/types'

interface SocialForm {
  platform: string
  label_ar: string
  url: string
  icon: string
  color_hex: string
  sort_order: number
}

const emptyForm: SocialForm = {
  platform: '',
  label_ar: '',
  url: '',
  icon: '',
  color_hex: '#916dba',
  sort_order: 0,
}

export default function AdminSocial(): JSX.Element {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [form, setForm] = useState<SocialForm>(emptyForm)
  const [saving, setSaving] = useState<boolean>(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadLinks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await fetchSocialLinks()
      setLinks(data)
    } catch (err: unknown) {
      console.error('Failed to load social links:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const handleAdd = useCallback((): void => {
    setIsAdding(true)
    setEditingId(null)
    setForm(emptyForm)
  }, [])

  const handleEdit = useCallback((link: SocialLink): void => {
    setEditingId(link.id)
    setIsAdding(false)
    setForm({
      platform: link.platform,
      label_ar: link.label_ar,
      url: link.url,
      icon: link.icon || '',
      color_hex: link.color_hex || '#916dba',
      sort_order: link.sort_order,
    })
  }, [])

  const handleCancel = useCallback((): void => {
    setEditingId(null)
    setIsAdding(false)
    setForm(emptyForm)
  }, [])

  const handleSave = useCallback(async (): Promise<void> => {
    if (!form.platform.trim() || !form.url.trim()) return
    setSaving(true)
    try {
      const payload = {
        platform: form.platform,
        label_ar: form.label_ar || form.platform,
        url: form.url,
        icon: form.icon || '',
        color_hex: form.color_hex || null,
        sort_order: form.sort_order,
      }
      if (editingId) {
        await updateSocialLink(editingId, payload)
        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingId ? { ...l, ...payload } : l
          )
        )
      } else {
        await createSocialLink(payload)
        await loadLinks()
      }
      handleCancel()
    } catch (err: unknown) {
      console.error('Failed to save social link:', err)
    } finally {
      setSaving(false)
    }
  }, [form, editingId, loadLinks, handleCancel])

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteSocialLink(id)
        setLinks((prev) => prev.filter((l) => l.id !== id))
        setConfirmDeleteId(null)
      } catch (err: unknown) {
        console.error('Failed to delete social link:', err)
      }
    },
    []
  )

  const showForm: boolean = isAdding || editingId !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-extrabold premium-gradient-text">روابط التواصل</h1>
            <p className="mt-2 text-sm font-bold text-gray-500">إدارة روابط التواصل الاجتماعي</p>
          </div>
          {!showForm && (
            <button onClick={handleAdd} className="btn-premium">
              + إضافة رابط
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card mb-6 p-6 animate-fade-in">
            <h2 className="mb-4 text-lg font-extrabold text-gray-800">
              {editingId ? 'تعديل الرابط' : 'إضافة رابط جديد'}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">المنصة</label>
                <input
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="input-premium"
                  dir="ltr"
                  placeholder="instagram, facebook, whatsapp..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">الاسم (عربي)</label>
                <input
                  value={form.label_ar}
                  onChange={(e) => setForm({ ...form, label_ar: e.target.value })}
                  className="input-premium"
                  placeholder="إنستجرام"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-gray-700">الرابط</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="input-premium"
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">الأيقونة</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="input-premium"
                  dir="ltr"
                  placeholder="icon name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">اللون</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color_hex}
                    onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                    className="h-[50px] w-16 rounded-2xl border border-blush-200 bg-white p-1"
                  />
                  <input
                    value={form.color_hex}
                    onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                    className="input-premium flex-1"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">ترتيب الفرز</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                  }
                  className="input-premium"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-premium flex-1"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button onClick={handleCancel} className="btn-ghost flex-1">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Links list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : links.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500">لا توجد روابط تواصل</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {links.map((link, i) => (
              <div
                key={link.id}
                className="glass-card p-5 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl glass"
                      style={{ color: link.color_hex || '#916dba' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">
                        {link.label_ar || link.platform}
                      </p>
                      <p className="text-xs text-gray-500" dir="ltr">{link.platform}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-xs text-blush-600 hover:underline"
                        dir="ltr"
                        style={{ maxWidth: '200px' }}
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <button
                      onClick={() => handleEdit(link)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg glass text-blush-600 transition-colors hover:text-blush-700"
                      aria-label="تعديل"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(link.id)}
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

                {/* Delete confirmation */}
                {confirmDeleteId === link.id && (
                  <div className="mt-3 rounded-2xl bg-red-50 p-3 animate-fade-in">
                    <p className="mb-2 text-center text-xs font-bold text-red-600">
                      هل أنت متأكد من حذف هذا الرابط؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(link.id)}
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
      </div>
    </div>
  )
}

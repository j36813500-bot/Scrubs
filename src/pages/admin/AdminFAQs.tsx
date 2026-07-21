import { useEffect, useState, useCallback } from 'react'
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../lib/api'
import type { FAQ } from '../../lib/types'

interface FAQForm {
  question_ar: string
  answer_ar: string
  sort_order: number
}

const emptyForm: FAQForm = {
  question_ar: '',
  answer_ar: '',
  sort_order: 0,
}

export default function AdminFAQs(): JSX.Element {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [form, setForm] = useState<FAQForm>(emptyForm)
  const [saving, setSaving] = useState<boolean>(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadFAQs = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await fetchFAQs()
      setFaqs(data)
    } catch (err: unknown) {
      console.error('Failed to load FAQs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFAQs()
  }, [loadFAQs])

  const handleAdd = useCallback((): void => {
    setIsAdding(true)
    setEditingId(null)
    setForm(emptyForm)
  }, [])

  const handleEdit = useCallback((faq: FAQ): void => {
    setEditingId(faq.id)
    setIsAdding(false)
    setForm({
      question_ar: faq.question_ar,
      answer_ar: faq.answer_ar,
      sort_order: faq.sort_order,
    })
  }, [])

  const handleCancel = useCallback((): void => {
    setEditingId(null)
    setIsAdding(false)
    setForm(emptyForm)
  }, [])

  const handleSave = useCallback(async (): Promise<void> => {
    if (!form.question_ar.trim() || !form.answer_ar.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateFAQ(editingId, {
          question_ar: form.question_ar,
          answer_ar: form.answer_ar,
          sort_order: form.sort_order,
        })
        setFaqs((prev) =>
          prev.map((f) =>
            f.id === editingId
              ? { ...f, question_ar: form.question_ar, answer_ar: form.answer_ar, sort_order: form.sort_order }
              : f
          )
        )
      } else {
        await createFAQ({
          question_ar: form.question_ar,
          answer_ar: form.answer_ar,
          sort_order: form.sort_order,
        })
        await loadFAQs()
      }
      handleCancel()
    } catch (err: unknown) {
      console.error('Failed to save FAQ:', err)
    } finally {
      setSaving(false)
    }
  }, [form, editingId, loadFAQs, handleCancel])

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteFAQ(id)
        setFaqs((prev) => prev.filter((f) => f.id !== id))
        setConfirmDeleteId(null)
      } catch (err: unknown) {
        console.error('Failed to delete FAQ:', err)
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
            <h1 className="text-3xl font-extrabold premium-gradient-text">إدارة الأسئلة الشائعة</h1>
            <p className="mt-2 text-sm font-bold text-gray-500">إضافة وتعديل وحذف الأسئلة الشائعة</p>
          </div>
          {!showForm && (
            <button onClick={handleAdd} className="btn-premium">
              + إضافة سؤال
            </button>
          )}
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="glass-card mb-6 p-6 animate-fade-in">
            <h2 className="mb-4 text-lg font-extrabold text-gray-800">
              {editingId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">السؤال</label>
                <input
                  value={form.question_ar}
                  onChange={(e) => setForm({ ...form, question_ar: e.target.value })}
                  className="input-premium"
                  placeholder="اكتب السؤال هنا..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">الإجابة</label>
                <textarea
                  value={form.answer_ar}
                  onChange={(e) => setForm({ ...form, answer_ar: e.target.value })}
                  className="input-premium"
                  rows={3}
                  placeholder="اكتب الإجابة هنا..."
                />
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
              <div className="flex gap-3">
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
          </div>
        )}

        {/* FAQ list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : faqs.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500">لا توجد أسئلة شائعة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={faq.id}
                className="glass-card p-5 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full glass text-xs font-extrabold premium-gradient-text">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-extrabold text-gray-800">{faq.question_ar}</h3>
                    </div>
                    <p className="pr-9 text-sm text-gray-600">{faq.answer_ar}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg glass text-blush-600 transition-colors hover:text-blush-700"
                      aria-label="تعديل"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(faq.id)}
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
                {confirmDeleteId === faq.id && (
                  <div className="mt-3 rounded-2xl bg-red-50 p-3 animate-fade-in">
                    <p className="mb-2 text-center text-xs font-bold text-red-600">
                      هل أنت متأكد من حذف هذا السؤال؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(faq.id)}
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

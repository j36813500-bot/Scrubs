import { useEffect, useState, useCallback } from 'react'
import { fetchSettings, updateSetting } from '../../lib/api'
import type { Setting } from '../../lib/types'

interface SettingForm {
  brand_name: string
  tagline: string
  free_shipping_threshold: string
  currency: string
  support_phone: string
  support_email: string
}

const settingKeys: Record<string, keyof SettingForm> = {
  brand_name: 'brand_name',
  tagline: 'tagline',
  free_shipping_threshold: 'free_shipping_threshold',
  currency: 'currency',
  support_phone: 'support_phone',
  support_email: 'support_email',
}

const defaultForm: SettingForm = {
  brand_name: '',
  tagline: '',
  free_shipping_threshold: '',
  currency: 'ج.م',
  support_phone: '',
  support_email: '',
}

export default function AdminSettings(): JSX.Element {
  const [settings, setSettings] = useState<Setting[]>([])
  const [form, setForm] = useState<SettingForm>(defaultForm)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [savedMessage, setSavedMessage] = useState<string>('')

  useEffect(() => {
    let mounted = true
    fetchSettings()
      .then((data) => {
        if (!mounted) return
        setSettings(data)
        const next: SettingForm = { ...defaultForm }
        data.forEach((s) => {
          const field = settingKeys[s.key]
          if (field) {
            next[field] = s.value_ar
          }
        })
        setForm(next)
      })
      .catch((err: unknown) => {
        console.error('Failed to load settings:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true)
    setSavedMessage('')
    try {
      const updates: Promise<void>[] = []
      ;(Object.keys(form) as (keyof SettingForm)[]).forEach((field) => {
        const key = field as string
        updates.push(updateSetting(key, form[field]))
      })
      await Promise.all(updates)
      setSavedMessage('تم حفظ الإعدادات بنجاح')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err: unknown) {
      console.error('Failed to save settings:', err)
      setSavedMessage('حدث خطأ أثناء الحفظ')
      setTimeout(() => setSavedMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }, [form])

  const labelCls: string = 'block text-sm font-bold text-gray-700 mb-1.5'
  const inputCls: string = 'input-premium'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
        <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold premium-gradient-text">إعدادات المتجر</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">تعديل الإعدادات العامة للمتجر</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="glass-card space-y-6 p-6 md:p-8"
        >
          {/* Brand name */}
          <div>
            <label className={labelCls}>اسم العلامة التجارية</label>
            <input
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              className={inputCls}
              placeholder="اسكربك"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className={labelCls}>الشعار النصي</label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={inputCls}
              placeholder="أناقة طبية بلمسة فاخرة"
            />
          </div>

          {/* Free shipping threshold */}
          <div>
            <label className={labelCls}>حد الشحن المجاني (ج.م)</label>
            <input
              type="number"
              value={form.free_shipping_threshold}
              onChange={(e) =>
                setForm({ ...form, free_shipping_threshold: e.target.value })
              }
              className={inputCls}
              placeholder="500"
            />
          </div>

          {/* Currency */}
          <div>
            <label className={labelCls}>العملة</label>
            <input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputCls}
              placeholder="ج.م"
            />
          </div>

          {/* Support phone */}
          <div>
            <label className={labelCls}>هاتف الدعم</label>
            <input
              value={form.support_phone}
              onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
              className={inputCls}
              dir="ltr"
              placeholder="+20 100 000 0000"
            />
          </div>

          {/* Support email */}
          <div>
            <label className={labelCls}>بريد الدعم</label>
            <input
              type="email"
              value={form.support_email}
              onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              className={inputCls}
              dir="ltr"
              placeholder="support@example.com"
            />
          </div>

          {/* Save message */}
          {savedMessage && (
            <div className="rounded-2xl bg-green-50 p-3 text-center text-sm font-bold text-green-600 animate-fade-in">
              {savedMessage}
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-premium w-full"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      </div>
    </div>
  )
}

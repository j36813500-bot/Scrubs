import { useState, useEffect, FormEvent } from 'react'
import { signInCustomer, signUpCustomer } from '../lib/auth'

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
  onAuthenticated: () => void
  title?: string
  subtitle?: string
}

type Tab = 'login' | 'signup'

export default function AuthGateModal({
  open,
  onClose,
  onAuthenticated,
  title,
  subtitle,
}: AuthGateModalProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setError(null)
      setTab('login')
      setName('')
      setPhone('')
      setPassword('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        const { error: err } = await signInCustomer(phone, password)
        if (err) {
          setError(err.message || 'فشل تسجيل الدخول')
          return
        }
      } else {
        if (!name.trim()) {
          setError('الرجاء إدخال الاسم')
          return
        }
        const { error: err } = await signUpCustomer(name, phone, password)
        if (err) {
          setError(err.message || 'فشل إنشاء الحساب')
          return
        }
      }
      onAuthenticated()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="glass-card relative w-full max-w-md p-8 animate-scale-in shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 w-9 h-9 rounded-full glass flex items-center justify-center text-gray-600 hover:text-blush-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass shadow-premium mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#e85c8a" />
                  <stop offset="50%" stopColor="#916dba" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold premium-gradient-text">
            {title || (tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {subtitle || (tab === 'login' ? 'أهلاً بعودتك إلى اسكربك' : 'انضم إلى عائلة اسكربك')}
          </p>
        </div>

        <div className="flex gap-2 p-1 glass rounded-full mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null) }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              tab === 'login' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
            }`}
          >
            دخول
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null) }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              tab === 'signup' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
            }`}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ادخل اسمك الكامل"
                className="input-premium"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              className="input-premium"
              dir="ltr"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-premium"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 animate-fade-in">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                جارٍ المعالجة...
              </span>
            ) : tab === 'login' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          بمتابعتك تسجيل الدخول فإنك توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  )
}

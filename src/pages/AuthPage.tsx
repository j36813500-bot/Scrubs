import { useEffect, useState } from 'react'
import { useRouter } from '../lib/router'
import {
  signInCustomer,
  signUpCustomer,
  signInAdmin,
} from '../lib/auth'

// ── Animated background blobs ─────────────────────────────────────
function AnimatedBackground(): JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-lavender-200/30 blur-3xl animate-float-medium" />
      <div className="absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-gold-200/20 blur-3xl animate-float-slow" />
    </div>
  )
}

// ── Customer login form ────────────────────────────────────────────
interface CustomerLoginProps {
  onSuccess: () => void
}

function CustomerLogin({ onSuccess }: CustomerLoginProps): JSX.Element {
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!phone.trim() || !password) {
      setError('الرجاء إدخال رقم الهاتف وكلمة المرور')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signInCustomer(phone.trim(), password)
      if (err) {
        setError(err.message || 'فشل تسجيل الدخول')
        return
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
        <input
          type="tel"
          value={phone}
          onChange={(e): void => setPhone(e.target.value)}
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
          onChange={(e): void => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-premium"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'جارٍ المعالجة...' : 'تسجيل الدخول'}
      </button>
    </form>
  )
}

// ── Customer signup form ───────────────────────────────────────────
interface CustomerSignupProps {
  onSuccess: () => void
}

function CustomerSignup({ onSuccess }: CustomerSignupProps): JSX.Element {
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !password) {
      setError('الرجاء ملء جميع الحقول')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signUpCustomer(name.trim(), phone.trim(), password)
      if (err) {
        setError(err.message || 'فشل إنشاء الحساب')
        return
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم الكامل</label>
        <input
          type="text"
          value={name}
          onChange={(e): void => setName(e.target.value)}
          placeholder="اسمك الكامل"
          className="input-premium"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
        <input
          type="tel"
          value={phone}
          onChange={(e): void => setPhone(e.target.value)}
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
          onChange={(e): void => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-premium"
          autoComplete="new-password"
        />
      </div>
      {error && (
        <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'جارٍ المعالجة...' : 'إنشاء الحساب'}
      </button>
    </form>
  )
}

// ── Admin login form ───────────────────────────────────────────────
interface AdminLoginProps {
  onSuccess: () => void
}

function AdminLogin({ onSuccess }: AdminLoginProps): JSX.Element {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signInAdmin(username.trim(), password)
      if (err) {
        setError(err.message || 'فشل تسجيل الدخول')
        return
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">اسم المستخدم</label>
        <input
          type="text"
          value={username}
          onChange={(e): void => setUsername(e.target.value)}
          placeholder="اسم المستخدم للإدارة"
          className="input-premium"
          dir="ltr"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e): void => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-premium"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'جارٍ المعالجة...' : 'دخول الإدارة'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────
type Mode = 'customer' | 'admin'
type CustomerTab = 'login' | 'signup'

export default function AuthPage(): JSX.Element {
  const { navigate } = useRouter()

  const [mode, setMode] = useState<Mode>('customer')
  const [customerTab, setCustomerTab] = useState<CustomerTab>('login')

  const handleCustomerSuccess = (): void => {
    navigate('/profile')
  }

  const handleAdminSuccess = (): void => {
    navigate('/admin')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 shadow-glow animate-scale-in">
          {/* ── Logo + title ── */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass shadow-premium mb-3 animate-breathe">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#authGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="authGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#e85c8a" />
                    <stop offset="50%" stopColor="#916dba" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold premium-gradient-text">اسكربك</h1>
            <p className="text-sm text-gray-500 mt-1">يونيفورمات طبية فاخرة</p>
          </div>

          {/* ── Mode toggle ── */}
          <div className="flex gap-2 p-1 glass rounded-full mb-6">
            <button
              type="button"
              onClick={(): void => setMode('customer')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                mode === 'customer' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
              }`}
            >
              عميل
            </button>
            <button
              type="button"
              onClick={(): void => setMode('admin')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                mode === 'admin' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
              }`}
            >
              إدارة
            </button>
          </div>

          {/* ── Customer mode ── */}
          {mode === 'customer' && (
            <>
              {/* Login / Signup tabs */}
              <div className="flex gap-2 p-1 glass rounded-full mb-6">
                <button
                  type="button"
                  onClick={(): void => { setCustomerTab('login') }}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    customerTab === 'login' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={(): void => { setCustomerTab('signup') }}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    customerTab === 'signup' ? 'btn-premium' : 'text-gray-600 hover:text-blush-600'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {customerTab === 'login' ? (
                <CustomerLogin onSuccess={handleCustomerSuccess} />
              ) : (
                <CustomerSignup onSuccess={handleCustomerSuccess} />
              )}
            </>
          )}

          {/* ── Admin mode ── */}
          {mode === 'admin' && (
            <AdminLogin onSuccess={handleAdminSuccess} />
          )}

          {/* ── Back to home ── */}
          <button
            onClick={(): void => navigate('/')}
            className="mt-6 w-full text-center text-sm text-gray-500 hover:text-blush-600 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react';
import { useRouter } from '../lib/router';
import { signInCustomer, signUpCustomer, signInAdmin } from '../lib/auth';

// ============================================================================
// AuthPage — Premium Arabic (RTL) medical scrubs e-commerce authentication
// Palette: blush (pink) · lavender (purple) · beige (neutral) · gold (accent)
// Effects: glass morphism, ambient glow orbs, premium gradient text, float
// Modes:  customer (login/signup) · admin (login)
// ============================================================================

// ----------------------------------------------------------------------------
// Inline SVG icons (lucide-react style, stroke-based, 24x24 viewBox)
// ----------------------------------------------------------------------------
type IconProps = { className?: string };

function UserIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LockIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function HomeIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

function SpinnerIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Ambient glow orbs — blurred, animated background accents
// ----------------------------------------------------------------------------
function GlowOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="animate-float-medium absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)' }}
      />
      <div
        className="animate-float-medium absolute top-1/3 -left-32 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 70%)', animationDelay: '1.2s' }}
      />
      <div
        className="animate-float-medium absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)', animationDelay: '2.1s' }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Brand logo — gradient circle with "س", "اسكربك" text
// ----------------------------------------------------------------------------
function BrandLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="animate-float-medium flex h-20 w-20 items-center justify-center rounded-full shadow-xl shadow-blush-300/40 sm:h-24 sm:w-24"
        style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 100%)' }}
      >
        <span className="text-4xl font-bold text-white drop-shadow-sm sm:text-5xl">س</span>
      </div>
      <h1 className="premium-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
        اسكربك
      </h1>
      <p className="text-sm font-medium text-stone-500">يونيفورمات طبية فاخرة</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Mode toggle pills — customer / admin
// ----------------------------------------------------------------------------
type Mode = 'customer' | 'admin';

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="relative flex rounded-full bg-white/60 p-1 shadow-inner backdrop-blur-sm">
      {(['customer', 'admin'] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={[
              'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-300',
              active ? 'text-white' : 'text-stone-500 hover:text-stone-700',
            ].join('')}
          >
            {active && (
              <span
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-l from-blush-500 to-lavender-500 shadow-md shadow-blush-500/30"
                aria-hidden="true"
              />
            )}
            {m === 'customer' ? <UserIcon className="h-4 w-4" /> : <ShieldIcon className="h-4 w-4" />}
            <span>{m === 'customer' ? 'العميل' : 'المشرف'}</span>
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Text field — labeled input with leading icon
// ----------------------------------------------------------------------------
type TextFieldProps = {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'password';
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: (props: IconProps) => JSX.Element;
  autoComplete?: string;
  dir?: 'rtl' | 'ltr';
  disabled?: boolean;
};

function TextField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
  dir = 'rtl',
  disabled,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-stone-700">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400 transition-colors group-focus-within:text-blush-500">
          <Icon className="h-5 w-5" />
        </span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          dir={dir}
          disabled={disabled}
          className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pr-11 pl-4 text-sm text-stone-800 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-stone-400 focus:border-blush-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blush-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Submit button — gradient, loading state
// ----------------------------------------------------------------------------
type SubmitButtonProps = {
  loading: boolean;
  children: React.ReactNode;
};

function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-l from-blush-500 to-lavender-500 py-3.5 text-base font-bold text-white shadow-lg shadow-blush-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blush-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
    >
      {loading ? (
        <>
          <SpinnerIcon className="h-5 w-5" />
          <span>جارٍ المعالجة…</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}

// ----------------------------------------------------------------------------
// Error banner
// ----------------------------------------------------------------------------
function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Inline link button (signup/login toggle)
// ----------------------------------------------------------------------------
function InlineLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-bold text-blush-600 underline-offset-2 transition-colors hover:text-blush-700 hover:underline"
    >
      {children}
    </button>
  );
}

// ============================================================================
// AuthPage component
// ============================================================================
export default function AuthPage() {
  const { navigate } = useRouter();

  // ---- Mode & sub-mode ----
  const [mode, setMode] = useState<Mode>('customer');
  const [customerMode, setCustomerMode] = useState<'login' | 'signup'>('login');

  // ---- Form state ----
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // ---- UI state ----
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // ---- Helpers ----
  const resetFields = () => {
    setName('');
    setPhone('');
    setPassword('');
    setAdminUsername('');
    setAdminPassword('');
    setError('');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  const switchCustomerMode = (m: 'login' | 'signup') => {
    setCustomerMode(m);
    setError('');
  };

  // ---- Submit: customer ----
  const handleCustomerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (customerMode === 'signup' && !name.trim()) {
      setError('يرجى إدخال الاسم.');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف.');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      if (customerMode === 'signup') {
        await signUpCustomer(name.trim(), phone.trim(), password);
      } else {
        await signInCustomer(phone.trim(), password);
      }
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Submit: admin ----
  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminUsername.trim()) {
      setError('يرجى إدخال اسم المستخدم.');
      return;
    }
    if (!adminPassword) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(adminUsername.trim(), adminPassword);
      navigate('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'بيانات الدخول غير صحيحة.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Render ----
  const isSignup = mode === 'customer' && customerMode === 'signup';

  return (
    <div dir="rtl" className="relative flex min-h-screen w-full items-center justify-center bg-beige-50 px-4 py-10 text-stone-800">
      <GlowOrbs />

      <div className="animate-fade-in-up w-full max-w-md">
        {/* ---------------------------------------------------------------- */}
        {/* Glass card                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-6 shadow-2xl shadow-blush-300/20 sm:p-8">
          {/* Brand */}
          <div className="mb-6 flex justify-center">
            <BrandLogo />
          </div>

          {/* Mode toggle */}
          <div className="mb-6">
            <ModeToggle mode={mode} onChange={switchMode} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} />
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Customer form                                                  */}
          {/* -------------------------------------------------------------- */}
          {mode === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4" noValidate>
              {isSignup && (
                <TextField
                  id="name"
                  label="الاسم الكامل"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="ادخل اسمك الكامل"
                  icon={UserIcon}
                  autoComplete="name"
                  disabled={loading}
                />
              )}

              <TextField
                id="phone"
                label="رقم الهاتف"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="05xxxxxxxx"
                icon={PhoneIcon}
                autoComplete="tel"
                dir="ltr"
                disabled={loading}
              />

              <TextField
                id="password"
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon={LockIcon}
                autoComplete={customerMode === 'login' ? 'current-password' : 'new-password'}
                disabled={loading}
              />

              <SubmitButton loading={loading}>
                {customerMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </SubmitButton>

              {/* Toggle login / signup */}
              <p className="pt-1 text-center text-sm text-stone-600">
                {customerMode === 'login' ? (
                  <>
                    ليس لديك حساب؟{' '}
                    <InlineLink onClick={() => switchCustomerMode('signup')}>
                      أنشئ حساباً جديداً
                    </InlineLink>
                  </>
                ) : (
                  <>
                    لديك حساب بالفعل؟{' '}
                    <InlineLink onClick={() => switchCustomerMode('login')}>
                      سجّل الدخول
                    </InlineLink>
                  </>
                )}
              </p>
            </form>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Admin form                                                     */}
          {/* -------------------------------------------------------------- */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4" noValidate>
              <TextField
                id="admin-username"
                label="اسم المستخدم"
                type="text"
                value={adminUsername}
                onChange={setAdminUsername}
                placeholder="ادخل اسم المستخدم"
                icon={UserIcon}
                autoComplete="username"
                disabled={loading}
              />

              <TextField
                id="admin-password"
                label="كلمة المرور"
                type="password"
                value={adminPassword}
                onChange={setAdminPassword}
                placeholder="••••••••"
                icon={LockIcon}
                autoComplete="current-password"
                disabled={loading}
              />

              <SubmitButton loading={loading}>دخول لوحة المشرف</SubmitButton>
            </form>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Back to home                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 rounded-full bg-white/60 px-5 py-2.5 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-blush-600"
          >
            <HomeIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
}

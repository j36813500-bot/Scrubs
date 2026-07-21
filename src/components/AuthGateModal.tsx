import { useState, useEffect } from 'react';
import { signInCustomer, signUpCustomer, onAuthChange, type AppUser } from '../lib/auth';

export default function AuthGateModal({
  open,
  onClose,
  onAuthenticated,
  title = 'سجّل الدخول للمتابعة',
  subtitle = 'يجب تسجيل الدخول أو إنشاء حساب لإتمام هذه العملية',
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (open && user) onAuthenticated();
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError('');
    if (!form.phone || !form.password || (isSignup && !form.name)) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true);
    try {
      const res = isSignup ? await signUpCustomer(form.name, form.phone, form.password) : await signInCustomer(form.phone, form.password);
      if (res.error) setError(res.error); else onAuthenticated();
    } catch { setError('حدث خطأ'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(20,10,30,0.7)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="relative glass-card rounded-3xl max-w-md w-full p-8 animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-blush-200/40 blur-3xl animate-breathe" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-lavender-200/40 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />
        <div className="relative z-10">
          <button onClick={onClose} className="absolute top-0 left-0 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-red-100 transition-colors">
            <svg className="w-4 h-4 text-beige-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow mb-3 animate-float-medium">
              <span className="text-white font-bold text-xl">س</span>
            </div>
            <h2 className="font-display font-bold text-xl text-beige-900">{title}</h2>
            <p className="text-sm text-beige-600 mt-1">{subtitle}</p>
          </div>
          <div className="space-y-3">
            {isSignup && (
              <div>
                <label className="block text-xs font-bold text-beige-700 mb-1">الاسم</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" className="input-premium text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">رقم الهاتف</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" className="input-premium text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-beige-700 mb-1">كلمة المرور</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-premium text-sm" dir="ltr" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="btn-premium w-full">{loading ? 'جارٍ...' : isSignup ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
            <button onClick={() => { setIsSignup(s => !s); setError(''); }} className="w-full text-sm text-beige-600 hover:text-blush-600 transition-colors text-center">{isSignup ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ أنشئ حساب جديد'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

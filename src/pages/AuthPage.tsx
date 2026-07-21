import { useState } from 'react';
import { useRouter } from '../lib/router';
import { signInCustomer, signUpCustomer, signInAdmin } from '../lib/auth';

export default function AuthPage() {
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '', username: '' });

  const handleCustomer = async () => {
    setError('');
    if (!form.phone || !form.password || (isSignup && !form.name)) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true);
    try {
      const res = isSignup ? await signUpCustomer(form.name, form.phone, form.password) : await signInCustomer(form.phone, form.password);
      if (res.error) setError(res.error); else navigate('/');
    } catch { setError('حدث خطأ'); }
    setLoading(false);
  };

  const handleAdmin = async () => {
    setError('');
    if (!form.username || !form.password) { setError('يرجى إدخال البيانات'); return; }
    setLoading(true);
    try {
      const res = await signInAdmin(form.username, form.password);
      if (res.error) setError(res.error); else navigate('/admin');
    } catch { setError('حدث خطأ'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blush-200/30 blur-3xl animate-breathe" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-lavender-200/30 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow mb-3 animate-float-medium">
            <span className="text-white font-bold text-2xl">س</span>
          </div>
          <h1 className="font-display font-black text-3xl premium-gradient-text">اسكربك</h1>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <div className="flex gap-2 mb-6 p-1 rounded-full bg-white/40">
            <button onClick={() => { setMode('customer'); setError(''); }} className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${mode === 'customer' ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'text-beige-600'}`}>حساب العميل</button>
            <button onClick={() => { setMode('admin'); setError(''); setIsSignup(false); }} className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${mode === 'admin' ? 'bg-gradient-to-r from-gold-400 to-blush-500 text-white shadow-glow' : 'text-beige-600'}`}>الإدارة</button>
          </div>

          {mode === 'customer' ? (
            <div className="space-y-3 animate-fade-in">
              {isSignup && (
                <div>
                  <label className="block text-sm font-bold text-beige-800 mb-1.5">الاسم</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" className="input-premium text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-beige-800 mb-1.5">رقم الهاتف</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" className="input-premium text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-beige-800 mb-1.5">كلمة المرور</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-premium text-sm" dir="ltr" />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={handleCustomer} disabled={loading} className="btn-premium w-full">{loading ? 'جارٍ...' : isSignup ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
              <button onClick={() => { setIsSignup(s => !s); setError(''); }} className="w-full text-sm text-beige-600 hover:text-blush-600 transition-colors text-center">{isSignup ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ أنشئ حساب جديد'}</button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-beige-800 mb-1.5">اسم المستخدم</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="admin" className="input-premium text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-beige-800 mb-1.5">كلمة المرور</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-premium text-sm" dir="ltr" />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={handleAdmin} disabled={loading} className="btn-premium w-full">{loading ? 'جارٍ...' : 'دخول'}</button>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/')} className="w-full text-center text-sm text-beige-500 hover:text-blush-600 mt-4 transition-colors">العودة للرئيسية</button>
      </div>
    </div>
  );
}

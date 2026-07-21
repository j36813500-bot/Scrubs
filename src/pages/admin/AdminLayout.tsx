import { type ReactNode, useEffect, useState } from 'react';
import { useRouter } from '../../lib/router';
import { onAuthChange, signOut, isAdmin, type AppUser } from '../../lib/auth';

const NAV = [
  { label: 'الطلبات', to: '/admin', icon: 'orders' },
  { label: 'المبيعات', to: '/admin/sales', icon: 'sales' },
  { label: 'المنتجات', to: '/admin/products', icon: 'products' },
  { label: 'التقييمات', to: '/admin/feedback', icon: 'feedback' },
  { label: 'الرئيسية', to: '/', icon: 'home' },
  { label: 'المتجر', to: '/store', icon: 'store' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { path, navigate } = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u);
      setChecked(true);
    });
    return unsub;
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-blush-200 border-t-blush-500 animate-spin mb-3" />
          <p className="text-beige-600 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-300 to-red-500 flex items-center justify-center mb-4 shadow-glow">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h2 className="font-display font-bold text-xl text-beige-900 mb-2">دخول مقيّد</h2>
          <p className="text-beige-600 mb-4">هذه الصفحة مخصصة للمديرين فقط</p>
          <button onClick={() => navigate('/auth')} className="btn-premium">تسجيل دخول الإدارة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* sidebar */}
      <aside className="w-64 fixed top-0 right-0 bottom-0 glass-card rounded-none border-l border-white/40 p-5 hidden lg:flex flex-col z-40">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl">س</span>
          </div>
          <div>
            <div className="font-display font-bold text-lg premium-gradient-text">اسكربك</div>
            <div className="text-xs text-beige-500">لوحة الإدارة</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(item => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                path === item.to
                  ? 'bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-900 shadow-glow'
                  : 'text-beige-700 hover:bg-white/50'
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-white/40">
          <div className="px-4 py-2 mb-2">
            <div className="text-xs text-beige-500">المدير</div>
            <div className="font-bold text-beige-900 text-sm">{user.admin_username || user.full_name || 'admin'}</div>
          </div>
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            خروج
          </button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass-card rounded-none border-b border-white/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">س</span>
          </div>
          <span className="font-display font-bold text-sm premium-gradient-text">لوحة الإدارة</span>
        </div>
        <button onClick={() => { signOut(); navigate('/'); }} className="text-red-500 text-sm font-bold">خروج</button>
      </div>

      {/* mobile nav */}
      <div className="lg:hidden fixed top-16 inset-x-0 z-30 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar glass-card rounded-none border-b border-white/40">
        {NAV.map(item => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              path === item.to ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white' : 'text-beige-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* content */}
      <main className="flex-1 lg:mr-64 pt-28 lg:pt-8 px-4 pb-12">
        {children}
      </main>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5';
  switch (name) {
    case 'orders': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    case 'sales': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case 'products': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>;
    case 'feedback': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
    case 'home': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>;
    case 'store': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 13h6"/></svg>;
    default: return null;
  }
}

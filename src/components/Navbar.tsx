import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCart } from '../lib/api';
import { onAuthChange, type AppUser } from '../lib/auth';
import SideNav from './SideNav';
import BottomNav from './BottomNav';

export default function Navbar() {
  const { path, navigate } = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [user, setUser] = useState<AppUser | null>(null);
  const [sideNavOpen, setSideNavOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cart = await fetchCart();
        setCartCount(cart.length);
      } catch { /* ignore */ }
    })();
  }, [path]);

  const go = (to: string) => { navigate(to); setSideNavOpen(false); };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4 hidden lg:block">
        <nav className="mx-auto max-w-7xl glass-card rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => go('/')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg">س</span>
            </div>
            <span className="font-display font-black text-lg premium-gradient-text">اسكربك</span>
          </button>

          {/* Desktop nav */}
          <div className="flex items-center gap-1">
            <NavLink to="/" label="الرئيسية" active={path === '/'} onClick={go} />
            <NavLink to="/store" label="المتجر" active={path === '/store'} onClick={go} />
            <NavLink to="/track" label="تتبع الطلب" active={path === '/track'} onClick={go} />
            <NavLink to="/faq" label="الأسئلة الشائعة" active={path === '/faq'} onClick={go} />
            <NavLink to="/support" label="الدعم" active={path === '/support'} onClick={go} />
            <NavLink to="/about" label="من نحن" active={path === '/about'} onClick={go} />
            <NavLink to="/contact" label="تواصل معنا" active={path === '/contact'} onClick={go} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => go('/favorites')} className="relative w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110">
              <svg className="w-5 h-5 text-blush-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {favCount > 0 && <span className="absolute -top-1 -left-1 bg-lavender-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{favCount}</span>}
            </button>
            <button onClick={() => go('/cart')} className="relative w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110">
              <svg className="w-5 h-5 text-lavender-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="absolute -top-1 -left-1 bg-blush-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => go(user ? '/profile' : '/auth')} className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <svg className="w-5 h-5 text-blush-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4 lg:hidden">
        <nav className="glass-card rounded-full px-4 py-3 flex items-center justify-between">
          <button onClick={() => go('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-base">س</span>
            </div>
            <span className="font-display font-black text-base premium-gradient-text">اسكربك</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => go('/cart')} className="relative w-9 h-9 rounded-full bg-white/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-lavender-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="absolute -top-1 -left-1 bg-blush-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => setSideNavOpen(true)} className="w-9 h-9 rounded-full bg-white/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-beige-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </nav>
      </header>

      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} activePath={path} onNavigate={go} isLoggedIn={!!user} />
      <BottomNav activePath={path} cartCount={cartCount} favCount={favCount} onNavigate={go} />
    </>
  );
}

function NavLink({ to, label, active, onClick }: { to: string; label: string; active: boolean; onClick: (to: string) => void }) {
  return (
    <button onClick={() => onClick(to)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${active ? 'bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-900' : 'text-beige-700 hover:bg-white/50'}`}>
      {label}
    </button>
  );
}

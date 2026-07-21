import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCart, fetchFavorites } from '../lib/api';
import { onAuthChange, type AppUser } from '../lib/auth';

const NAV = [
  { label: 'الرئيسية', to: '/' },
  { label: 'المتجر', to: '/store' },
  { label: 'من نحن', to: '/about' },
  { label: 'اتكلم معانا', to: '/support' },
  { label: 'تتبع الطلبات', to: '/track' },
  { label: 'الأسئلة الشائعة', to: '/faq' },
];

const FOOTER_NAV = [
  { label: 'سياسة الاستبدال والاسترجاع', to: '/returns' },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'الشروط والأحكام', to: '/terms' },
];

export default function Navbar() {
  const { path, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cart, favs] = await Promise.all([fetchCart(), fetchFavorites()]);
        if (!active) return;
        setCartCount(cart.length);
        setFavCount(favs.length);
      } catch { /* ignore on first load */ }
    })();
    return () => { active = false; };
  }, [path]);

  const go = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const allLinks = [...NAV, ...FOOTER_NAV];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4">
          <nav
            className={`glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${
              scrolled ? 'shadow-glass-lg' : 'shadow-glass'
            }`}
          >
            {/* Logo */}
            <button onClick={() => go('/')} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">س</span>
              </div>
              <span className="font-display font-bold text-lg sm:text-xl premium-gradient-text">اسكربك</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV.map(item => (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    path === item.to
                      ? 'bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-900 shadow-glass'
                      : 'text-beige-700 hover:bg-white/40 hover:text-blush-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => go('/favorites')}
                className="relative w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110"
                aria-label="المفضلة"
              >
                <HeartIcon className="w-5 h-5 text-blush-600" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-blush-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {favCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => go('/cart')}
                className="relative w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110"
                aria-label="السلة"
              >
                <CartIcon className="w-5 h-5 text-lavender-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-lavender-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => go(user ? '/profile' : '/auth')}
                className="relative w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-110"
                aria-label="حسابي"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-blush-600" />
                )}
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all"
                aria-label="القائمة"
              >
                <MenuIcon className="w-5 h-5 text-beige-700" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-beige-900/30 backdrop-blur-sm animate-fade-in" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] glass-card rounded-l-3xl rounded-r-none p-6 animate-fade-in-up overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display font-bold text-xl premium-gradient-text">القائمة</span>
              <button onClick={() => setMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {allLinks.map(item => (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  className={`w-full text-right px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    path === item.to
                      ? 'bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-900'
                      : 'hover:bg-white/50 text-beige-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => go(user ? '/profile' : '/auth')}
                className="w-full text-right px-4 py-3 rounded-2xl text-sm font-semibold transition-all bg-gradient-to-r from-gold-200 to-blush-200 text-blush-900"
              >
                {user ? 'حسابي' : 'تسجيل الدخول / الإدارة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

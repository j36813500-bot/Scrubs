import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCart, fetchFavorites } from '../lib/api';

type Item = {
  label: string;
  to: string;
  icon: (active: boolean) => React.ReactNode;
};

const ITEMS: Item[] = [
  {
    label: 'الرئيسية',
    to: '/',
    icon: (a) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    label: 'المتجر',
    to: '/store',
    icon: (a) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1-5h16l1 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 13h6" />
      </svg>
    ),
  },
  {
    label: 'السلة',
    to: '/cart',
    icon: (a) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    label: 'المفضلة',
    to: '/favorites',
    icon: (a) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'اتكلم معانا',
    to: '/support',
    icon: (a) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.5 8.5 0 0 1 4 11.5a8.38 8.38 0 0 1 9-8.5 8.38 8.38 0 0 1 8 8.5z" />
      </svg>
    ),
  },
];

export default function BottomDock() {
  const { path, navigate } = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cart, favs] = await Promise.all([fetchCart(), fetchFavorites()]);
        if (!active) return;
        setCartCount(cart.length);
        setFavCount(favs.length);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [path]);

  const go = (to: string) => {
    setPressed(to);
    setTimeout(() => setPressed(null), 600);
    navigate(to);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-3 px-3 pointer-events-none lg:hidden">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="relative">
          {/* glow under dock */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blush-300/30 via-lavender-300/30 to-gold-300/20 blur-xl animate-pulse-soft" />
          <nav className="relative glass rounded-full px-2 py-2 flex items-center justify-around shadow-glass-lg border border-white/60">
            {ITEMS.map((item) => {
              const active = path === item.to;
              const isCart = item.to === '/cart';
              const isFav = item.to === '/favorites';
              const count = isCart ? cartCount : isFav ? favCount : 0;
              return (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  className="relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-full transition-all duration-500 group"
                  aria-label={item.label}
                >
                  {/* active glow background */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(247,168,198,0.4), rgba(192,166,226,0.4))',
                      boxShadow: active ? '0 0 20px rgba(247,168,198,0.5)' : 'none',
                    }}
                  />
                  {/* light trail on press */}
                  {pressed === item.to && (
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)', animation: 'dockFlash 0.6s ease-out' }} />
                  )}
                  {/* icon */}
                  <div
                    className={`relative transition-all duration-500 ${
                      active ? 'text-blush-600 -translate-y-0.5 scale-110' : 'text-beige-600 group-hover:text-blush-500 group-hover:scale-105'
                    }`}
                    style={active ? { filter: 'drop-shadow(0 0 8px rgba(247,168,198,0.6))' } : undefined}
                  >
                    {item.icon(active)}
                  </div>
                  {/* label */}
                  <span
                    className={`relative text-[10px] font-bold transition-all duration-500 ${
                      active ? 'text-blush-700 opacity-100' : 'text-beige-500 opacity-70 group-hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                  {/* badge */}
                  {count > 0 && (
                    <span className="absolute top-0 right-1 bg-gradient-to-br from-blush-500 to-lavender-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-glow">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <style>{`
        @keyframes dockFlash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

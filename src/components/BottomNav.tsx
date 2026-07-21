import React from 'react';

/**
 * BottomNav — futuristic glass-morphism bottom navigation bar for a premium
 * Arabic (RTL) medical scrubs e-commerce platform. Fixed at the bottom of every
 * page on mobile devices (lg:hidden).
 */

export type NavItem = {
  key: string;
  label: string;
  path: string;
  badge?: 'cart' | 'fav';
  icon: React.ReactNode;
};

export type BottomNavProps = {
  /** Current route path, e.g. "/" or "/store". Used to highlight the active item. */
  activePath: string;
  /** Number of items in the cart (rendered as a badge on the cart icon). */
  cartCount: number;
  /** Number of favorite items (rendered as a badge on the favorites icon). */
  favCount: number;
  /** Navigation callback invoked with the target path on tap. */
  onNavigate: (path: string) => void;
};

/* -------------------------------------------------------------------------- */
/* Inline SVG icons (lucide-react style, stroke-based, 24x24 viewBox)          */
/* -------------------------------------------------------------------------- */

const HomeIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

const StoreIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M3 9v11h18V9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

const HeartIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s-7.5-4.6-10-9.2C.6 8.7 2.3 5 5.8 5c2 0 3.4 1.1 4.2 2.3C10.8 6.1 12.2 5 14.2 5 17.7 5 19.4 8.7 18 11.8 15.5 16.4 12 21 12 21Z" />
  </svg>
);

const CartIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3h2.2l2.1 12.5a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
  </svg>
);

const UserIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

const Badge: React.FC<{ count: number; tone: 'cart' | 'fav' }> = ({
  count,
  tone,
}) => {
  if (count <= 0) return null;
  const toneClasses =
    tone === 'cart'
      ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white'
      : 'bg-gradient-to-br from-gold-400 to-blush-400 text-white';
  return (
    <span
      className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-[18px] text-center shadow-md ring-2 ring-white/70 ${toneClasses}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Float keyframes (injected once so animate-float-medium works w/o config)   */
/* -------------------------------------------------------------------------- */

const FloatStyle: React.FC = () => (
  <>
    <style>{`
      @keyframes floatMedium {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(-3px); opacity: 0.7; }
      }
      .animate-float-medium { animation: floatMedium 2.4s ease-in-out infinite; }
    `}</style>
    {/* Shared gradient definition for active icons (stroke="url(#bottomNavGrad)") */}
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="bottomNavGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
    </svg>
  </>
);

/* -------------------------------------------------------------------------- */
/* BottomNav                                                                   */
/* -------------------------------------------------------------------------- */

const BottomNav: React.FC<BottomNavProps> = ({
  activePath,
  cartCount,
  favCount,
  onNavigate,
}) => {
  const items: NavItem[] = [
    { key: 'home', label: 'الرئيسية', path: '/', icon: <HomeIcon /> },
    { key: 'store', label: 'المتجر', path: '/store', icon: <StoreIcon /> },
    {
      key: 'favorites',
      label: 'المفضلة',
      path: '/favorites',
      badge: 'fav',
      icon: <HeartIcon />,
    },
    {
      key: 'cart',
      label: 'السلة',
      path: '/cart',
      badge: 'cart',
      icon: <CartIcon />,
    },
    { key: 'profile', label: 'حسابي', path: '/profile', icon: <UserIcon /> },
  ];

  const normalize = (p: string) => (p === '/' ? '/' : p.replace(/\/$/, ''));
  const current = normalize(activePath);

  return (
    <>
      <FloatStyle />
      <nav
        dir="rtl"
        aria-label="التنقل السفلي"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto max-w-md px-3 pb-2">
          <div className="relative flex items-stretch justify-around gap-1 rounded-t-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-2 pt-2.5 pb-2">
            {items.map((item) => {
              const isActive = normalize(item.path) === current;
              const badgeCount =
                item.badge === 'cart' ? cartCount : item.badge === 'fav' ? favCount : 0;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl transition-transform duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
                >
                  {/* Glowing dot above the active item */}
                  {isActive && (
                    <span
                      className="animate-float-medium absolute top-0.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon + badge. SVGs use stroke="currentColor", so the wrapper
                      span's text color drives the icon color for inactive items.
                      Active icons get a gradient stroke via a shared <linearGradient> def. */}
                  <span className={'relative inline-flex ' + (isActive ? '' : 'text-beige-400')}>
                    {React.cloneElement(item.icon as React.ReactElement<{ stroke?: string }>, {
                      stroke: isActive ? 'url(#bottomNavGrad)' : 'currentColor',
                    })}
                    {item.badge && <Badge count={badgeCount} tone={item.badge} />}
                  </span>

                  {/* Label */}
                  <span
                    className={
                      'text-[11px] font-medium leading-none ' +
                      (isActive ? 'text-blush-600' : 'text-beige-400')
                    }
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

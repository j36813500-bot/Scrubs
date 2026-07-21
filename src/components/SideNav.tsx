import { useEffect, useState } from 'react';

// ============================================================================
// SideNav — Premium RTL slide-in navigation drawer
// Luxury Arabic medical scrubs e-commerce platform
// Palette: blush (pink) · lavender (purple) · beige (neutral)
// ============================================================================

export interface SideNavProps {
  open: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

// ----------------------------------------------------------------------------
// Navigation model
// ----------------------------------------------------------------------------
type NavItem = {
  label: string;
  path: string;
  icon: (props: { className?: string }) => JSX.Element;
  authOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', path: '/', icon: HomeIcon },
  { label: 'المتجر', path: '/store', icon: ShoppingBagIcon },
  { label: 'تتبع الطلب', path: '/track', icon: TruckIcon },
  { label: 'الأسئلة الشائعة', path: '/faq', icon: HelpCircleIcon },
  { label: 'الدعم والمحادثة', path: '/support', icon: MessageIcon },
  { label: 'من نحن', path: '/about', icon: InfoIcon },
  { label: 'تواصل معنا', path: '/contact', icon: MailIcon },
  { label: 'تسجيل الدخول', path: '/auth', icon: UserIcon, authOnly: true },
];

// ----------------------------------------------------------------------------
// Social links (small circular icons at the bottom)
// ----------------------------------------------------------------------------
type Social = { label: string; href: string; icon: (props: { className?: string }) => JSX.Element };

const SOCIAL_LINKS: Social[] = [
  { label: 'إنستغرام', href: '#', icon: InstagramIcon },
  { label: 'تويتر', href: '#', icon: TwitterIcon },
  { label: 'سناب شات', href: '#', icon: SnapchatIcon },
  { label: 'تيك توك', href: '#', icon: TiktokIcon },
];

// ============================================================================
// Component
// ============================================================================
export default function SideNav({ open, onClose, activePath, onNavigate, isLoggedIn }: SideNavProps) {
  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.authOnly || !isLoggedIn);

  return (
    <>
      {/* ---------------- Overlay ---------------- */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-300',
          open ? 'opacity-100 animate-fade-in' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ---------------- Drawer ---------------- */}
      <aside
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الجانبية"
        className={[
          'fixed top-0 right-0 z-50 h-full w-[320px] max-w-[85vw]',
          'flex flex-col',
          'bg-white/40 backdrop-blur-xl border border-white/50',
          'rounded-l-3xl shadow-2xl shadow-black/20',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0 animate-scale-in' : 'translate-x-full',
        ].join(' ')}
      >
        {/* ---------- Header: brand + close ---------- */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full shadow-md"
              style={{
                background: 'linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 100%)',
              }}
            >
              <span className="text-2xl font-bold text-white drop-shadow-sm">س</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: '#9d174d' }}
              >
                اسكربك
              </span>
              <span className="text-[11px] font-medium text-stone-500">
                ملابس طبية فاخرة
              </span>
            </div>
          </div>

          {/* Close button (top-left in RTL = visually on the left) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-stone-600 transition hover:bg-white/80 hover:text-stone-900 active:scale-95"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-l from-transparent via-white/70 to-transparent" />

        {/* ---------- Navigation links ---------- */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col gap-1.5">
            {visibleItems.map((item) => {
              const active = activePath === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={[
                      'group flex w-full items-center gap-3 rounded-2xl px-4 py-3',
                      'text-right transition-all duration-200 active:scale-[0.98]',
                      active
                        ? 'bg-gradient-to-l from-blush-200 to-lavender-200 text-blush-900 shadow-sm'
                        : 'text-stone-700 hover:bg-white/50',
                    ].join(' ')}
                    style={
                      active
                        ? {
                            background:
                              'linear-gradient(270deg, #fbcfe8 0%, #ddd6fe 100%)',
                            color: '#9d174d',
                          }
                        : undefined
                    }
                  >
                    {/* Icon on the right (RTL) */}
                    <span
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        active
                          ? 'bg-white/60 text-blush-900'
                          : 'bg-white/40 text-stone-500 group-hover:text-stone-800',
                      ].join(' ')}
                      style={active ? { color: '#9d174d' } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 text-[15px] font-semibold">
                      {item.label}
                    </span>
                    {/* Active indicator chevron on the left edge */}
                    {active && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: '#9d174d' }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------- Footer: social links ---------- */}
        <div className="px-6 pb-6 pt-2">
          <div className="mb-3 h-px bg-gradient-to-l from-transparent via-white/70 to-transparent" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-stone-500">تابعنا على</p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 text-stone-600 transition hover:scale-110 hover:bg-white/80 hover:text-stone-900 active:scale-95"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
          <p
            className="mt-4 text-center text-[11px] text-stone-400"
            dir="rtl"
          >
            © {new Date().getFullYear()} اسكربك — جميع الحقوق محفوظة
          </p>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Inline SVG icons (no external imports)
// ============================================================================

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function ShoppingBagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function TruckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function HelpCircleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MessageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function InfoIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 3H21l-6.5 7.4L22 21h-6.2l-4.9-6.4L5 21H3l7-8L2.5 3H8.8l4.4 5.8L18.9 3zm-1.1 16h1.2L7.3 4.2H6l11.8 14.8z" />
    </svg>
  );
}

function SnapchatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c2.6 0 4.7 2 4.8 4.6 0 .8 0 1.5-.1 2.1.4.2.9.3 1.4.1.6-.2 1.2.4 1 1-.2.7-.9 1.2-1.6 1.5-.2.7.6 1.6 2.1 2.6.6.4.4 1.2-.3 1.4-.5.2-1.2.3-1.4.7-.2.4 0 .9-.5 1-.5.1-1.1-.2-1.7-.1-.5.1-1 .6-1.7.7-1 .1-1.7-.6-2.7-.6s-1.7.7-2.7.6c-.7-.1-1.2-.6-1.7-.7-.6-.1-1.2.2-1.7.1-.5-.1-.3-.6-.5-1-.2-.4-.9-.5-1.4-.7-.7-.2-.9-1-.3-1.4 1.5-1 2.3-1.9 2.1-2.6-.7-.3-1.4-.8-1.6-1.5-.2-.6.4-1.2 1-1 .5.2 1 .1 1.4-.1-.1-.6-.1-1.3-.1-2.1C7.3 4 9.4 2 12 2z" />
    </svg>
  );
}

function TiktokIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 2c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.2.1-2.4-.2-3.5-.8v6.6c0 3.4-2.5 5.7-5.7 5.7-3.1 0-5.5-2.4-5.5-5.5 0-3.2 2.6-5.6 5.9-5.4v2.7c-.4-.1-.8-.2-1.2-.2-1.5 0-2.7 1.2-2.7 2.7 0 1.5 1.2 2.7 2.7 2.7 1.6 0 2.8-1.2 2.8-2.9V2h2.7z" />
    </svg>
  );
}

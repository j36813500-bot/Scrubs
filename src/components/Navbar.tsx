import { useEffect, useState } from 'react'
import { useRouter } from '../lib/router'
import SideNav from './SideNav'
import BottomNav from './BottomNav'

interface NavbarProps {
  cartCount?: number
  favoritesCount?: number
}

const navLinks = [
  { label: 'الرئيسية', path: '/' },
  { label: 'المتجر', path: '/store' },
  { label: 'من نحن', path: '/about' },
  { label: 'تواصل معنا', path: '/contact' },
  { label: 'الأسئلة الشائعة', path: '/faq' },
  { label: 'تتبع الطلب', path: '/track' },
]

export default function Navbar({ cartCount = 0, favoritesCount = 0 }: NavbarProps) {
  const { path, navigate } = useRouter()
  const [sideOpen, setSideOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (p: string) =>
    p === '/' ? path === '/' : path.startsWith(p)

  return (
    <>
      {/* Desktop navbar */}
      <header
        className={`fixed top-0 inset-x-0 z-40 hidden lg:block transition-all duration-300 ${
          scrolled ? 'glass shadow-premium' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full glass shadow-premium">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#navGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="navGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#e85c8a" />
                    <stop offset="50%" stopColor="#916dba" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold premium-gradient-text">اسكربك</span>
          </button>

          {/* Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-blush-600'
                    : 'text-gray-600 hover:text-blush-600'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-blush-500 to-lavender-500" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="btn-ghost flex items-center gap-1.5 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              الإدارة
            </button>

            <button
              onClick={() => navigate('/favorites')}
              className="relative rounded-full glass p-2.5 text-lavender-600 transition-all hover:shadow-premium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blush-600 px-1 text-[10px] font-extrabold text-white">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="relative rounded-full glass p-2.5 text-blush-600 transition-all hover:shadow-premium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blush-600 px-1 text-[10px] font-extrabold text-white shadow-glow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header
        className={`fixed top-0 inset-x-0 z-40 lg:hidden transition-all duration-300 ${
          scrolled ? 'glass shadow-premium' : 'glass border-b border-white/30'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSideOpen(true)}
            aria-label="القائمة"
            className="rounded-full glass p-2.5 text-blush-600"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full glass">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#navGrad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="navGrad2" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#e85c8a" />
                    <stop offset="50%" stopColor="#916dba" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-xl font-extrabold premium-gradient-text">اسكربك</span>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="relative rounded-full glass p-2.5 text-blush-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blush-600 px-1 text-[10px] font-extrabold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <SideNav open={sideOpen} onClose={() => setSideOpen(false)} />
      <BottomNav cartCount={cartCount} favoritesCount={favoritesCount} />
    </>
  )
}

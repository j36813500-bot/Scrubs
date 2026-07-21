import { useEffect, useState } from 'react'
import { useRouter } from '../lib/router'
import { fetchSocialLinks } from '../lib/api'
import type { SocialLink } from '../lib/types'

interface SideNavProps {
  open: boolean
  onClose: () => void
}

const navLinks = [
  { label: 'الرئيسية', path: '/', icon: 'home' },
  { label: 'المتجر', path: '/store', icon: 'store' },
  { label: 'المفضلة', path: '/favorites', icon: 'heart' },
  { label: 'من نحن', path: '/about', icon: 'info' },
  { label: 'تواصل معنا', path: '/contact', icon: 'mail' },
  { label: 'الأسئلة الشائعة', path: '/faq', icon: 'help' },
  { label: 'تتبع الطلب', path: '/track', icon: 'truck' },
  { label: 'حسابي', path: '/profile', icon: 'user' },
]

function NavIcon({ name }: { name: string }) {
  const p = {
    width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'home':
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
    case 'store':
      return <svg {...p}><path d="M3 9h18l-1 12H4z" /><path d="M8 9V5a4 4 0 0 1 8 0v4" /></svg>
    case 'heart':
      return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    case 'info':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
    case 'mail':
      return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 5L2 7" /></svg>
    case 'help':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
    case 'truck':
      return <svg {...p}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
    case 'user':
      return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    default:
      return null
  }
}

function SocialIcon({ platform }: { platform: string }) {
  const p = {
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor',
  }
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <svg {...p}><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
    case 'instagram':
      return <svg {...p}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
    case 'twitter':
    case 'x':
      return <svg {...p}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    case 'whatsapp':
      return <svg {...p}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
    case 'tiktok':
      return <svg {...p}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.14-5.91 3.18-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.06 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.71.53-1.19 1.36-1.26 2.24-.06.82.13 1.64.57 2.31.55.86 1.52 1.43 2.54 1.4.86.02 1.69-.37 2.26-1 .62-.66.91-1.58.9-2.49.01-3.37-.01-6.74.01-10.11.08-1.42.55-2.79 1.38-3.94 1.35-1.9 3.66-3.12 6.02-3.18z" /></svg>
    case 'youtube':
      return <svg {...p}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    case 'snapchat':
      return <svg {...p}><path d="M12.206.793c.99 0 4.347.276 5.93 3.821 1.032 2.31.393 5.674.587 6.054.094.182.5.35.97.55 1.39.47 3.08 1.05 3.16 2.4.11 1.91-2.2 2.71-2.62 2.71-.42 0-1.18.13-1.68.78-.45.58-.45 1.31-.45 1.31-1.04-.31-2.36-.49-3.83.49-1.47.98-2.71.98-3.75.98s-2.28 0-3.75-.98c-1.47-.98-2.79-.8-3.83-.49 0 0 0-.73-.45-1.31-.5-.65-1.26-.78-1.68-.78-.42 0-2.73-.8-2.62-2.71.08-1.35 1.77-1.93 3.16-2.4.47-.2.876-.368.97-.55.194-.38-.445-3.744.587-6.054C7.86 1.07 11.216.793 12.206.793z" /></svg>
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
  }
}

export default function SideNav({ open, onClose }: SideNavProps) {
  const { path, navigate } = useRouter()
  const [socials, setSocials] = useState<SocialLink[]>([])

  useEffect(() => {
    fetchSocialLinks().then(setSocials).catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const go = (p: string) => {
    navigate(p)
    onClose()
  }

  const isActive = (p: string) =>
    p === '/' ? path === '/' : path.startsWith(p)

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transition-transform duration-500 ease-out lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="glass-card flex h-full flex-col rounded-none border-l border-white/40 shadow-glow">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/30 p-5">
            <button onClick={() => go('/')} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#sideGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="sideGrad" x1="0" y1="0" x2="24" y2="24">
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
              onClick={onClose}
              aria-label="إغلاق"
              className="rounded-full glass p-2 text-gray-600 hover:text-blush-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto no-scrollbar p-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                    isActive(link.path)
                      ? 'glass shadow-premium text-blush-600'
                      : 'text-gray-600 hover:bg-white/40 hover:text-blush-600'
                  }`}
                >
                  <span className={isActive(link.path) ? 'text-blush-600' : 'text-lavender-500'}>
                    <NavIcon name={link.icon} />
                  </span>
                  {link.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => go('/admin')}
              className="btn-ghost mt-4 flex w-full items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              لوحة الإدارة
            </button>
          </nav>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="border-t border-white/30 p-5">
              <p className="mb-3 text-xs font-bold text-gray-500">تابعنا على</p>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label_ar}
                    className="flex h-10 w-10 items-center justify-center rounded-full glass text-gray-600 transition-all hover:scale-110 hover:shadow-glow"
                    style={s.color_hex ? { color: s.color_hex } : undefined}
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

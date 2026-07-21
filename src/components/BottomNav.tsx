import { useRouter } from '../lib/router'

interface BottomNavProps {
  cartCount?: number
  favoritesCount?: number
}

interface NavItem {
  key: string
  label: string
  path: string
  badgeKey?: 'cart' | 'favorites'
  icon: (active: boolean) => JSX.Element
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const navItems: NavItem[] = [
  {
    key: 'home',
    label: 'الرئيسية',
    path: '/',
    icon: (active) => (
      <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    key: 'store',
    label: 'المتجر',
    path: '/store',
    icon: (active) => (
      <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
        <path d="M3 9h18l-1 12H4z" />
        <path d="M8 9V5a4 4 0 0 1 8 0v4" />
      </svg>
    ),
  },
  {
    key: 'favorites',
    label: 'المفضلة',
    path: '/favorites',
    badgeKey: 'favorites',
    icon: (active) => (
      <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: 'cart',
    label: 'السلة',
    path: '/cart',
    badgeKey: 'cart',
    icon: (active) => (
      <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'حسابي',
    path: '/profile',
    icon: (active) => (
      <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav({ cartCount = 0, favoritesCount = 0 }: BottomNavProps) {
  const { path, navigate } = useRouter()

  const badges: Record<string, number> = {
    cart: cartCount,
    favorites: favoritesCount,
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="glass border-t border-white/40 shadow-premium">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const active =
              item.path === '/'
                ? path === '/'
                : path.startsWith(item.path)
            const badge = item.badgeKey ? badges[item.badgeKey] : 0

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="relative flex flex-1 flex-col items-center gap-1 py-2 transition-all duration-300"
              >
                <div className="relative">
                  <span
                    className={`transition-colors duration-300 ${
                      active ? 'text-blush-600' : 'text-gray-500'
                    }`}
                  >
                    {item.icon(active)}
                  </span>
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -left-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blush-600 px-1 text-[10px] font-extrabold text-white shadow-glow">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold transition-colors duration-300 ${
                    active ? 'text-blush-600' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-8 rounded-full bg-gradient-to-r from-blush-500 to-lavender-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

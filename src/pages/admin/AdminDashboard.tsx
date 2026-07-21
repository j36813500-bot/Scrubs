import { useEffect, useState } from 'react'
import { useRouter } from '../../lib/router'
import { fetchOrders, fetchAllProfiles } from '../../lib/api'
import type { Order } from '../../lib/types'
import StatCard from '../../components/StatCard'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
    path: '/admin',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'الطلبات',
    path: '/admin/orders',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: 'المبيعات',
    path: '/admin/sales',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'المنتجات',
    path: '/admin/products',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4 8 4 8-4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </svg>
    ),
  },
  {
    label: 'العملاء',
    path: '/admin/customers',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'الإعدادات',
    path: '/admin/settings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: 'الأسئلة الشائعة',
    path: '/admin/faqs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: 'روابط التواصل',
    path: '/admin/social',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: 'المحادثات',
    path: '/admin/chat',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  preparing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#916dba',
  processing: '#916dba',
  preparing: '#916dba',
  shipped: '#3b82f6',
  out_for_delivery: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

export default function AdminDashboard(): JSX.Element {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [customerCount, setCustomerCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchOrders(), fetchAllProfiles()])
      .then(([o, profiles]) => {
        if (!mounted) return
        setOrders(o)
        setCustomerCount(profiles.length)
      })
      .catch((err: unknown) => {
        console.error('Failed to load dashboard data:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const totalOrders: number = orders.length
  const totalSales: number = orders
    .filter((o) => o.status === 'delivered' || o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const recentOrders: Order[] = orders.slice(0, 8)

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const isActive = (path: string): boolean => {
    if (path === '/admin') return router.path === '/admin'
    return router.path.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 glass rounded-2xl p-3 shadow-premium md:hidden"
        aria-label="القائمة"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="2" strokeLinecap="round">
          {sidebarOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`glass fixed top-0 right-0 z-40 h-screen w-72 transform overflow-y-auto no-scrollbar p-6 transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } md:sticky md:top-0 md:h-screen`}
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full glass shadow-glow animate-float-medium">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#dashGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#e85c8a" />
                    <stop offset="50%" stopColor="#916dba" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold premium-gradient-text">اسكربك</h1>
            <p className="text-xs font-bold text-gray-500">لوحة التحكم</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'btn-premium shadow-glow'
                    : 'glass text-gray-600 hover:shadow-premium'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Header */}
          <div className="mb-8 text-center md:text-right">
            <h2 className="text-3xl font-extrabold premium-gradient-text">مرحبًا بك في لوحة التحكم</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">نظرة عامة على أداء متجر اسكربك</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                  title="إجمالي عدد العملاء"
                  value={customerCount}
                  color="#916dba"
                  onClick={() => router.navigate('/admin/customers')}
                  icon={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />
                <StatCard
                  title="إجمالي الطلبات"
                  value={totalOrders}
                  color="#e85c8a"
                  onClick={() => router.navigate('/admin/orders')}
                  icon={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  }
                />
                <StatCard
                  title="إجمالي المبيعات"
                  value={`${totalSales} ج.م`}
                  color="#f59e0b"
                  onClick={() => router.navigate('/admin/sales')}
                  icon={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  }
                />
              </div>

              {/* Recent orders */}
              <div className="glass-card p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-gray-800">أحدث الطلبات</h3>
                  <button
                    onClick={() => router.navigate('/admin/orders')}
                    className="btn-ghost text-sm"
                  >
                    عرض الكل
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500">لا توجد طلبات بعد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-blush-100 text-xs font-bold text-gray-500">
                          <th className="pb-3 pr-2">رقم الطلب</th>
                          <th className="pb-3 pr-2">العميل</th>
                          <th className="pb-3 pr-2">الهاتف</th>
                          <th className="pb-3 pr-2">الإجمالي</th>
                          <th className="pb-3 pr-2">التاريخ</th>
                          <th className="pb-3 pr-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, i) => {
                          const color = statusColors[order.status] || '#916dba'
                          return (
                            <tr
                              key={order.id}
                              className="border-b border-blush-50 transition-colors hover:bg-blush-50/40 animate-fade-in-up"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            >
                              <td className="py-3 pr-2 text-sm font-bold text-gray-700">
                                {order.order_number}
                              </td>
                              <td className="py-3 pr-2 text-sm font-bold text-gray-700">
                                {order.customer_name}
                              </td>
                              <td className="py-3 pr-2 text-sm text-gray-600" dir="ltr">
                                {order.customer_phone}
                              </td>
                              <td className="py-3 pr-2 text-sm font-extrabold premium-gradient-text">
                                {order.total_amount} ج.م
                              </td>
                              <td className="py-3 pr-2 text-sm text-gray-500">
                                {formatDate(order.created_at)}
                              </td>
                              <td className="py-3 pr-2">
                                <span
                                  className="rounded-full px-3 py-1 text-xs font-bold"
                                  style={{ background: `${color}22`, color }}
                                >
                                  {statusLabels[order.status] || order.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

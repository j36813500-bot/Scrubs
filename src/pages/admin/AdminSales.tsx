import { useEffect, useState, useMemo } from 'react'
import { fetchOrders } from '../../lib/api'
import type { Order } from '../../lib/types'
import StatCard from '../../components/StatCard'

interface MonthData {
  label: string
  revenue: number
  orders: number
}

const monthNames: string[] = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

export default function AdminSales(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    fetchOrders()
      .then((data) => {
        if (mounted) setOrders(data)
      })
      .catch((err: unknown) => {
        console.error('Failed to load sales data:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const completedOrders: Order[] = useMemo(
    () => orders.filter((o) => o.status === 'delivered' || o.status === 'completed'),
    [orders]
  )

  const totalRevenue: number = useMemo(
    () => completedOrders.reduce((sum, o) => sum + o.total_amount, 0),
    [completedOrders]
  )

  const averageOrderValue: number = useMemo(
    () => (completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0),
    [completedOrders, totalRevenue]
  )

  const shipmentIncome: number = useMemo(
    () => completedOrders.length * 50, // estimated shipment fee per order
    [completedOrders]
  )

  const monthlyData: MonthData[] = useMemo(() => {
    const now = new Date()
    const buckets: Record<string, { revenue: number; orders: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      buckets[key] = { revenue: 0, orders: 0 }
    }
    completedOrders.forEach((o) => {
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (buckets[key]) {
        buckets[key].revenue += o.total_amount
        buckets[key].orders += 1
      }
    })
    return Object.entries(buckets).map(([key, val]) => {
      const [, monthIdx] = key.split('-').map(Number)
      return { label: monthNames[monthIdx] || '', revenue: val.revenue, orders: val.orders }
    })
  }, [completedOrders])

  const maxRevenue: number = Math.max(...monthlyData.map((m) => m.revenue), 1)

  const formatCurrency = (amount: number): string =>
    `${amount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م`

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'قيد التجهيز',
    preparing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    out_for_delivery: 'قيد التوصيل',
    delivered: 'تم التسليم',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold premium-gradient-text">تحليلات المبيعات</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">تقارير الإيرادات والمبيعات المكتملة</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <>
            {/* Revenue stat cards */}
            <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="إجمالي الإيرادات"
                value={formatCurrency(totalRevenue)}
                color="#22c55e"
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
              <StatCard
                title="متوسط قيمة الطلب"
                value={formatCurrency(averageOrderValue)}
                color="#916dba"
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 12l4-4 4 4 5-5" />
                  </svg>
                }
              />
              <StatCard
                title="دخل الشحنات"
                value={formatCurrency(shipmentIncome)}
                color="#3b82f6"
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                }
              />
            </div>

            {/* Monthly revenue chart */}
            <div className="glass-card mb-10 p-6 md:p-8">
              <h2 className="mb-6 text-xl font-extrabold text-gray-800">الإيرادات الشهرية</h2>
              <div className="flex items-end justify-between gap-3" style={{ height: '260px' }}>
                {monthlyData.map((m, i) => {
                  const heightPct = (m.revenue / maxRevenue) * 100
                  return (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-bold text-gray-600">
                        {m.revenue > 0 ? m.revenue.toLocaleString('ar-EG') : '—'}
                      </span>
                      <div
                        className="w-full max-w-[60px] rounded-t-2xl transition-all duration-700 animate-fade-in-up"
                        style={{
                          height: `${Math.max(heightPct, 2)}%`,
                          background: 'linear-gradient(180deg, #e85c8a 0%, #916dba 100%)',
                          boxShadow: '0 0 20px rgba(232,92,138,0.3)',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                      <span className="text-xs font-bold text-gray-500">{m.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Orders count line chart */}
            <div className="glass-card mb-10 p-6 md:p-8">
              <h2 className="mb-6 text-xl font-extrabold text-gray-800">عدد الطلبات الشهرية</h2>
              <div className="relative" style={{ height: '180px' }}>
                <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 180">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e85c8a" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e85c8a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {monthlyData.length > 0 && (
                    <>
                      <polyline
                        points={monthlyData
                          .map((m, i) => {
                            const maxOrders = Math.max(...monthlyData.map((d) => d.orders), 1)
                            const x = (i / (monthlyData.length - 1)) * 600
                            const y = 170 - (m.orders / maxOrders) * 140
                            return `${x},${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#916dba"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points={`0,180 ${monthlyData
                          .map((m, i) => {
                            const maxOrders = Math.max(...monthlyData.map((d) => d.orders), 1)
                            const x = (i / (monthlyData.length - 1)) * 600
                            const y = 170 - (m.orders / maxOrders) * 140
                            return `${x},${y}`
                          })
                          .join(' ')} 600,180`}
                        fill="url(#lineGrad)"
                      />
                      {monthlyData.map((m, i) => {
                        const maxOrders = Math.max(...monthlyData.map((d) => d.orders), 1)
                        const x = (i / (monthlyData.length - 1)) * 600
                        const y = 170 - (m.orders / maxOrders) * 140
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#e85c8a"
                            stroke="#fff"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </>
                  )}
                </svg>
                <div className="mt-2 flex justify-between px-2">
                  {monthlyData.map((m, i) => (
                    <span key={i} className="text-xs font-bold text-gray-500">
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed sales table */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="mb-6 text-xl font-extrabold text-gray-800">المبيعات المكتملة</h2>
              {completedOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-500">لا توجد مبيعات مكتملة بعد</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-blush-100 text-xs font-bold text-gray-500">
                        <th className="pb-3 pr-2">رقم الطلب</th>
                        <th className="pb-3 pr-2">العميل</th>
                        <th className="pb-3 pr-2">المدينة</th>
                        <th className="pb-3 pr-2">الإجمالي</th>
                        <th className="pb-3 pr-2">التاريخ</th>
                        <th className="pb-3 pr-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrders.map((order, i) => (
                        <tr
                          key={order.id}
                          className="border-b border-blush-50 transition-colors hover:bg-blush-50/40 animate-fade-in-up"
                          style={{ animationDelay: `${i * 0.03}s` }}
                        >
                          <td className="py-3 pr-2 text-sm font-bold text-gray-700">
                            {order.order_number}
                          </td>
                          <td className="py-3 pr-2 text-sm font-bold text-gray-700">
                            {order.customer_name}
                          </td>
                          <td className="py-3 pr-2 text-sm text-gray-600">
                            {order.city_ar}
                          </td>
                          <td className="py-3 pr-2 text-sm font-extrabold premium-gradient-text">
                            {order.total_amount} ج.م
                          </td>
                          <td className="py-3 pr-2 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3 pr-2">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

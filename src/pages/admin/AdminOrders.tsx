import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { fetchOrders, fetchOrderItems, updateOrderStatus } from '../../lib/api'
import type { Order, OrderItem } from '../../lib/types'
import StatCard from '../../components/StatCard'
import OrderModal from '../../components/OrderModal'

interface CategorySection {
  title: string
  statuses: string[]
  color: string
  icon: React.ReactNode
}

const categorySections: CategorySection[] = [
  {
    title: 'تم تأكيد الطلب',
    statuses: ['confirmed'],
    color: '#916dba',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'جاري التجهيز',
    statuses: ['preparing', 'processing'],
    color: '#a78bfa',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: 'تم الشحن',
    statuses: ['shipped'],
    color: '#3b82f6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'قيد التوصيل',
    statuses: ['out_for_delivery'],
    color: '#6366f1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'تم التسليم',
    statuses: ['delivered', 'completed'],
    color: '#22c55e',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'الطلبات القادمة',
    statuses: ['pending'],
    color: '#f59e0b',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'الطلبات التي سيتم شحنها قريبًا',
    statuses: ['confirmed', 'preparing', 'processing'],
    color: '#e85c8a',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
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
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export default function AdminOrders(): JSX.Element {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await fetchOrders()
      setOrders(data)
    } catch (err: unknown) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const openOrder = useCallback(async (order: Order): Promise<void> => {
    setSelectedOrder(order)
    setSelectedItems([])
    setModalLoading(true)
    try {
      const items = await fetchOrderItems(order.id)
      setSelectedItems(items)
    } catch (err: unknown) {
      console.error('Failed to load order items:', err)
    } finally {
      setModalLoading(false)
    }
  }, [])

  const closeModal = useCallback((): void => {
    setSelectedOrder(null)
    setSelectedItems([])
  }, [])

  const handleStatusUpdate = useCallback(
    async (orderId: string, status: string): Promise<void> => {
      setUpdatingId(orderId)
      try {
        await updateOrderStatus(orderId, status)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status } : null))
        }
      } catch (err: unknown) {
        console.error('Failed to update order status:', err)
      } finally {
        setUpdatingId(null)
      }
    },
    [selectedOrder]
  )

  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const totalCustomers = 0 // derived from profiles in dashboard; here we show stat for consistency
  const totalOrders: number = orders.length
  const totalSales: number = orders
    .filter((o) => o.status === 'delivered' || o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getOrdersByStatuses = (statuses: string[]): Order[] =>
    orders.filter((o) => statuses.includes(o.status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold premium-gradient-text">إدارة الطلبات</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">متابعة وإدارة جميع طلبات المتجر</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <>
            {/* Categorized sections */}
            <div className="space-y-10">
              {categorySections.map((section, sIdx) => {
                const sectionOrders = getOrdersByStatuses(section.statuses)
                return (
                  <section
                    key={section.title}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${sIdx * 0.05}s` }}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl glass shadow-premium"
                        style={{ color: section.color }}
                      >
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-gray-800">{section.title}</h2>
                        <p className="text-xs font-bold text-gray-500">
                          {sectionOrders.length} طلب
                        </p>
                      </div>
                    </div>

                    {sectionOrders.length === 0 ? (
                      <div className="glass-card p-6 text-center">
                        <p className="text-sm font-bold text-gray-400">لا توجد طلبات في هذا القسم</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sectionOrders.map((order, oIdx) => (
                          <div
                            key={`${section.title}-${order.id}`}
                            onClick={() => openOrder(order)}
                            className="glass-card group cursor-pointer p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
                            style={{ animationDelay: `${oIdx * 0.03}s` }}
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-gray-500">{order.order_number}</p>
                                <p className="mt-1 text-sm font-extrabold text-gray-800">
                                  {order.customer_name}
                                </p>
                              </div>
                              <span
                                className="rounded-full px-3 py-1 text-xs font-bold"
                                style={{
                                  background: `${section.color}22`,
                                  color: section.color,
                                }}
                              >
                                {statusLabels[order.status] || order.status}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-gray-600">
                              <p className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span dir="ltr">{order.customer_phone}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="4" width="22" height="16" rx="2" />
                                  <path d="M1 10h22" />
                                </svg>
                                {order.total_amount} ج.م
                              </p>
                              <p className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="4" width="18" height="18" rx="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {formatDate(order.created_at)}
                              </p>
                            </div>

                            {/* Quick action buttons */}
                            <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                  disabled={updatingId === order.id}
                                  className="btn-premium flex-1 text-xs"
                                >
                                  قبول الطلب
                                </button>
                              )}
                              {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'processing') && (
                                <button
                                  onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                  disabled={updatingId === order.id}
                                  className="btn-premium flex-1 text-xs"
                                >
                                  تم إرسال الشحنة
                                </button>
                              )}
                              {(order.status === 'shipped' || order.status === 'out_for_delivery') && (
                                <button
                                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  disabled={updatingId === order.id}
                                  className="btn-premium flex-1 text-xs"
                                >
                                  تم التسليم
                                </button>
                              )}
                              {updatingId === order.id && (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>

            {/* Bottom stat cards */}
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="إجمالي عدد العملاء"
                value={totalCustomers}
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
                onClick={scrollToTop}
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
          </>
        )}
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          items={selectedItems}
          onClose={closeModal}
        />
      )}

      {/* Modal loading overlay */}
      {selectedOrder && modalLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30">
          <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

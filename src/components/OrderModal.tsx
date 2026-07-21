import { useEffect } from 'react'
import type { Order, OrderItem } from '../lib/types'

interface OrderModalProps {
  order: Order
  items: OrderItem[]
  onClose: () => void
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#916dba',
  processing: '#916dba',
  shipped: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const paymentLabels: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  card: 'بطاقة ائتمان',
  transfer: 'تحويل بنكي',
  wallet: 'محفظة إلكترونية',
}

export default function OrderModal({ order, items, onClose }: OrderModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const statusLabel = statusLabels[order.status] || order.status
  const statusColor = statusColors[order.status] || '#916dba'
  const paymentLabel = paymentLabels[order.payment_method] || order.payment_method
  const orderDate = new Date(order.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="glass-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto no-scrollbar p-6 animate-scale-in shadow-glow md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full glass text-gray-600 transition-colors hover:text-blush-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full glass shadow-premium animate-float-medium">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#orderGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#e85c8a" />
                  <stop offset="50%" stopColor="#916dba" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold premium-gradient-text">تفاصيل الطلب</h2>
          <p className="mt-1 text-sm font-bold text-gray-500">{order.order_number}</p>
        </div>

        {/* Status badge */}
        <div className="mb-6 flex justify-center">
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold shadow-premium animate-glow"
            style={{ background: `${statusColor}22`, color: statusColor, boxShadow: `0 0 20px ${statusColor}33` }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full animate-breathe"
              style={{ background: statusColor }}
            />
            {statusLabel}
          </div>
        </div>

        {/* Customer info */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4 animate-fade-in-up">
            <p className="mb-1 text-xs font-bold text-gray-500">اسم العميل</p>
            <p className="text-sm font-bold text-gray-800">{order.customer_name}</p>
          </div>
          <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <p className="mb-1 text-xs font-bold text-gray-500">رقم الهاتف</p>
            <p className="text-sm font-bold text-gray-800" dir="ltr">{order.customer_phone}</p>
          </div>
          <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <p className="mb-1 text-xs font-bold text-gray-500">المدينة</p>
            <p className="text-sm font-bold text-gray-800">{order.city_ar}</p>
          </div>
          <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <p className="mb-1 text-xs font-bold text-gray-500">تاريخ الطلب</p>
            <p className="text-sm font-bold text-gray-800">{orderDate}</p>
          </div>
        </div>

        {/* Shipping address */}
        <div className="mb-6 glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-1 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-xs font-bold text-gray-500">عنوان الشحن</p>
          </div>
          <p className="text-sm font-bold text-gray-800">{order.shipping_address_ar}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-extrabold text-gray-800">المنتجات المطلوبة</h3>
          <div className="space-y-3">
            {items.length === 0 && (
              <p className="rounded-2xl glass p-4 text-center text-sm text-gray-500">لا توجد منتجات</p>
            )}
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 glass rounded-2xl p-3 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + i * 0.05}s` }}
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blush-50 to-lavender-50">
                  {item.product_id ? (
                    <img
                      src={`https://placeholder.com/${item.product_id}.png`}
                      alt={item.product_name_ar}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget.style.display = 'none') }}
                    />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-gray-800">{item.product_name_ar}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                    {item.color_name_ar && <span>اللون: {item.color_name_ar}</span>}
                    {item.size_label && <span>المقاس: {item.size_label}</span>}
                    <span>الكمية: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold premium-gradient-text">
                    {item.unit_price * item.quantity} <span className="text-xs">ج.م</span>
                  </p>
                  <p className="text-xs text-gray-400">{item.unit_price} ج.م / للقطعة</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & total */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="mb-1 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <path d="M1 10h22" />
              </svg>
              <p className="text-xs font-bold text-gray-500">طريقة الدفع</p>
            </div>
            <p className="text-sm font-bold text-gray-800">{paymentLabel}</p>
          </div>
          <div
            className="rounded-2xl p-4 animate-fade-in-up shadow-glow"
            style={{ animationDelay: '0.35s', background: 'linear-gradient(135deg, rgba(232,92,138,0.1), rgba(145,109,186,0.1))' }}
          >
            <p className="mb-1 text-xs font-bold text-gray-500">الإجمالي</p>
            <p className="text-2xl font-extrabold premium-gradient-text">
              {order.total_amount} <span className="text-base">ج.م</span>
            </p>
          </div>
        </div>

        {/* Notes */}
        {order.notes_ar && (
          <div className="mb-6 glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-1 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <p className="text-xs font-bold text-gray-500">ملاحظات التوصيل</p>
            </div>
            <p className="text-sm font-bold text-gray-800">{order.notes_ar}</p>
          </div>
        )}

        {/* Tracking */}
        {order.tracking_number && (
          <div className="mb-6 glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <p className="mb-1 text-xs font-bold text-gray-500">رقم التتبع</p>
            <p className="text-sm font-bold text-gray-800" dir="ltr">{order.tracking_number}</p>
          </div>
        )}

        {/* Close button */}
        <button onClick={onClose} className="btn-ghost w-full">
          إغلاق
        </button>
      </div>
    </div>
  )
}

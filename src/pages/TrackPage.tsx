import { useState } from 'react'
import { fetchOrderByNumber, fetchCustomerOrders } from '../lib/api'
import type { Order } from '../lib/types'
import { useRouter } from '../lib/router'

type StepKey = 'confirmed' | 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered'

const STATUS_FLOW: StepKey[] = ['confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered']

const STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'تم تأكيد الطلب',
  preparing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

export default function TrackPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prevOrders, setPrevOrders] = useState<Order[]>([])

  useState(() => {
    fetchCustomerOrders().then(setPrevOrders).catch(() => {})
  })

  const handleSearch = async () => {
    if (!orderNumber.trim()) return
    setLoading(true)
    setError('')
    try {
      const found = await fetchOrderByNumber(orderNumber.trim())
      if (found) {
        setOrder(found)
      } else {
        setError('لم يتم العثور على الطلب')
        setOrder(null)
      }
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    }
    setLoading(false)
  }

  const currentStep = order ? STATUS_FLOW.indexOf(order.status as StepKey) : -1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center premium-gradient-text">تتبع طلبك</h1>

      <div className="glass-card p-6 rounded-3xl mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="أدخل رقم الطلب (مثال: ORD-12345678)"
            className="input-premium flex-1"
          />
          <button onClick={handleSearch} disabled={loading} className="btn-premium px-8">
            {loading ? '...' : 'بحث'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {order && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-gray-400">رقم الطلب</div>
                <div className="font-bold text-lg" dir="ltr">{order.order_number}</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-400">الحالة</div>
                <div className="font-bold text-lg text-blush-600">{STATUS_LABELS[order.status] || order.status}</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2 px-2">
              {STATUS_FLOW.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      i <= currentStep
                        ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-glow scale-110'
                        : 'glass text-gray-400'
                    }`}
                  >
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs mt-2 text-center">{STATUS_LABELS[step]}</span>
                </div>
              ))}
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full mt-2">
              <div
                className="absolute top-0 right-0 h-full bg-gradient-to-l from-blush-500 to-lavender-500 rounded-full transition-all duration-1000"
                style={{ width: `${currentStep >= 0 ? (currentStep / (STATUS_FLOW.length - 1)) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-bold mb-4">تفاصيل الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">الاسم:</span><span className="font-bold">{order.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">الهاتف:</span><span className="font-bold" dir="ltr">{order.customer_phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">العنوان:</span><span className="font-bold">{order.shipping_address_ar}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">المدينة:</span><span className="font-bold">{order.city_ar}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">الإجمالي:</span><span className="font-bold">{Number(order.total_amount).toLocaleString()} ج.م</span></div>
              <div className="flex justify-between"><span className="text-gray-400">طريقة الدفع:</span><span className="font-bold">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span></div>
              {order.tracking_number && (
                <div className="flex justify-between"><span className="text-gray-400">رقم التتبع:</span><span className="font-bold" dir="ltr">{order.tracking_number}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {prevOrders.length > 0 && !order && (
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-bold mb-4">طلباتك السابقة</h3>
          <div className="space-y-2">
            {prevOrders.map(o => (
              <button
                key={o.id}
                onClick={() => { setOrderNumber(o.order_number); setOrder(o) }}
                className="w-full flex justify-between items-center p-3 rounded-2xl glass hover:bg-white/20 transition-all"
              >
                <span className="font-bold" dir="ltr">{o.order_number}</span>
                <span className="text-sm text-gray-500">{STATUS_LABELS[o.status] || o.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

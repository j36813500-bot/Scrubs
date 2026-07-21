import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../lib/router'
import {
  fetchCart,
  removeFromCart,
  updateCartQuantity,
  createOrder,
  createOrderItems,
} from '../lib/api'
import type { CartItem, Order } from '../lib/types'
import AuthGateModal from '../components/AuthGateModal'

// ── Skeleton ──────────────────────────────────────────────────────
function CartSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex gap-4">
          <div className="shimmer-bg animate-pulse h-24 w-24 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer-bg animate-pulse h-4 w-3/4 rounded-full" />
            <div className="shimmer-bg animate-pulse h-3 w-1/2 rounded-full" />
            <div className="shimmer-bg animate-pulse h-6 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Cart item row ─────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem
  onRemove: (cartId: string) => void
  onUpdateQty: (cartId: string, quantity: number) => void
}

function CartItemRow({ item, onRemove, onUpdateQty }: CartItemRowProps): JSX.Element {
  const product = item.product
  return (
    <div className="glass-card p-4 flex gap-4 animate-fade-in-up">
      {/* Image */}
      <div className="h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-blush-50 to-lavender-50">
        {product?.image_url ? (
          <img src={product.image_url} alt={product?.name_ar || ''} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-800 line-clamp-1">{product?.name_ar || 'منتج'}</h3>
          <button
            onClick={(): void => onRemove(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            aria-label="حذف"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
          {item.color_name_ar && (
            <span className="rounded-full glass px-2.5 py-0.5">اللون: {item.color_name_ar}</span>
          )}
          {item.size_label && (
            <span className="rounded-full glass px-2.5 py-0.5">المقاس: {item.size_label}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={(): void => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
              className="glass rounded-full h-8 w-8 flex items-center justify-center text-blush-600 font-bold"
            >
              −
            </button>
            <span className="font-bold w-8 text-center">{item.quantity}</span>
            <button
              onClick={(): void => onUpdateQty(item.id, item.quantity + 1)}
              className="glass rounded-full h-8 w-8 flex items-center justify-center text-blush-600 font-bold"
            >
              +
            </button>
          </div>

          {/* Price */}
          <span className="text-lg font-extrabold premium-gradient-text">
            {(product?.price || 0) * item.quantity} <span className="text-sm">ج.م</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Checkout form ─────────────────────────────────────────────────
interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => Promise<void>
  submitting: boolean
  subtotal: number
  shipping: number
  total: number
}

interface CheckoutData {
  name: string
  phone: string
  address: string
  city: string
  notes: string
  paymentMethod: string
}

function CheckoutForm({ onSubmit, submitting, subtotal, shipping, total }: CheckoutFormProps): JSX.Element {
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      return
    }
    setError(null)
    await onSubmit({ name, phone, address, city, notes, paymentMethod })
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-extrabold premium-gradient-text">بيانات الطلب</h3>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم الكامل *</label>
        <input
          type="text"
          value={name}
          onChange={(e): void => setName(e.target.value)}
          placeholder="اسمك الكامل"
          className="input-premium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e): void => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
          className="input-premium"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">العنوان *</label>
        <input
          type="text"
          value={address}
          onChange={(e): void => setAddress(e.target.value)}
          placeholder="العنوان بالتفصيل"
          className="input-premium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">المدينة *</label>
        <input
          type="text"
          value={city}
          onChange={(e): void => setCity(e.target.value)}
          placeholder="المدينة"
          className="input-premium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">ملاحظات</label>
        <textarea
          value={notes}
          onChange={(e): void => setNotes(e.target.value)}
          placeholder="أي ملاحظات إضافية..."
          rows={2}
          className="input-premium resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(): void => setPaymentMethod('cod')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
              paymentMethod === 'cod' ? 'btn-premium' : 'glass text-gray-600'
            }`}
          >
            الدفع عند الاستلام
          </button>
          <button
            type="button"
            onClick={(): void => setPaymentMethod('card')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
              paymentMethod === 'card' ? 'btn-premium' : 'glass text-gray-600'
            }`}
          >
            بطاقة ائتمان
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2 border-t border-blush-200/30 pt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>المجموع الفرعي</span>
          <span className="font-bold">{subtotal} ج.م</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>الشحن</span>
          <span className="font-bold">
            {shipping === 0 ? 'مجاني' : `${shipping} ج.م`}
          </span>
        </div>
        <div className="flex justify-between text-lg font-extrabold">
          <span className="text-gray-800">الإجمالي</span>
          <span className="premium-gradient-text">{total} ج.م</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'جارٍ إنشاء الطلب...' : 'تأكيد الطلب'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function CartPage(): JSX.Element {
  const { navigate } = useRouter()

  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null)

  const loadCart = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const data: CartItem[] = await fetchCart()
      setItems(data)
    } catch (err) {
      console.error('Failed to load cart:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect((): void => {
    loadCart()
  }, [loadCart])

  const handleRemove = async (cartId: string): Promise<void> => {
    try {
      await removeFromCart(cartId)
      setItems((prev) => prev.filter((item) => item.id !== cartId))
    } catch (err) {
      console.error('Failed to remove from cart:', err)
    }
  }

  const handleUpdateQty = async (cartId: string, quantity: number): Promise<void> => {
    try {
      await updateCartQuantity(cartId, quantity)
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity } : item
        )
      )
    } catch (err) {
      console.error('Failed to update quantity:', err)
    }
  }

  const subtotal: number = items.reduce(
    (sum: number, item: CartItem) => sum + (item.product?.price || 0) * item.quantity,
    0
  )
  const shipping: number = subtotal >= 500 ? 0 : 60
  const total: number = subtotal + shipping

  const handleCheckout = async (data: CheckoutData): Promise<void> => {
    setSubmitting(true)
    try {
      const order: Order | null = await createOrder({
        customer_name: data.name,
        customer_phone: data.phone,
        shipping_address: data.address,
        city: data.city,
        total_amount: total,
        notes: data.notes,
        payment_method: data.paymentMethod,
      })

      if (order) {
        await createOrderItems(
          items.map((item: CartItem) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product?.name_ar || 'منتج',
            color_name: item.color_name_ar || undefined,
            size_label: item.size_label || undefined,
            unit_price: item.product?.price || 0,
            quantity: item.quantity,
          }))
        )

        // Clear cart
        for (const item of items) {
          await removeFromCart(item.id)
        }
        setItems([])
        setSuccessOrder(order)
      }
    } catch (err) {
      console.error('Failed to create order:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──
  if (successOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-20" dir="rtl">
        <div className="glass-card max-w-md w-full p-8 text-center animate-scale-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full glass shadow-glow animate-breathe">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-extrabold premium-gradient-text">تم إنشاء طلبك بنجاح!</h2>
          <p className="mb-6 text-gray-600">رقم طلبك هو:</p>
          <div className="mb-6 rounded-2xl glass px-6 py-4">
            <span className="text-2xl font-extrabold text-blush-600 tracking-wider" dir="ltr">
              {successOrder.order_number}
            </span>
          </div>
          <p className="mb-6 text-sm text-gray-500">
            سنتواصل معك قريباً لتأكيد الطلب وتفاصيل الشحن.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={(): void => navigate(`/track?order=${successOrder.order_number}`)}
              className="btn-premium w-full"
            >
              تتبع الطلب
            </button>
            <button onClick={(): void => navigate('/store')} className="btn-ghost w-full">
              مواصلة التسوق
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty cart ──
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-20" dir="rtl">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full glass">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-gray-800">سلتك فارغة</h2>
          <p className="mb-6 text-sm text-gray-500">لم تقم بإضافة أي منتجات بعد.</p>
          <button onClick={(): void => navigate('/store')} className="btn-premium w-full">
            تصفح المتجر
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Header ── */}
      <section className="px-4 pt-24 pb-6 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold premium-gradient-text">
            سلة التسوق
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} منتج في سلتك
          </p>
        </div>
      </section>

      {/* ── Cart content ── */}
      <section className="px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <CartSkeleton />
            ) : (
              items.map((item: CartItem) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateQty={handleUpdateQty}
                />
              ))
            )}
          </div>

          {/* Checkout form */}
          <div className="lg:col-span-1">
            <CheckoutForm
              onSubmit={handleCheckout}
              submitting={submitting}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />
          </div>
        </div>
      </section>

      {/* ── Auth gate modal ── */}
      <AuthGateModal
        open={authModalOpen}
        onClose={(): void => setAuthModalOpen(false)}
        onAuthenticated={(): void => {
          setAuthModalOpen(false)
          loadCart()
        }}
      />
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../lib/router'
import { fetchOrderByNumber, submitOrderFeedback } from '../lib/api'
import type { Order } from '../lib/types'
import FloatingWords from '../components/FloatingWords'

// ── Step definitions ──────────────────────────────────────────────
interface StepConfig {
  title: string
  icon: JSX.Element
  words: string[]
  color: string
}

const stepConfigs: StepConfig[] = [
  {
    title: 'تم تأكيد الطلب',
    color: '#e85c8a',
    words: ['شكراً لك', 'تأكيد فوري', 'طلبك آمن', 'بداية جميلة', 'ثقتك تكرمنا', 'خدمة ممتازة'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    title: 'تم شحن الطلب',
    color: '#916dba',
    words: ['في الطريق', 'شحن سريع', 'وصول قريب', 'نوصلك بحنان', 'كل ثانية تهمنا', 'تتبع لحظي'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'تم استلام الطلب',
    color: '#f59e0b',
    words: ['وصل الطلب', 'سعادة تامة', 'شكراً لثقتك', 'تجربة فاخرة', 'نراك قريباً', 'أناقة تدوم'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
        <path d="M3 7l9 6 9-6" />
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
      </svg>
    ),
  },
]

// ── Animated progress card ────────────────────────────────────────
interface ProgressCardProps {
  config: StepConfig
  index: number
  active: boolean
}

function ProgressCard({ config, index, active }: ProgressCardProps): JSX.Element {
  return (
    <div
      className={`glass-card relative overflow-hidden p-8 transition-all duration-500 ${
        active ? 'shadow-glow -translate-y-2' : 'opacity-70'
      }`}
    >
      {/* Glow background */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: config.color }}
      />

      {/* Floating words around the circle */}
      <div className="relative h-64 mb-4">
        <FloatingWords words={config.words} />

        {/* Central circle with icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed animate-spin-slow"
              style={{ borderColor: `${config.color}40` }}
            />
            {/* Middle ring */}
            <div
              className="absolute inset-3 rounded-full border opacity-30"
              style={{ borderColor: config.color }}
            />
            {/* Inner glass circle */}
            <div
              className="absolute inset-6 rounded-full glass flex items-center justify-center animate-breathe"
              style={{ color: config.color }}
            >
              {config.icon}
            </div>
          </div>
        </div>

        {/* Step number badge */}
        <div className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full glass shadow-premium text-sm font-extrabold" style={{ color: config.color }}>
          {index + 1}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center text-lg font-extrabold" style={{ color: config.color }}>
        {config.title}
      </h3>
    </div>
  )
}

// ── Feedback form ─────────────────────────────────────────────────
interface FeedbackFormProps {
  orderId: string
  onSubmitted: () => void
}

function FeedbackForm({ orderId, onSubmitted }: FeedbackFormProps): JSX.Element {
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [experience, setExperience] = useState<string>('ممتاز')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitOrderFeedback(orderId, rating, review.trim(), experience)
      setSubmitted(true)
      onSubmitted()
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="glass-card p-8 text-center animate-scale-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass shadow-glow animate-breathe">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </div>
        <h3 className="text-xl font-extrabold premium-gradient-text mb-2">شكراً لتقييمك!</h3>
        <p className="text-sm text-gray-500">رأيك يهمنا ويساعدنا على التحسين المستمر.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <h3 className="text-xl font-extrabold premium-gradient-text">قيّم تجربتك</h3>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">التقييم</label>
        <div className="flex items-center gap-1" dir="ltr" onMouseLeave={(): void => setHoverRating(0)}>
          {Array.from({ length: 5 }).map((_, i) => {
            const val: number = i + 1
            return (
              <button
                key={i}
                type="button"
                onClick={(): void => setRating(val)}
                onMouseEnter={(): void => setHoverRating(val)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={(hoverRating || rating) >= val ? '#f59e0b' : '#e5e7eb'}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      {/* Experience selector */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">تجربتك العامة</label>
        <div className="flex flex-wrap gap-2">
          {['ممتاز', 'جيد', 'متوسط', 'ضعيف'].map((exp: string) => (
            <button
              key={exp}
              type="button"
              onClick={(): void => setExperience(exp)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                experience === exp ? 'btn-premium' : 'glass text-gray-600'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">تعليقك</label>
        <textarea
          value={review}
          onChange={(e): void => setReview(e.target.value)}
          placeholder="شاركنا تفاصيل تجربتك..."
          rows={3}
          className="input-premium resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  )
}

// ── Order details card ─────────────────────────────────────────────
interface OrderDetailsProps {
  order: Order
  onFeedbackSubmitted: () => void
}

function OrderDetails({ order, onFeedbackSubmitted }: OrderDetailsProps): JSX.Element {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  }

  // Determine which step is active
  const statusOrder: string[] = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentStep: number = statusOrder.indexOf(order.status)
  const isDelivered: boolean = order.status === 'delivered'

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Order info */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">رقم الطلب</p>
            <p className="text-xl font-extrabold text-blush-600 tracking-wider" dir="ltr">
              {order.order_number}
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-500">الحالة</p>
            <span className="inline-block rounded-full glass px-4 py-1.5 text-sm font-bold text-lavender-600">
              {statusMap[order.status] || order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">الاسم</p>
            <p className="font-bold text-gray-800">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">الهاتف</p>
            <p className="font-bold text-gray-800" dir="ltr">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">المدينة</p>
            <p className="font-bold text-gray-800">{order.city_ar}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">الإجمالي</p>
            <p className="font-extrabold premium-gradient-text">{order.total_amount} ج.م</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 mb-1">العنوان</p>
            <p className="font-bold text-gray-800">{order.shipping_address_ar}</p>
          </div>
          {order.notes_ar && (
            <div className="col-span-2">
              <p className="text-gray-500 mb-1">ملاحظات</p>
              <p className="font-bold text-gray-800">{order.notes_ar}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback form (only after delivery) */}
      {isDelivered && (
        <FeedbackForm orderId={order.id} onSubmitted={onFeedbackSubmitted} />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function TrackOrderPage(): JSX.Element {
  const { query } = useRouter()

  const [orderNumber, setOrderNumber] = useState<string>(query.order || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const [searched, setSearched] = useState<boolean>(false)
  const [notFound, setNotFound] = useState<boolean>(false)

  const handleSearch = useCallback(async (num?: string): Promise<void> => {
    const searchValue: string = (num || orderNumber).trim()
    if (!searchValue) return
    setSearching(true)
    setSearched(true)
    setNotFound(false)
    try {
      const result: Order | null = await fetchOrderByNumber(searchValue)
      if (result) {
        setOrder(result)
      } else {
        setOrder(null)
        setNotFound(true)
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }, [orderNumber])

  // Auto-search if order number is in URL query
  useEffect((): void => {
    if (query.order) {
      setOrderNumber(query.order)
      handleSearch(query.order)
    }
  }, [query.order, handleSearch])

  // Determine active step for progress cards
  const statusOrder: string[] = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentStep: number = order ? statusOrder.indexOf(order.status) : -1

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Header ── */}
      <section className="px-4 pt-24 pb-6 lg:pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold premium-gradient-text mb-2">
            تتبع طلبك
          </h1>
          <p className="text-sm text-gray-500">
            أدخل رقم طلبك لمعرفة حالته وتفاصيله
          </p>
        </div>
      </section>

      {/* ── Search bar ── */}
      <section className="px-4 mb-10">
        <div className="mx-auto max-w-lg">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={orderNumber}
                onChange={(e): void => setOrderNumber(e.target.value)}
                onKeyDown={(e): void => {
                  if (e.key === 'Enter') handleSearch()
                }}
                placeholder="أدخل رقم الطلب (مثال: ORD-12345678)"
                className="input-premium pr-12"
                dir="ltr"
              />
            </div>
            <button
              onClick={(): void => { void handleSearch() }}
              disabled={searching}
              className="btn-premium whitespace-nowrap disabled:opacity-60"
            >
              {searching ? '...' : 'تتبع'}
            </button>
          </div>

          {notFound && (
            <div className="mt-4 rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm font-bold text-red-700 animate-fade-in">
              لم نعثر على طلب بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.
            </div>
          )}
        </div>
      </section>

      {/* ── Progress cards (always visible) ── */}
      <section className="px-4 mb-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stepConfigs.map((config: StepConfig, i: number) => (
              <ProgressCard
                key={i}
                config={config}
                index={i}
                active={order ? i <= currentStep : false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Order details ── */}
      {order && (
        <section className="px-4">
          <div className="mx-auto max-w-2xl">
            <OrderDetails
              order={order}
              onFeedbackSubmitted={(): void => {
                // Refresh could be done here if needed
              }}
            />
          </div>
        </section>
      )}

      {/* ── Initial empty state ── */}
      {!order && !searched && !searching && (
        <section className="px-4">
          <div className="mx-auto max-w-lg">
            <div className="glass-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass animate-breathe">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-gray-500">أدخل رقم طلبك أعلاه لتتبع حالته</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

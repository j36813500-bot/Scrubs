import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchOrders, fetchOrderItems, fetchOrderByNumber } from '../lib/api';
import type { Order, OrderItem } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Status configuration                                                       */
/* -------------------------------------------------------------------------- */

type StatusKey =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

type StatusConfig = {
  label: string;
  /** Tailwind classes for the status badge (text + bg + ring). */
  badge: string;
  /** Tailwind classes for the status dot. */
  dot: string;
};

const STATUS_MAP: Record<StatusKey, StatusConfig> = {
  pending: {
    label: 'قيد الانتظار',
    badge: 'bg-gold-100 text-gold-700 ring-1 ring-gold-300/50',
    dot: 'bg-gold-400',
  },
  confirmed: {
    label: 'تم تأكيد الطلب',
    badge: 'bg-blush-100 text-blush-700 ring-1 ring-blush-300/50',
    dot: 'bg-blush-400',
  },
  preparing: {
    label: 'جاري التجهيز',
    badge: 'bg-lavender-100 text-lavender-700 ring-1 ring-lavender-300/50',
    dot: 'bg-lavender-400',
  },
  shipped: {
    label: 'تم الشحن',
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300/50',
    dot: 'bg-blue-400',
  },
  out_for_delivery: {
    label: 'قيد التوصيل',
    badge: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300/50',
    dot: 'bg-cyan-400',
  },
  delivered: {
    label: 'تم التسليم',
    badge: 'bg-green-100 text-green-700 ring-1 ring-green-300/50',
    dot: 'bg-green-400',
  },
  cancelled: {
    label: 'ملغي',
    badge: 'bg-red-100 text-red-700 ring-1 ring-red-300/50',
    dot: 'bg-red-400',
  },
};

function getStatusConfig(status: string): StatusConfig {
  return STATUS_MAP[status as StatusKey] ?? STATUS_MAP.pending;
}

/* -------------------------------------------------------------------------- */
/* Progress steps                                                             */
/* -------------------------------------------------------------------------- */

type StepKey = 'confirmed' | 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered';

type StepDef = {
  key: StepKey;
  label: string;
  icon: React.ReactNode;
};

/** The three milestone steps shown when an order is found. */
const STEPS: StepDef[] = [
  {
    key: 'confirmed',
    label: 'تم تأكيد الطلب',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    key: 'shipped',
    label: 'تم الشحن',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'delivered',
    label: 'تم الاستلام',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
];

/**
 * Determine which of the 3 milestone steps are active for a given order status.
 * A cancelled order shows no active steps.
 */
function getActiveStepIndex(status: string): number {
  if (status === 'cancelled') return -1;
  const order: StepKey[] = ['confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered'];
  const idx = order.indexOf(status as StepKey);
  if (idx < 0) return -1;
  // Map the granular status to the 3-step milestone index.
  if (idx <= 1) return 0; // pending / confirmed / preparing → step 0
  if (idx <= 3) return 1; // shipped / out_for_delivery → step 1
  return 2; // delivered → step 2
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Format a number as a localized Arabic price string. */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(value);
}

/** Format an ISO date string into a readable Arabic date. */
function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Resolve the best image URL for an order item. */
function itemImage(item: OrderItem): string | null {
  if (item.product?.image_url) return item.product.image_url;
  if (item.product?.gallery_urls && item.product.gallery_urls.length > 0) {
    return item.product.gallery_urls[0];
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** A single milestone step card. */
type StepCardProps = {
  step: StepDef;
  active: boolean;
  index: number;
};

const StepCard: React.FC<StepCardProps> = ({ step, active, index }) => {
  return (
    <div className="flex-1">
      <div
        className={
          'glass-card relative flex flex-col items-center gap-3 rounded-3xl p-5 text-center transition-all duration-500 ' +
          (active ? 'shadow-glow ring-1 ring-blush-300/40' : 'opacity-60')
        }
      >
        {/* Gradient icon circle */}
        <div
          className={
            'flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ' +
            (active
              ? 'bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-md'
              : 'bg-beige-100/70 text-beige-400')
          }
        >
          {step.icon}
        </div>

        {/* Label */}
        <span
          className={
            'text-sm font-semibold leading-snug ' +
            (active ? 'text-beige-800' : 'text-beige-500')
          }
        >
          {step.label}
        </span>

        {/* Step number pip */}
        <span
          className={
            'absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ' +
            (active
              ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white'
              : 'bg-beige-200/70 text-beige-500')
          }
        >
          {index + 1}
        </span>
      </div>
    </div>
  );
};

/** Connector line between step cards (desktop only). */
const StepConnector: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="hidden sm:block">
    <div
      className={
        'h-1 w-full rounded-full transition-all duration-500 ' +
        (active
          ? 'bg-gradient-to-r from-blush-400 to-lavender-400'
          : 'bg-beige-200/60')
      }
    />
  </div>
);

/** Status badge pill. */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ' +
        cfg.badge
      }
    >
      <span className={'h-1.5 w-1.5 rounded-full ' + cfg.dot} />
      {cfg.label}
    </span>
  );
};

/** Skeleton block for the order details card. */
const OrderDetailsSkeleton: React.FC = () => (
  <div className="glass-card rounded-3xl p-6 sm:p-8">
    <div className="mb-6 flex items-center justify-between">
      <div className="h-6 w-40 rounded-full bg-beige-200/60 animate-pulse" />
      <div className="h-6 w-24 rounded-full bg-beige-200/50 animate-pulse" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full rounded-full bg-beige-200/50 animate-pulse" />
      <div className="h-4 w-2/3 rounded-full bg-beige-200/40 animate-pulse" />
      <div className="h-4 w-1/2 rounded-full bg-beige-200/40 animate-pulse" />
    </div>
    <div className="mt-6 space-y-3 border-t border-beige-200/50 pt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-beige-200/50 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-beige-200/50 animate-pulse" />
            <div className="h-3 w-1/3 rounded-full bg-beige-200/40 animate-pulse" />
          </div>
          <div className="h-5 w-16 rounded-full bg-beige-200/40 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

/** Skeleton block for a single previous-order row. */
const OrderRowSkeleton: React.FC = () => (
  <div className="glass-card flex items-center gap-4 rounded-2xl p-4">
    <div className="h-12 w-12 rounded-full bg-beige-200/50 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded-full bg-beige-200/50 animate-pulse" />
      <div className="h-3 w-24 rounded-full bg-beige-200/40 animate-pulse" />
    </div>
    <div className="h-6 w-20 rounded-full bg-beige-200/40 animate-pulse" />
  </div>
);

/* -------------------------------------------------------------------------- */
/* TrackPage                                                                   */
/* -------------------------------------------------------------------------- */

const TrackPage: React.FC = () => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  /* ----------------------------------------------------------------------- */
  /* Load previous orders on mount                                           */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const data = await fetchOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Load items for the active order                                          */
  /* ----------------------------------------------------------------------- */
  const loadOrderItems = useCallback(async (orderId: string) => {
    setLoadingItems(true);
    try {
      const items = await fetchOrderItems(orderId);
      setOrderItems(items);
    } catch (err) {
      console.error('Failed to load order items:', err);
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Search handler                                                          */
  /* ----------------------------------------------------------------------- */
  async function handleSearch(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const query = searchValue.trim().toUpperCase();
    if (!query) return;

    setSearching(true);
    setSearchError(null);
    setOrderItems([]);
    setLoadingItems(true);

    try {
      const order = await fetchOrderByNumber(query);
      if (!order) {
        setActiveOrder(null);
        setSearchError('لم يتم العثور على طلب بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.');
        setLoadingItems(false);
        return;
      }
      setActiveOrder(order);
      await loadOrderItems(order.id);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
      setActiveOrder(null);
      setLoadingItems(false);
    } finally {
      setSearching(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Select a previous order to view its details                             */
  /* ----------------------------------------------------------------------- */
  function handleSelectOrder(order: Order): void {
    setActiveOrder(order);
    setSearchValue(order.order_number);
    setSearchError(null);
    // Smoothly scroll to the top where the details render.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadOrderItems(order.id);
  }

  /* ----------------------------------------------------------------------- */
  /* Derived values                                                          */
  /* ----------------------------------------------------------------------- */
  const activeStepIndex = activeOrder ? getActiveStepIndex(activeOrder.status) : -1;
  const itemsTotal = orderItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  /* ----------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ----------------------------------------------------------------------- */
  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30"
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-300/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            تتبع طلبك
          </h1>
          <p className="mt-2 text-sm text-beige-500">
            تابع حالة طلبك خطوة بخطوة
          </p>
        </header>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="SCB-XXXXX"
                aria-label="رقم الطلب"
                dir="ltr"
                className="input-premium w-full rounded-full py-3 pr-12 pl-4 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-beige-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <button
              type="submit"
              disabled={searching || !searchValue.trim()}
              className="rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-8 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {searching ? 'جاري البحث...' : 'بحث'}
            </button>
          </div>
          {searchError && (
            <p className="mt-3 text-center text-sm text-red-500">{searchError}</p>
          )}
        </form>

        {/* Order found: progress steps */}
        {activeOrder && (
          <section className="mb-8">
            <div className="flex items-stretch gap-3 sm:gap-4">
              {STEPS.map((step, i) => (
                <div key={step.key} className="contents">
                  <StepCard step={step} active={activeStepIndex >= i} index={i} />
                  {i < STEPS.length - 1 && (
                    <div className="flex items-center">
                      <StepConnector active={activeStepIndex > i} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Order found: details card */}
        {activeOrder && (
          <section className="mb-10">
            {loadingItems ? (
              <OrderDetailsSkeleton />
            ) : (
              <div className="glass-card rounded-3xl p-6 sm:p-8">
                {/* Header row */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-beige-800">
                      تفاصيل الطلب
                    </h2>
                    <p className="mt-1 font-mono text-sm text-beige-500" dir="ltr">
                      {activeOrder.order_number}
                    </p>
                  </div>
                  <StatusBadge status={activeOrder.status} />
                </div>

                {/* Meta grid */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-beige-400">
                      تاريخ الطلب
                    </p>
                    <p className="mt-1 text-sm text-beige-700">
                      {formatDate(activeOrder.created_at)}
                    </p>
                  </div>
                  {activeOrder.tracking_number && (
                    <div>
                      <p className="text-xs font-medium text-beige-400">
                        رقم الشحن
                      </p>
                      <p
                        className="mt-1 font-mono text-sm text-beige-700"
                        dir="ltr"
                      >
                        {activeOrder.tracking_number}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-beige-400">
                      عنوان الشحن
                    </p>
                    <p className="mt-1 text-sm text-beige-700">
                      {activeOrder.shipping_address_ar}
                      {activeOrder.city_ar ? ` — ${activeOrder.city_ar}` : ''}
                    </p>
                  </div>
                </div>

                {/* Items list */}
                <div className="border-t border-beige-200/50 pt-5">
                  <h3 className="mb-4 text-sm font-semibold text-beige-700">
                    المنتجات
                  </h3>
                  {orderItems.length === 0 ? (
                    <p className="py-6 text-center text-sm text-beige-400">
                      لا توجد منتجات في هذا الطلب.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {orderItems.map((item) => {
                        const img = itemImage(item);
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            {/* Thumbnail */}
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-beige-100/60">
                              {img ? (
                                <img
                                  src={img}
                                  alt={item.product_name_ar}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-beige-300">
                                  <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 9 4.5 4h15L21 9" />
                                    <path d="M3 9v11h18V9" />
                                    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-beige-800">
                                {item.product_name_ar}
                              </p>
                              <p className="mt-0.5 text-xs text-beige-400">
                                {[
                                  item.color_name_ar,
                                  item.size_label,
                                  `الكمية: ${item.quantity}`,
                                ]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </p>
                            </div>

                            {/* Price */}
                            <span className="flex-shrink-0 text-sm font-bold text-blush-600">
                              {formatPrice(item.unit_price * item.quantity)} ج.م
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 flex items-center justify-between border-t border-beige-200/50 pt-5">
                  <span className="text-sm font-semibold text-beige-700">
                    الإجمالي
                  </span>
                  <span className="text-xl font-extrabold premium-gradient-text">
                    {formatPrice(activeOrder.total_amount || itemsTotal)} ج.م
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Previous orders */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-beige-800">طلباتك السابقة</h2>

          {/* Loading skeleton */}
          {loadingOrders && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingOrders && orders.length === 0 && (
            <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-beige-100 to-beige-200/60 text-beige-400">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 9 4.5 4h15L21 9" />
                  <path d="M3 9v11h18V9" />
                  <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-beige-700">
                لا توجد طلبات سابقة
              </h3>
              <p className="mt-1 max-w-xs text-sm text-beige-500">
                لم نعثر على أي طلبات سابقة مرتبطة بحسابك. ابدأ التسوق الآن لإنشاء طلبك الأول.
              </p>
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="mt-5 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
              >
                تصفح المتجر
              </button>
            </div>
          )}

          {/* Orders list */}
          {!loadingOrders && orders.length > 0 && (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(order)}
                    className={
                      'group glass-card flex w-full items-center gap-4 rounded-2xl p-4 text-right transition-all duration-200 hover:scale-[1.02] hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60 ' +
                      (activeOrder?.id === order.id ? 'ring-1 ring-blush-300/50' : '')
                    }
                  >
                    {/* Icon */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-100 to-lavender-100 text-blush-500">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 3h15v13H1z" />
                        <path d="M16 8h4l3 3v5h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono text-sm font-semibold text-beige-800"
                        dir="ltr"
                      >
                        {order.order_number}
                      </p>
                      <p className="mt-0.5 text-xs text-beige-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    {/* Total + status */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-bold text-blush-600">
                        {formatPrice(order.total_amount)} ج.م
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default TrackPage;

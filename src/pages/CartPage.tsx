import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '../lib/router';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  createOrder,
  createOrderItems,
} from '../lib/api';
import { getUser, onAuthChange, type AppUser } from '../lib/auth';
import AuthGateModal from '../components/AuthGateModal';
import type { CartItem } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Format a number as a localized Arabic price string. */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 0,
  }).format(value);
}

/* -------------------------------------------------------------------------- */
/* Skeleton row (loading state)                                               */
/* -------------------------------------------------------------------------- */

const SkeletonRow: React.FC = () => (
  <div className="glass-card flex items-center gap-4 rounded-3xl p-4">
    <div className="h-20 w-16 shrink-0 animate-pulse rounded-2xl bg-beige-200/60" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-beige-200/60" />
      <div className="h-4 w-1/4 animate-pulse rounded-full bg-beige-200/50" />
      <div className="h-8 w-28 animate-pulse rounded-full bg-beige-200/40" />
    </div>
    <div className="h-8 w-8 animate-pulse rounded-full bg-beige-200/40" />
  </div>
);

/* -------------------------------------------------------------------------- */
/* Cart item row                                                              */
/* -------------------------------------------------------------------------- */

type CartRowProps = {
  item: CartItem;
  onQuantityChange: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
  updatingId: string | null;
};

const CartRow: React.FC<CartRowProps> = ({ item, onQuantityChange, onRemove, updatingId }) => {
  const isUpdating = updatingId === item.id;
  const lineTotal = item.product.price * item.quantity;

  return (
    <div className="glass-card flex items-center gap-4 rounded-3xl p-4 transition-all duration-300 hover:shadow-glow">
      {/* Product image */}
      <button
        type="button"
        onClick={() => {}}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
        aria-label={item.product.name_ar}
      >
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name_ar}
            loading="lazy"
            className="h-20 w-16 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-16 items-center justify-center rounded-2xl bg-beige-100/60 text-beige-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9 4.5 4h15L21 9" />
              <path d="M3 9v11h18V9" />
              <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            </svg>
          </div>
        )}
      </button>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="line-clamp-1 text-sm font-semibold text-beige-800">{item.product.name_ar}</h3>

        {/* Color / size meta */}
        {(item.color_name_ar || item.size_label) && (
          <p className="mt-0.5 text-xs text-beige-500">
            {[item.color_name_ar, item.size_label].filter(Boolean).join(' · ')}
          </p>
        )}

        <p className="mt-1 text-sm font-bold text-blush-600">
          {formatPrice(item.product.price)} ج.م
        </p>

        {/* Quantity selector */}
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/60 p-1">
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-beige-100/80 text-beige-700 transition hover:bg-blush-100 hover:text-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="تقليل الكمية"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold text-beige-800">
            {isUpdating ? '…' : item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            disabled={isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-beige-100/80 text-beige-700 transition hover:bg-blush-100 hover:text-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="زيادة الكمية"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end gap-2">
        <span className="text-sm font-bold text-beige-800">{formatPrice(lineTotal)} ج.م</span>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-50/80 text-blush-400 transition hover:bg-blush-100 hover:text-blush-600"
          aria-label="إزالة المنتج"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Success state                                                              */
/* -------------------------------------------------------------------------- */

type SuccessStateProps = {
  orderNumber: string;
  onTrack: () => void;
};

const SuccessState: React.FC<SuccessStateProps> = ({ orderNumber, onTrack }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {/* Checkmark animation */}
    <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-blush-300/30" />
      <span className="absolute inset-0 animate-pulse rounded-full bg-blush-300/20" />
      <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 shadow-glow">
        <svg
          className="animate-[checkmark_0.6s_ease-out]"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </div>

    <h2 className="premium-gradient-text text-3xl font-extrabold">تم تأكيد طلبك!</h2>
    <p className="mt-2 text-sm text-beige-500">
      رقم الطلب: <span className="font-semibold text-beige-700" dir="ltr">{orderNumber}</span>
    </p>
    <p className="mt-1 max-w-sm text-sm text-beige-500">
      سنتواصل معك قريباً لتأكيد التوصيل. شكراً لثقتك بنا.
    </p>

    <button type="button" onClick={onTrack} className="btn-premium mt-6">
      تتبع الطلب
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Empty cart state                                                           */
/* -------------------------------------------------------------------------- */

type EmptyStateProps = {
  onBrowse: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ onBrowse }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-beige-100 to-beige-200/60 text-beige-400">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9 4.5 4h15L21 9" />
        <path d="M3 9v11h18V9" />
        <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-beige-700">سلتك فارغة</h3>
    <p className="mt-1 max-w-xs text-sm text-beige-500">
      لم تقم بإضافة أي منتجات بعد. تصفح متجرنا واختر من تشكيلتنا الفاخرة.
    </p>
    <button type="button" onClick={onBrowse} className="btn-premium mt-5">
      تصفح المتجر
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/* CartPage                                                                    */
/* -------------------------------------------------------------------------- */

const CartPage: React.FC = () => {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Checkout form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<AppUser | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Success state
  const [completedOrder, setCompletedOrder] = useState<string | null>(null);

  /* ----------------------------------------------------------------------- */
  /* Auth subscription                                                       */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    setUser(getUser());
    const unsubscribe = onAuthChange((u: AppUser | null) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Load cart                                                               */
  /* ----------------------------------------------------------------------- */

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchCart();
      setCart(items);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('تعذر تحميل السلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ----------------------------------------------------------------------- */
  /* Derived: order summary                                                  */
  /* ----------------------------------------------------------------------- */

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ----------------------------------------------------------------------- */
  /* Handlers                                                                */
  /* ----------------------------------------------------------------------- */

  async function handleQuantityChange(cartId: string, quantity: number): Promise<void> {
    if (quantity < 1) return;
    setUpdatingId(cartId);
    try {
      await updateCartQuantity(cartId, quantity);
      setCart((prev) =>
        prev.map((item) => (item.id === cartId ? { ...item, quantity } : item)),
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(cartId: string): Promise<void> {
    setUpdatingId(cartId);
    try {
      await removeFromCart(cartId);
      setCart((prev) => prev.filter((item) => item.id !== cartId));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('تعذر إزالة المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdatingId(null);
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'الاسم مطلوب';
    if (!form.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.phone.trim())) {
      errors.phone = 'رقم هاتف غير صالح';
    }
    if (!form.city.trim()) errors.city = 'المدينة مطلوبة';
    if (!form.address.trim()) errors.address = 'العنوان مطلوب';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCheckout(): Promise<void> {
    setOrderError(null);

    // Require authentication
    if (!user) {
      setShowAuthGate(true);
      return;
    }

    if (cart.length === 0) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        shipping_address_ar: form.address.trim(),
        city_ar: form.city.trim(),
        total_amount: total,
        payment_method: 'cod',
        notes_ar: form.notes.trim() || undefined,
        user_id: user.id,
      });

      await createOrderItems(
        cart.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name_ar: item.product.name_ar,
          color_name_ar: item.color_name_ar,
          size_label: item.size_label,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      );

      // Clear cart locally + in DB
      await Promise.all(cart.map((item) => removeFromCart(item.id)));
      setCart([]);
      setCompletedOrder(order.order_number);
    } catch (err) {
      console.error('Failed to place order:', err);
      setOrderError('تعذر إتمام الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFieldChange(field: keyof typeof form, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Render                                                                   */
  /* ----------------------------------------------------------------------- */

  // Success state takes over the whole page
  if (completedOrder) {
    return (
      <div dir="rtl" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
          <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <SuccessState
            orderNumber={completedOrder}
            onTrack={() => router.push(`/orders`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-300/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            سلة التسوق
          </h1>
          <p className="mt-2 text-sm text-beige-500">
            {itemCount > 0 ? `${itemCount} منتج في سلتك` : 'راجع منتجاتك وأكمل طلبك'}
          </p>
        </header>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-blush-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-beige-600">{error}</p>
            <button
              type="button"
              onClick={loadCart}
              className="mt-4 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty cart */}
        {!loading && !error && cart.length === 0 && (
          <EmptyState onBrowse={() => router.push('/store')} />
        )}

        {/* Cart + summary + checkout */}
        {!loading && !error && cart.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left: cart items */}
            <div className="space-y-4">
              {/* Free shipping progress */}
              {remainingForFreeShipping > 0 && (
                <div className="glass-card rounded-3xl p-4">
                  <p className="text-sm text-beige-600">
                    أضف منتجات بقيمة{' '}
                    <span className="font-bold text-blush-600">
                      {formatPrice(remainingForFreeShipping)} ج.م
                    </span>{' '}
                    للحصول على شحن مجاني 🚚
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-beige-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {cart.map((item) => (
                <CartRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  updatingId={updatingId}
                />
              ))}
            </div>

            {/* Right: summary + checkout form */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Order summary */}
              <div className="glass-card rounded-3xl p-5">
                <h2 className="mb-4 text-lg font-bold text-beige-800">ملخص الطلب</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-beige-500">المجموع الفرعي</dt>
                    <dd className="font-semibold text-beige-800">{formatPrice(subtotal)} ج.م</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-beige-500">الشحن</dt>
                    <dd className="font-semibold text-beige-800">
                      {shipping === 0 ? (
                        <span className="text-green-600">مجاني</span>
                      ) : (
                        `${formatPrice(shipping)} ج.م`
                      )}
                    </dd>
                  </div>
                  <div className="border-t border-beige-200/60 pt-3 flex items-center justify-between">
                    <dt className="font-semibold text-beige-700">الإجمالي</dt>
                    <dd className="text-lg font-extrabold text-blush-600">
                      {formatPrice(total)} ج.م
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Checkout form */}
              <div className="glass-card rounded-3xl p-5">
                <h2 className="mb-4 text-lg font-bold text-beige-800">بيانات التوصيل</h2>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCheckout();
                  }}
                >
                  {/* Name */}
                  <div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="الاسم بالكامل"
                      aria-label="الاسم بالكامل"
                      className="input-premium w-full rounded-2xl px-4 py-3 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-blush-500">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="رقم الهاتف"
                      aria-label="رقم الهاتف"
                      dir="ltr"
                      className="input-premium w-full rounded-2xl px-4 py-3 text-right text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-blush-500">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="المدينة"
                      aria-label="المدينة"
                      className="input-premium w-full rounded-2xl px-4 py-3 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-xs text-blush-500">{formErrors.city}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="العنوان بالتفصيل"
                      aria-label="العنوان بالتفصيل"
                      className="input-premium w-full rounded-2xl px-4 py-3 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-blush-500">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <textarea
                      value={form.notes}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder="ملاحظات إضافية (اختياري)"
                      aria-label="ملاحظات إضافية"
                      rows={3}
                      className="input-premium w-full resize-none rounded-2xl px-4 py-3 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                  </div>

                  {/* Order error */}
                  {orderError && (
                    <p className="rounded-2xl bg-blush-50 px-4 py-2 text-xs text-blush-600">
                      {orderError}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-premium w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'جارٍ تأكيد الطلب...' : 'تأكيد الطلب'}
                  </button>

                  {!user && (
                    <p className="text-center text-xs text-beige-400">
                      ستحتاج لتسجيل الدخول لإتمام الطلب
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth gate modal */}
      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onAuthenticated={() => setShowAuthGate(false)}
      />
    </div>
  );
};

export default CartPage;

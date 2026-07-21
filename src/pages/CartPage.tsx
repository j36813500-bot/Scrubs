import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCart, updateCartQuantity, removeFromCart, createOrder, createOrderItems } from '../lib/api';
import { getUser, onAuthChange, type AppUser } from '../lib/auth';
import type { CartItem } from '../lib/types';
import AuthGateModal from '../components/AuthGateModal';

export default function CartPage() {
  const { navigate } = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' });

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);

  const load = async () => {
    setLoading(true);
    try { setCart(await fetchCart()); } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const total = cart.reduce((s, it) => s + Number(it.product.price) * it.quantity, 0);

  const startCheckout = () => {
    if (!getUser()) { setShowAuth(true); return; }
    if (user) setForm(f => ({ ...f, name: user.full_name, phone: user.phone }));
    setCheckout(c => !c);
  };

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) return;
    setPlacing(true);
    try {
      const u = getUser();
      const order = await createOrder({
        customer_name: form.name,
        customer_phone: form.phone,
        shipping_address_ar: form.address,
        city_ar: form.city,
        total_amount: total + (total >= 2000 ? 0 : 60),
        payment_method: 'cod',
        user_id: u?.id,
      });
      await createOrderItems(cart.map(it => ({
        order_id: order.id,
        product_id: it.product_id,
        product_name_ar: it.product.name_ar,
        color_name_ar: it.color_name_ar,
        size_label: it.size_label,
        quantity: it.quantity,
        unit_price: Number(it.product.price),
      })));
      for (const it of cart) await removeFromCart(it.id);
      setDone(true);
    } catch { /* ignore */ }
    setPlacing(false);
  };

  if (done) {
    return (
      <div className="pt-28 px-4 pb-12">
        <div className="mx-auto max-w-md glass-card rounded-3xl p-10 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center mb-4 shadow-glow animate-float-medium">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-beige-900 mb-2">تم تأكيد طلبك!</h2>
          <p className="text-beige-600 mb-6">سنتواصل معك قريباً</p>
          <button onClick={() => navigate('/track')} className="btn-premium">تتبع الطلب</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h1 className="font-display font-black text-3xl mb-6 animate-fade-in-up">
          <span className="premium-gradient-text">سلة التسوق</span>
        </h1>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-24 skeleton" />)}</div>
        ) : cart.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <p className="text-beige-600 mb-4">سلتك فارغة</p>
            <button onClick={() => navigate('/store')} className="btn-premium">تصفح المتجر</button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-3 mb-6">
              {cart.map((it, i) => (
                <div key={it.id} className="glass-card rounded-3xl p-4 flex gap-4 items-center animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                  <img src={it.product.image_url} alt={it.product.name_ar} className="w-16 h-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-beige-900 text-sm">{it.product.name_ar}</h3>
                    <span className="font-display font-bold text-blush-600">{it.product.price} ج.م</span>
                  </div>
                  <div className="flex items-center gap-2 glass rounded-full p-1">
                    <button onClick={() => updateCartQuantity(it.id, it.quantity - 1).then(load)} className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center font-bold text-beige-700">−</button>
                    <span className="w-6 text-center font-bold text-beige-900 text-sm">{it.quantity}</span>
                    <button onClick={() => updateCartQuantity(it.id, it.quantity + 1).then(load)} className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center font-bold text-beige-700">+</button>
                  </div>
                  <button onClick={() => removeFromCart(it.id).then(load)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-card rounded-3xl p-6 mb-4">
              <div className="flex justify-between text-sm text-beige-600 mb-2"><span>المجموع</span><span>{total.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between text-sm text-beige-600 mb-2"><span>الشحن</span><span>{total >= 2000 ? 'مجاني' : '60 ج.م'}</span></div>
              <div className="border-t border-white/40 pt-2 flex justify-between font-bold text-beige-900"><span>الإجمالي</span><span>{(total + (total >= 2000 ? 0 : 60)).toFixed(0)} ج.م</span></div>
            </div>

            <button onClick={startCheckout} className="btn-premium w-full mb-2">{checkout ? 'إغلاق' : 'إتمام الشراء'}</button>

            {/* Checkout form */}
            {checkout && (
              <div className="glass-card rounded-3xl p-6 mt-4 animate-scale-in space-y-3">
                <h3 className="font-display font-bold text-lg text-beige-900 mb-2">بيانات التوصيل</h3>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم" className="input-premium text-sm" />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" className="input-premium text-sm" dir="ltr" />
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="المدينة" className="input-premium text-sm" />
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="العنوان بالتفصيل" className="input-premium !rounded-2xl text-sm min-h-[60px]" />
                <button onClick={placeOrder} disabled={placing} className="btn-premium w-full">{placing ? 'جارٍ...' : 'تأكيد الطلب'}</button>
              </div>
            )}
          </>
        )}
      </div>

      <AuthGateModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={() => { setShowAuth(false); setCheckout(true); }}
        title="سجّل الدخول لإتمام الطلب"
        subtitle="يمكنك التصفح بحرية، فقط سجّل الدخول عند الشراء"
      />
    </div>
  );
}

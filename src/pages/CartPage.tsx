import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCart, updateCartQuantity, removeFromCart, createOrder } from '../lib/api';
import { getUser, onAuthChange, type AppUser } from '../lib/auth';
import type { CartItem } from '../lib/types';
import AuthGateModal from '../components/AuthGateModal';

export default function CartPage() {
  const { navigate } = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);

  const load = async () => {
    setLoading(true);
    try { setItems(await fetchCart()); } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const total = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

  const handleQty = async (id: string, q: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i));
    try { await updateCartQuantity(id, q); } catch { load(); }
  };
  const handleRemove = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try { await removeFromCart(id); } catch { load(); }
  };

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) return;
    setPlacing(true);
    try {
      const order = await createOrder({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        shipping_address_ar: form.address,
        city_ar: form.city,
        total_amount: total,
        notes_ar: form.notes,
        items: items.map(i => ({
          product_id: i.product_id,
          product_name_ar: i.product?.name_ar || '',
          color_name_ar: i.color_name_ar || undefined,
          size_label: i.size_label || undefined,
          unit_price: i.product?.price || 0,
          quantity: i.quantity,
        })),
      });
      setDone(order.order_number);
      setItems([]);
    } catch { /* ignore */ }
    setPlacing(false);
  };

  const startCheckout = () => {
    if (!getUser()) {
      setShowAuth(true);
      return;
    }
    if (user) {
      setForm(f => ({ ...f, name: user.full_name, phone: user.phone }));
    }
    setCheckout(c => !c);
  };

  if (done) {
    return (
      <div className="pt-28 px-4 pb-12">
        <div className="mx-auto max-w-md glass-card rounded-3xl p-10 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center mb-4 shadow-glow">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-beige-900 mb-2">تم استلام طلبك!</h2>
          <p className="text-beige-600 mb-1">رقم الطلب</p>
          <p className="font-display font-bold text-xl premium-gradient-text mb-6">{done}</p>
          <button onClick={() => navigate('/track')} className="btn-premium">تتبع الطلب</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-center mb-8 animate-fade-in-up">
          <span className="premium-gradient-text">سلة التسوق</span>
        </h1>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-28 skeleton" />)}</div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="font-display font-bold text-xl text-beige-800 mb-2">سلتك فارغة</h3>
            <p className="text-beige-600 mb-4">استكشف تشكيلتنا الفاخرة وأضف منتجاتك المفضلة</p>
            <button onClick={() => navigate('/store')} className="btn-premium">تصفح المتجر</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className="glass-card rounded-3xl p-4 flex gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <img src={item.product?.image_url} alt={item.product?.name_ar} className="w-24 h-32 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-beige-900 mb-1">{item.product?.name_ar}</h3>
                    <div className="text-sm text-beige-600 mb-2">
                      {item.color_name_ar && <span className="ml-2">اللون: {item.color_name_ar}</span>}
                      {item.size_label && <span>المقاس: {item.size_label}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleQty(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded-full glass font-bold">-</button>
                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => handleQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full glass font-bold">+</button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="text-red-500 text-sm hover:text-red-700 transition-colors">حذف</button>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-display font-bold text-lg text-blush-700">{((item.product?.price || 0) * item.quantity).toFixed(0)} ج.م</div>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <div className="glass-card rounded-3xl p-6 h-fit sticky top-28">
              <h3 className="font-display font-bold text-xl text-beige-900 mb-4">ملخص الطلب</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-beige-700"><span>المجموع الفرعي</span><span>{total.toFixed(0)} ج.م</span></div>
                <div className="flex justify-between text-beige-700"><span>الشحن</span><span>{total >= 2000 ? 'مجاني' : '60 ج.م'}</span></div>
                <div className="border-t border-white/40 pt-2 flex justify-between font-bold text-beige-900"><span>الإجمالي</span><span>{(total + (total >= 2000 ? 0 : 60)).toFixed(0)} ج.م</span></div>
              </div>
              <button onClick={startCheckout} className="btn-premium w-full mb-2">
                {checkout ? 'إغلاق' : 'إتمام الشراء'}
              </button>

              {checkout && (
                <div className="space-y-2 mt-4 animate-fade-in">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل *" className="input-premium text-sm" />
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف *" className="input-premium text-sm" />
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="البريد الإلكتروني" className="input-premium text-sm" />
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="المدينة *" className="input-premium text-sm" />
                  <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="العنوان التفصيلي *" className="input-premium !rounded-2xl text-sm min-h-[60px]" />
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات" className="input-premium !rounded-2xl text-sm min-h-[50px]" />
                  <button onClick={placeOrder} disabled={placing} className="btn-premium btn-gold w-full">
                    {placing ? 'جارٍ الطلب...' : 'تأكيد الطلب'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <AuthGateModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={() => {
          setShowAuth(false);
          setCheckout(true);
        }}
        title="سجّل الدخول لإتمام الطلب"
        subtitle="يمكنك التصفح بحرية، فقط سجّل الدخول عند الشراء"
      />
    </div>
  );
}

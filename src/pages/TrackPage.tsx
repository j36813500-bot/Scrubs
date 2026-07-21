import { useEffect, useState } from 'react';
import { fetchOrders, fetchOrderItems, fetchOrderByNumber } from '../lib/api';
import { useRouter } from '../lib/router';
import type { Order, OrderItem } from '../lib/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'from-gold-300 to-gold-500' },
  confirmed: { label: 'تم تأكيد الطلب', color: 'from-blush-300 to-blush-500' },
  preparing: { label: 'جاري التجهيز', color: 'from-lavender-300 to-lavender-500' },
  shipped: { label: 'تم الشحن', color: 'from-blue-300 to-blue-500' },
  out_for_delivery: { label: 'قيد التوصيل', color: 'from-cyan-300 to-cyan-500' },
  delivered: { label: 'تم التسليم', color: 'from-green-300 to-green-500' },
  cancelled: { label: 'ملغي', color: 'from-red-300 to-red-500' },
};

const MOTIVATION_TEXTS = [
  'طلبك في أمان',
  'جاري التجهيز بعناية',
  'على الطريق إليك',
  'وصل بأمان',
  'شكراً لثقتك',
];

export default function TrackPage() {
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    (async () => {
      try { setOrders(await fetchOrders()); } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  // Auto-rotate motivational messages
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setStatusMsg(MOTIVATION_TEXTS[idx]);
      idx = (idx + 1) % MOTIVATION_TEXTS.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!search) return;
    setSearching(true);
    try {
      const o = await fetchOrderByNumber(search);
      setFound(o);
      if (o) setItems(await fetchOrderItems(o.id));
    } catch { /* ignore */ }
    setSearching(false);
  };

  const showOrder = async (o: Order) => {
    setFound(o);
    setItems(await fetchOrderItems(o.id));
  };

  const stepIndex = found ? ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(found.status) : -1;

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="absolute bottom-1/4 right-10 w-64 h-64 rounded-full bg-lavender-200/20 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-4xl">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-center mb-2 animate-fade-in-up">
          <span className="premium-gradient-text">تتبع طلبك</span>
        </h1>
        <p className="text-center text-beige-600 mb-8">تابع حالة طلبك خطوة بخطوة</p>

        {/* animated 3-step progress cards */}
        {found && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { step: 1, label: 'تم تأكيد الطلب', icon: 'check', active: stepIndex >= 1 },
              { step: 2, label: 'تم شحن الطلب', icon: 'truck', active: stepIndex >= 2 },
              { step: 3, label: 'تم استلام الطلب', icon: 'box', active: stepIndex >= 3 },
            ].map((s, i) => (
              <div
                key={s.step}
                className={`glass-card rounded-3xl p-6 text-center relative overflow-hidden animate-fade-in-up transition-all duration-500 ${s.active ? 'ring-2 ring-blush-400' : 'opacity-60'}`}
                style={{ animationDelay: `${i * 120}ms`, opacity: 0 }}
              >
                {s.active && <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-blush-200/40 blur-2xl animate-breathe" />}
                {/* animated circular visual */}
                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-700 ${s.active ? 'bg-gradient-to-br from-blush-400 to-lavender-400 shadow-glow animate-float-medium' : 'bg-white/50'}`}>
                    <StepIcon name={s.icon} active={s.active} />
                  </div>
                  <div className={`text-xs font-bold mb-1 ${s.active ? 'text-blush-600' : 'text-beige-400'}`}>الخطوة {s.step}</div>
                  <div className={`font-display font-bold ${s.active ? 'text-beige-900' : 'text-beige-500'}`}>{s.label}</div>
                  {/* floating motivational text */}
                  {s.active && (
                    <div className="mt-2 h-5 overflow-hidden">
                      <span key={statusMsg} className="text-xs text-blush-500 animate-fade-in inline-block">{statusMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* status messages */}
        {found && (
          <div className="space-y-2 mb-6">
            {found.status === 'confirmed' && <StatusBanner text="تم قبول الطلب" color="from-blush-300 to-blush-500" />}
            {found.status === 'shipped' && <StatusBanner text="تم شحن طلبك — سيتم التواصل معك قريبًا." color="from-blue-300 to-blue-500" />}
            {found.status === 'delivered' && (
              <>
                <StatusBanner text="تم استلام الطلب بنجاح." color="from-green-300 to-green-500" />
                <button onClick={() => navigate(`/feedback?order=${found.id}`)} className="btn-premium w-full">
                  شاركنا تقييمك
                </button>
              </>
            )}
          </div>
        )}

        {/* search */}
        <div className="flex gap-2 max-w-xl mx-auto mb-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="SCB-XXXXX..."
            className="input-premium text-sm"
            dir="ltr"
          />
          <button onClick={handleSearch} disabled={searching} className="btn-premium whitespace-nowrap">
            {searching ? '...' : 'بحث'}
          </button>
        </div>

        {/* found order details */}
        {found && (
          <div className="glass-card rounded-3xl p-6 mb-8 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-beige-600">رقم الطلب</div>
                <div className="font-display font-bold text-xl text-beige-900">{found.order_number}</div>
              </div>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${STATUS_MAP[found.status].color} text-white text-sm font-bold`}>
                {STATUS_MAP[found.status].label}
              </div>
            </div>
            <div className="text-sm text-beige-600 mb-2">تاريخ الطلب: {new Date(found.created_at).toLocaleDateString('ar')}</div>
            <div className="text-sm text-beige-600 mb-4">العنوان: {found.shipping_address_ar} - {found.city_ar}</div>
            <div className="space-y-2 mb-4">
              {items.map(it => (
                <div key={it.id} className="glass rounded-2xl p-3 flex justify-between text-sm">
                  <span className="text-beige-800">{it.product_name_ar} × {it.quantity}</span>
                  <span className="text-blush-600 font-bold">{(Number(it.unit_price) * it.quantity).toFixed(0)} ج.م</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/40 pt-3 flex justify-between font-bold text-beige-900">
              <span>الإجمالي</span>
              <span>{found.total_amount} ج.م</span>
            </div>
          </div>
        )}

        {/* previous orders */}
        <h2 className="font-display font-bold text-xl text-beige-900 mb-4">طلباتك السابقة</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-20 skeleton" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <p className="text-beige-600">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o, i) => (
              <button
                key={o.id}
                onClick={() => showOrder(o)}
                className="w-full glass-card rounded-3xl p-4 flex items-center justify-between hover:scale-[1.02] transition-transform animate-fade-in-up text-right"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div>
                  <div className="font-bold text-beige-900">{o.order_number}</div>
                  <div className="text-sm text-beige-600">{new Date(o.created_at).toLocaleDateString('ar')} • {o.customer_name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blush-600">{o.total_amount} ج.م</span>
                  <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${STATUS_MAP[o.status].color} text-white text-xs font-bold`}>
                    {STATUS_MAP[o.status].label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBanner({ text, color }: { text: string; color: string }) {
  return (
    <div className={`glass-card rounded-2xl p-4 text-center bg-gradient-to-r ${color} text-white font-bold animate-fade-in-up`}>
      {text}
    </div>
  );
}

function StepIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `w-9 h-9 ${active ? 'text-white' : 'text-beige-400'}`;
  switch (name) {
    case 'check': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>;
    case 'truck': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'box': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>;
    default: return null;
  }
}

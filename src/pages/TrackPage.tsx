import { useEffect, useState } from 'react';
import { fetchOrders, fetchOrderItems, fetchOrderByNumber } from '../lib/api';
import type { Order, OrderItem } from '../lib/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'from-gold-300 to-gold-500' },
  confirmed: { label: 'مؤكد', color: 'from-blush-300 to-blush-500' },
  shipped: { label: 'تم الشحن', color: 'from-lavender-300 to-lavender-500' },
  delivered: { label: 'تم التوصيل', color: 'from-green-300 to-green-500' },
  cancelled: { label: 'ملغي', color: 'from-red-300 to-red-500' },
};

export default function TrackPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try { setOrders(await fetchOrders()); } catch { /* ignore */ }
      setLoading(false);
    })();
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

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-center mb-2 animate-fade-in-up">
          <span className="premium-gradient-text">تتبع الطلبات</span>
        </h1>
        <p className="text-center text-beige-600 mb-8">أدخل رقم طلبك أو اختر من طلباتك السابقة</p>

        {/* search */}
        <div className="flex gap-2 max-w-xl mx-auto mb-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="SCB-XXXXX..."
            className="input-premium text-sm"
          />
          <button onClick={handleSearch} disabled={searching} className="btn-premium whitespace-nowrap">
            {searching ? '...' : 'بحث'}
          </button>
        </div>

        {/* found order */}
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
            {/* progress */}
            <div className="flex items-center justify-between mb-6 px-2">
              {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                const idx = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(found.status);
                const active = i <= idx;
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-gradient-to-br from-blush-400 to-lavender-400 text-white' : 'bg-white/50 text-beige-400'}`}>
                      {i + 1}
                    </div>
                    {i < 3 && <div className={`flex-1 h-1 mx-1 rounded-full ${active ? 'bg-blush-300' : 'bg-white/40'}`} />}
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-beige-600 mb-2">تاريخ الطلب: {new Date(found.created_at).toLocaleDateString('ar')}</div>
            <div className="text-sm text-beige-600 mb-4">العنوان: {found.shipping_address_ar} - {found.city_ar}</div>
            <div className="space-y-2 mb-4">
              {items.map(it => (
                <div key={it.id} className="glass rounded-2xl p-3 flex justify-between text-sm">
                  <span className="text-beige-800">{it.product_name_ar} × {it.quantity}</span>
                  <span className="text-blush-600 font-bold">{(it.unit_price * it.quantity).toFixed(0)} ج.م</span>
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
            <div className="text-4xl mb-3">📦</div>
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

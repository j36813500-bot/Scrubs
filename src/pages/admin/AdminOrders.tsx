import { useEffect, useState } from 'react';
import { useRouter } from '../../lib/router';
import { fetchAllOrders, fetchAllOrderItems, updateOrderStatus, fetchOrderFeedback } from '../../lib/api';
import type { Order, OrderItem } from '../../lib/types';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم تأكيد الطلب',
  preparing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  incoming: 'الطلبات القادمة',
  shipping_soon: 'سيتم شحنها قريبًا',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'from-gold-300 to-gold-500',
  confirmed: 'from-blush-300 to-blush-500',
  preparing: 'from-lavender-300 to-lavender-500',
  shipped: 'from-blue-300 to-blue-500',
  out_for_delivery: 'from-cyan-300 to-cyan-500',
  delivered: 'from-green-300 to-green-500',
  cancelled: 'from-red-300 to-red-500',
  incoming: 'from-purple-300 to-purple-500',
  shipping_soon: 'from-orange-300 to-orange-500',
};

const CATEGORIES = [
  { key: 'confirmed', label: 'تم تأكيد الطلب' },
  { key: 'preparing', label: 'جاري التجهيز' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'out_for_delivery', label: 'قيد التوصيل' },
  { key: 'delivered', label: 'تم التسليم' },
  { key: 'incoming', label: 'الطلبات القادمة' },
  { key: 'shipping_soon', label: 'سيتم شحنها قريبًا' },
];

export default function AdminOrders() {
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [feedback, setFeedback] = useState<{ rating: number; review: string; experience: string } | null>(null);
  const [activeCat, setActiveCat] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try { setOrders(await fetchAllOrders()); } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const stats = {
    customers: new Set(orders.map(o => o.customer_phone)).size,
    totalOrders: orders.length,
    totalSales: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0),
  };

  const filtered = activeCat === 'all' ? orders : orders.filter(o => o.status === activeCat);

  const openOrder = async (o: Order) => {
    setSelected(o);
    setItems([]);
    setFeedback(null);
    try {
      setItems(await fetchAllOrderItems(o.id));
      if (o.status === 'delivered') setFeedback(await fetchOrderFeedback(o.id));
    } catch { /* ignore */ }
  };

  const advanceStatus = async (o: Order) => {
    const idx = STATUS_FLOW.indexOf(o.status as any);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    await updateOrderStatus(o.id, next);
    const updated = { ...o, status: next };
    setSelected(updated);
    setOrders(prev => prev.map(x => x.id === o.id ? updated : x));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="font-display font-black text-3xl mb-8 animate-fade-in-up">
        <span className="premium-gradient-text">إدارة الطلبات</span>
      </h1>

      {/* stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="إجمالي عدد العملاء" value={stats.customers.toString()} icon="users" onClick={() => navigate('/admin/feedback')} />
        <StatCard label="إجمالي الطلبات" value={stats.totalOrders.toString()} icon="orders" onClick={() => navigate('/admin/orders')} active />
        <StatCard label="إجمالي المبيعات" value={`${stats.totalSales.toFixed(0)} ج.م`} icon="sales" onClick={() => navigate('/admin/sales')} />
      </div>

      {/* category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCat === 'all' ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'glass text-beige-600'}`}
        >
          الكل
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCat(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCat === c.key ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'glass text-beige-600'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* orders list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-20 skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-beige-600">لا توجد طلبات في هذا التصنيف</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o, i) => (
            <button
              key={o.id}
              onClick={() => openOrder(o)}
              className="w-full glass-card rounded-3xl p-4 flex items-center justify-between hover:scale-[1.01] transition-transform animate-fade-in-up text-right"
              style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
            >
              <div>
                <div className="font-bold text-beige-900">{o.order_number}</div>
                <div className="text-sm text-beige-600">{o.customer_name} • {o.customer_phone}</div>
                <div className="text-xs text-beige-500">{new Date(o.created_at).toLocaleDateString('ar')}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blush-600">{Number(o.total_amount).toFixed(0)} ج.م</span>
                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${STATUS_COLORS[o.status] || 'from-gray-300 to-gray-500'} text-white text-xs font-bold`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* order modal */}
      {selected && (
        <OrderModal
          order={selected}
          items={items}
          feedback={feedback}
          onClose={() => setSelected(null)}
          onAdvance={advanceStatus}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, onClick, active }: { label: string; value: string; icon: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`glass-card rounded-3xl p-6 text-right relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 animate-fade-in-up ${active ? 'ring-2 ring-blush-400' : ''}`}
    >
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blush-200/30 blur-2xl animate-breathe" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="text-sm text-beige-600 mb-1">{label}</div>
          <div className="font-display font-black text-3xl premium-gradient-text">{value}</div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blush-300 to-lavender-300 flex items-center justify-center group-hover:rotate-6 transition-transform">
          <StatIcon name={icon} />
        </div>
      </div>
    </button>
  );
}

function StatIcon({ name }: { name: string }) {
  const cls = 'w-7 h-7 text-white';
  switch (name) {
    case 'users': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'orders': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    case 'sales': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    default: return null;
  }
}

function OrderModal({ order, items, feedback, onClose, onAdvance }: {
  order: Order; items: OrderItem[]; feedback: { rating: number; review: string; experience: string } | null;
  onClose: () => void; onAdvance: (o: Order) => void;
}) {
  const canAdvance = STATUS_FLOW.indexOf(order.status as any) >= 0 && STATUS_FLOW.indexOf(order.status as any) < STATUS_FLOW.length - 1;
  const nextStatus = canAdvance ? STATUS_FLOW[STATUS_FLOW.indexOf(order.status as any) + 1] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(20,10,30,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="glass-card rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-beige-500">رقم الطلب</div>
            <div className="font-display font-bold text-xl text-beige-900">{order.order_number}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${STATUS_COLORS[order.status]} text-white text-sm font-bold`}>
              {STATUS_LABELS[order.status]}
            </span>
            <button onClick={onClose} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-red-100 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* customer info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoBox label="اسم العميل" value={order.customer_name} />
          <InfoBox label="رقم الهاتف" value={order.customer_phone} />
          <InfoBox label="العنوان" value={`${order.shipping_address_ar} - ${order.city_ar}`} />
          <InfoBox label="طريقة الدفع" value={order.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة'} />
          <InfoBox label="تاريخ الطلب" value={new Date(order.created_at).toLocaleDateString('ar')} />
          <InfoBox label="ملاحظات التوصيل" value={order.notes_ar || 'لا توجد'} />
        </div>

        {/* items */}
        <h3 className="font-display font-bold text-beige-900 mb-3">المنتجات</h3>
        <div className="space-y-2 mb-6">
          {items.map(it => (
            <div key={it.id} className="glass rounded-2xl p-3 flex gap-3 items-center">
              <img src={(it as any).product?.image_url || ''} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="font-bold text-beige-900 text-sm">{it.product_name_ar}</div>
                <div className="text-xs text-beige-600">
                  {it.color_name_ar && <span>اللون: {it.color_name_ar} </span>}
                  {it.size_label && <span>المقاس: {it.size_label}</span>}
                  <span> × {it.quantity}</span>
                </div>
              </div>
              <div className="font-bold text-blush-600 text-sm">{(Number(it.unit_price) * it.quantity).toFixed(0)} ج.م</div>
            </div>
          ))}
        </div>

        {/* total */}
        <div className="border-t border-white/40 pt-4 flex justify-between font-bold text-beige-900 mb-6">
          <span>الإجمالي</span>
          <span>{Number(order.total_amount).toFixed(0)} ج.م</span>
        </div>

        {/* feedback */}
        {feedback && (
          <div className="glass rounded-2xl p-4 mb-6">
            <h4 className="font-bold text-beige-900 mb-2">تقييم العميل</h4>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < feedback.rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <p className="text-sm text-beige-700">{feedback.review}</p>
            {feedback.experience && <p className="text-xs text-beige-500 mt-1">{feedback.experience}</p>}
          </div>
        )}

        {/* status control */}
        {canAdvance && nextStatus && (
          <button
            onClick={() => onAdvance(order)}
            className="btn-premium w-full"
          >
            تغيير الحالة إلى: {STATUS_LABELS[nextStatus]}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="text-xs text-beige-500 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-beige-900">{value}</div>
    </div>
  );
}

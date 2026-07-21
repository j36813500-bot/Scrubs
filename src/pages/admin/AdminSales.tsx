import { useEffect, useState } from 'react';
import { fetchAllOrders } from '../../lib/api';
import type { Order } from '../../lib/types';

export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setOrders(await fetchAllOrders()); } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((s, o) => s + Number(o.total_amount), 0);
  const shippingIncome = delivered.length * 60;
  const avgOrder = delivered.length > 0 ? totalRevenue / delivered.length : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="font-display font-black text-3xl mb-8 animate-fade-in-up">
        <span className="premium-gradient-text">المبيعات</span>
      </h1>

      {/* revenue stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <RevenueCard label="إجمالي الإيرادات" value={`${totalRevenue.toFixed(0)} ج.م`} icon="revenue" />
        <RevenueCard label="دخل الشحن" value={`${shippingIncome.toFixed(0)} ج.م`} icon="shipping" />
        <RevenueCard label="متوسط الطلب" value={`${avgOrder.toFixed(0)} ج.م`} icon="avg" />
        <RevenueCard label="طلبات مكتملة" value={delivered.length.toString()} icon="done" />
      </div>

      {/* completed sales table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-16 skeleton" />)}</div>
      ) : delivered.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-beige-600">لا توجد مبيعات مكتملة بعد</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/40 text-sm font-bold text-beige-700">
            <div>رقم الطلب</div>
            <div>العميل</div>
            <div>التاريخ</div>
            <div className="text-left">المبلغ</div>
          </div>
          {delivered.map((o, i) => (
            <div key={o.id} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/20 hover:bg-white/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="font-bold text-beige-900 text-sm">{o.order_number}</div>
              <div className="text-sm text-beige-700">{o.customer_name}</div>
              <div className="text-sm text-beige-600">{new Date(o.created_at).toLocaleDateString('ar')}</div>
              <div className="text-left font-bold text-blush-600 text-sm">{Number(o.total_amount).toFixed(0)} ج.م</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden animate-fade-in-up">
      <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-lavender-200/30 blur-2xl animate-breathe" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-300 to-blush-400 flex items-center justify-center mb-3">
          <RevIcon name={icon} />
        </div>
        <div className="text-sm text-beige-600 mb-1">{label}</div>
        <div className="font-display font-black text-2xl premium-gradient-text">{value}</div>
      </div>
    </div>
  );
}

function RevIcon({ name }: { name: string }) {
  const cls = 'w-6 h-6 text-white';
  switch (name) {
    case 'revenue': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case 'shipping': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'avg': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>;
    case 'done': return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    default: return null;
  }
}

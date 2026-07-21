import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { fetchCustomerOrders, fetchOrderItems, fetchFavorites, fetchAddresses, addAddress, deleteAddress, fetchProducts, addToCart } from '../lib/api';
import { onAuthChange, signOut, updateProfile, changePassword, uploadAvatar, type AppUser } from '../lib/auth';
import type { Order, Product, SavedAddress } from '../lib/types';

type Tab = 'overview' | 'orders' | 'favorites' | 'addresses' | 'settings';

export default function ProfilePage() {
  const { navigate } = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    const unsub = onAuthChange(u => { setUser(u); setChecked(true); });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [o, favs, addrs, prods] = await Promise.all([fetchCustomerOrders(), fetchFavorites(), fetchAddresses(), fetchProducts()]);
        setOrders(o); setAddresses(addrs);
        const favIds = new Set(favs.map(f => f.product_id));
        setFavorites(prods.filter(p => favIds.has(p.id)));
      } catch { /* ignore */ }
    })();
  }, [user]);

  if (!checked) return <div className="pt-28 px-4 pb-12 min-h-screen flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-blush-200 border-t-blush-500 animate-spin" /></div>;

  if (!user) {
    return (
      <div className="pt-28 px-4 pb-12 min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blush-300 to-lavender-400 flex items-center justify-center mb-4 shadow-glow">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="font-display font-bold text-xl text-beige-900 mb-2">حسابي</h2>
          <p className="text-beige-600 mb-6">سجّل الدخول للوصول إلى حسابك الشخصي</p>
          <button onClick={() => navigate('/auth')} className="btn-premium">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  const completed = orders.filter(o => o.status === 'delivered');
  const active = orders.filter(o => ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status));
  const cancelled = orders.filter(o => o.status === 'cancelled');

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blush-200/20 blur-3xl animate-breathe" />
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-lavender-200/20 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blush-200/30 blur-2xl animate-breathe" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush-300 to-lavender-400 flex items-center justify-center shadow-glow overflow-hidden">
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-display font-bold text-4xl">{user.full_name?.[0] || 'س'}</span>}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <h1 className="font-display font-black text-2xl text-beige-900">{user.full_name || 'عميل'}</h1>
              <p className="text-beige-600 text-sm">{user.phone}</p>
              <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blush-200 to-lavender-200 text-blush-800 text-xs font-bold">{orders.length} طلب</span>
              </div>
            </div>
            <button onClick={() => { signOut(); navigate('/'); }} className="glass rounded-full px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">خروج</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {[
            { key: 'overview', label: 'نظرة عامة' },
            { key: 'orders', label: 'طلباتي' },
            { key: 'favorites', label: 'المفضلة' },
            { key: 'addresses', label: 'العناوين' },
            { key: 'settings', label: 'الإعدادات' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)} className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${tab === t.key ? 'bg-gradient-to-r from-blush-400 to-lavender-400 text-white shadow-glow' : 'glass text-beige-600'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'طلبات نشطة', value: active.length, color: 'from-blush-300 to-blush-500' },
                { label: 'مكتملة', value: completed.length, color: 'from-green-300 to-green-500' },
                { label: 'ملغية', value: cancelled.length, color: 'from-red-300 to-red-500' },
                { label: 'المفضلة', value: favorites.length, color: 'from-lavender-300 to-lavender-500' },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-3xl p-5 text-center relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                  <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
                  <div className="font-display font-black text-2xl premium-gradient-text">{s.value}</div>
                  <div className="text-xs text-beige-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-beige-900 mb-4">أحدث الطلبات</h3>
              {orders.slice(0, 3).map((o, i) => (
                <button key={o.id} onClick={() => navigate('/track')} className="w-full glass-card rounded-3xl p-4 flex items-center justify-between hover:scale-[1.01] transition-transform animate-fade-in-up text-right mb-3" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                  <div><div className="font-bold text-beige-900 text-sm">{o.order_number}</div><div className="text-xs text-beige-600">{new Date(o.created_at).toLocaleDateString('ar')}</div></div>
                  <span className="font-bold text-blush-600 text-sm">{Number(o.total_amount).toFixed(0)} ج.م</span>
                </button>
              ))}
              {orders.length === 0 && <div className="glass-card rounded-3xl p-8 text-center text-beige-600">لا توجد طلبات بعد</div>}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-beige-600">لا توجد طلبات</div>
            ) : (
              <div className="space-y-3">
                {orders.map((o, i) => (
                  <div key={o.id} className="glass-card rounded-3xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <div><div className="font-bold text-beige-900">{o.order_number}</div><div className="text-xs text-beige-600">{new Date(o.created_at).toLocaleDateString('ar')}</div></div>
                      <span className="font-bold text-blush-600">{Number(o.total_amount).toFixed(0)} ج.م</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => navigate('/track')} className="flex-1 glass rounded-full py-2 text-xs font-bold text-beige-700 hover:bg-white/70 transition-colors">تتبع</button>
                      <button onClick={async () => { const items = await fetchOrderItems(o.id); for (const it of items) await addToCart({ product_id: it.product_id, quantity: it.quantity }); navigate('/cart'); }} className="flex-1 glass rounded-full py-2 text-xs font-bold text-blush-600 hover:bg-white/70 transition-colors">إعادة الطلب</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          favorites.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center"><p className="text-beige-600 mb-4">لا توجد منتجات في المفضلة</p><button onClick={() => navigate('/store')} className="btn-premium">تصفح المتجر</button></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.map((p, i) => (
                <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)} className="glass-card rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform animate-fade-in-up text-right" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                  <img src={p.image_url} alt={p.name_ar} className="w-full aspect-[3/4] object-cover" />
                  <div className="p-3"><div className="font-bold text-beige-900 text-sm line-clamp-1">{p.name_ar}</div><div className="font-display font-bold text-blush-600">{p.price} ج.م</div></div>
                </button>
              ))}
            </div>
          )
        )}

        {tab === 'addresses' && <AddressesTab addresses={addresses} onReload={async () => setAddresses(await fetchAddresses())} />}

        {tab === 'settings' && <SettingsTab user={user} />}
      </div>
    </div>
  );
}

function AddressesTab({ addresses, onReload }: { addresses: SavedAddress[]; onReload: () => Promise<void> }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'المنزل', recipient_name: '', phone: '', address_ar: '', city_ar: '' });

  const handleAdd = async () => {
    if (!form.recipient_name || !form.phone || !form.address_ar || !form.city_ar) return;
    try { await addAddress(form); setForm({ label: 'المنزل', recipient_name: '', phone: '', address_ar: '', city_ar: '' }); setShowForm(false); await onReload(); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-beige-900">العناوين المحفوظة</h3>
        <button onClick={() => setShowForm(s => !s)} className="btn-premium text-sm">+ عنوان جديد</button>
      </div>
      {showForm && (
        <div className="glass-card rounded-3xl p-6 mb-4 animate-scale-in space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="الاسم (المنزل/العمل)" className="input-premium text-sm" />
            <input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} placeholder="اسم المستلم" className="input-premium text-sm" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" className="input-premium text-sm" dir="ltr" />
            <input value={form.city_ar} onChange={e => setForm({ ...form, city_ar: e.target.value })} placeholder="المدينة" className="input-premium text-sm" />
          </div>
          <input value={form.address_ar} onChange={e => setForm({ ...form, address_ar: e.target.value })} placeholder="العنوان بالتفصيل" className="input-premium text-sm" />
          <button onClick={handleAdd} className="btn-premium w-full">حفظ العنوان</button>
        </div>
      )}
      {addresses.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-beige-600">لا توجد عناوين محفوظة</div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a, i) => (
            <div key={a.id} className="glass-card rounded-3xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-blush-100 text-blush-700 text-xs font-bold mb-1 inline-block">{a.label}</span>
                  <div className="font-bold text-beige-900 text-sm">{a.recipient_name}</div>
                  <div className="text-sm text-beige-600">{a.phone}</div>
                  <div className="text-sm text-beige-600">{a.address_ar} - {a.city_ar}</div>
                </div>
                <button onClick={async () => { await deleteAddress(a.id); await onReload(); }} className="glass rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user }: { user: AppUser }) {
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone, avatar_url: user.avatar_url || '' });
  const [pwd, setPwd] = useState({ new: '', confirm: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    const res = await updateProfile({ full_name: form.full_name, phone: form.phone, avatar_url: form.avatar_url || undefined });
    setMsg(res.error || 'تم الحفظ بنجاح');
    setSavingInfo(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSavePwd = async () => {
    if (pwd.new !== pwd.confirm) { setPwdMsg('كلمتا المرور غير متطابقتين'); return; }
    if (pwd.new.length < 6) { setPwdMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setSavingPwd(true);
    const res = await changePassword(pwd.new);
    setPwdMsg(res.error || 'تم تغيير كلمة المرور بنجاح');
    setPwd({ new: '', confirm: '' });
    setSavingPwd(false);
    setTimeout(() => setPwdMsg(''), 3000);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url, error } = await uploadAvatar(file);
    if (url) { setForm(f => ({ ...f, avatar_url: url })); await updateProfile({ avatar_url: url }); setMsg('تم تحديث الصورة'); setTimeout(() => setMsg(''), 3000); }
    else setMsg(error || 'فشل رفع الصورة');
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6 animate-fade-in-up">
        <h3 className="font-display font-bold text-lg text-beige-900 mb-4">الصورة الشخصية</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blush-300 to-lavender-400 flex items-center justify-center overflow-hidden shadow-glow">
            {form.avatar_url ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-display font-bold text-3xl">{form.full_name?.[0] || 'س'}</span>}
          </div>
          <label className="btn-ghost text-sm cursor-pointer">تغيير الصورة<input type="file" accept="image/*" onChange={handleAvatar} className="hidden" /></label>
        </div>
      </div>
      <div className="glass-card rounded-3xl p-6 animate-fade-in-up">
        <h3 className="font-display font-bold text-lg text-beige-900 mb-4">المعلومات الشخصية</h3>
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-beige-700 mb-1">الاسم</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-premium text-sm" /></div>
          <div><label className="block text-xs font-bold text-beige-700 mb-1">رقم الهاتف</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-premium text-sm" dir="ltr" /></div>
          {msg && <p className="text-sm text-center text-blush-600 font-bold">{msg}</p>}
          <button onClick={handleSaveInfo} disabled={savingInfo} className="btn-premium w-full">{savingInfo ? 'جارٍ...' : 'حفظ التغييرات'}</button>
        </div>
      </div>
      <div className="glass-card rounded-3xl p-6 animate-fade-in-up">
        <h3 className="font-display font-bold text-lg text-beige-900 mb-4">تغيير كلمة المرور</h3>
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-beige-700 mb-1">كلمة المرور الجديدة</label><input type="password" value={pwd.new} onChange={e => setPwd({ ...pwd, new: e.target.value })} className="input-premium text-sm" dir="ltr" /></div>
          <div><label className="block text-xs font-bold text-beige-700 mb-1">تأكيد كلمة المرور</label><input type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} className="input-premium text-sm" dir="ltr" /></div>
          {pwdMsg && <p className="text-sm text-center text-blush-600 font-bold">{pwdMsg}</p>}
          <button onClick={handleSavePwd} disabled={savingPwd} className="btn-premium w-full">{savingPwd ? 'جارٍ...' : 'تغيير كلمة المرور'}</button>
        </div>
      </div>
    </div>
  );
}

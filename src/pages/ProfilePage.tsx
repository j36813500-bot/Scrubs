import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../lib/router'
import {
  getUser,
  signOut,
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../lib/auth'
import {
  fetchCustomerOrders,
  fetchFavorites,
  fetchAddresses,
  addAddress,
  deleteAddress,
} from '../lib/api'
import type { Profile, Order, Favorite, SavedAddress, Product } from '../lib/types'
import ProductCard from '../components/ProductCard'

// ── Tab type ──────────────────────────────────────────────────────
type Tab = 'overview' | 'orders' | 'favorites' | 'addresses' | 'settings'

// ── Stat card (inline) ────────────────────────────────────────────
interface MiniStatProps {
  title: string
  value: string | number
  icon: JSX.Element
  color: string
}

function MiniStat({ title, value, icon, color }: MiniStatProps): JSX.Element {
  return (
    <div className="glass-card relative overflow-hidden p-5 animate-fade-in-up">
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl glass"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────
interface OverviewTabProps {
  user: Profile | null
  orders: Order[]
  favoritesCount: number
  onTabChange: (tab: Tab) => void
}

function OverviewTab({ user, orders, favoritesCount, onTabChange }: OverviewTabProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card p-6 text-center animate-fade-in-up">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full glass shadow-premium overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-extrabold text-gray-800">
          مرحباً، {user?.full_name || 'عميلنا العزيز'} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          إدارة حسابك وطلباتك من مكان واحد
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MiniStat
          title="الطلبات"
          value={orders.length}
          color="#e85c8a"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11H3v9h6v-9z" />
              <path d="M21 11h-6v9h6v-9z" />
              <path d="M15 3H9v8h6V3z" />
            </svg>
          }
        />
        <MiniStat
          title="المفضلة"
          value={favoritesCount}
          color="#916dba"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <MiniStat
          title="عضو منذ"
          value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }) : '—'}
          color="#f59e0b"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-gray-800">أحدث الطلبات</h3>
          <button onClick={(): void => onTabChange('orders')} className="text-sm font-bold text-blush-600 hover:text-blush-700 transition-colors">
            عرض الكل
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500 text-sm">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order: Order) => (
              <div key={order.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800" dir="ltr">{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-extrabold premium-gradient-text">{order.total_amount} ج.م</p>
                  <span className="text-xs text-gray-500">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Orders tab ────────────────────────────────────────────────────
interface OrdersTabProps {
  orders: Order[]
  loading: boolean
  onTrack: (orderNumber: string) => void
  onReorder: (order: Order) => void
}

function OrdersTab({ orders, loading, onTrack, onReorder }: OrdersTabProps): JSX.Element {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="shimmer-bg animate-pulse h-5 w-1/3 rounded-full mb-2" />
            <div className="shimmer-bg animate-pulse h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-500 text-sm">لا توجد طلبات بعد</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order) => (
        <div key={order.id} className="glass-card p-5 animate-fade-in-up">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-extrabold text-gray-800" dir="ltr">{order.order_number}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <span className="rounded-full glass px-3 py-1 text-xs font-bold text-lavender-600">
              {statusMap[order.status] || order.status}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <p>{order.customer_name}</p>
              <p className="text-xs">{order.city_ar}</p>
            </div>
            <p className="text-lg font-extrabold premium-gradient-text">{order.total_amount} ج.م</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(): void => onTrack(order.order_number)}
              className="btn-premium flex-1 text-sm"
            >
              تتبع الطلب
            </button>
            <button
              onClick={(): void => onReorder(order)}
              className="btn-ghost flex-1 text-sm"
            >
              إعادة الطلب
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Favorites tab ─────────────────────────────────────────────────
interface FavoritesTabProps {
  favorites: Favorite[]
  loading: boolean
  onProductClick: (slug: string) => void
}

function FavoritesTab({ favorites, loading, onProductClick }: FavoritesTabProps): JSX.Element {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <div className="shimmer-bg animate-pulse aspect-square rounded-t-3xl" />
            <div className="p-4 space-y-2">
              <div className="shimmer-bg animate-pulse h-4 w-3/4 rounded-full" />
              <div className="shimmer-bg animate-pulse h-6 w-1/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-500 text-sm">لا توجد منتجات في المفضلة بعد</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {favorites.map((fav: Favorite) => {
        const product: Product | undefined = fav.product
        if (!product) return null
        return (
          <ProductCard
            key={fav.id}
            product={product}
            onClick={(): void => onProductClick(product.slug)}
          />
        )
      })}
    </div>
  )
}

// ── Addresses tab ─────────────────────────────────────────────────
interface AddressesTabProps {
  addresses: SavedAddress[]
  loading: boolean
  onAdd: (addr: { recipient_name: string; phone: string; address: string; city: string; label?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function AddressesTab({ addresses, loading, onAdd, onDelete }: AddressesTabProps): JSX.Element {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [recipientName, setRecipientName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [label, setLabel] = useState<string>('المنزل')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!recipientName.trim() || !phone.trim() || !address.trim() || !city.trim()) return
    setSubmitting(true)
    try {
      await onAdd({ recipient_name: recipientName, phone, address, city, label })
      setRecipientName('')
      setPhone('')
      setAddress('')
      setCity('')
      setLabel('المنزل')
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add address:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="shimmer-bg animate-pulse h-5 w-1/4 rounded-full mb-2" />
            <div className="shimmer-bg animate-pulse h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <button
        onClick={(): void => setShowForm(!showForm)}
        className="btn-premium w-full"
      >
        {showForm ? 'إلغاء' : 'إضافة عنوان جديد'}
      </button>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="glass-card p-6 space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">اسم المستلم</label>
            <input type="text" value={recipientName} onChange={(e): void => setRecipientName(e.target.value)} placeholder="اسم المستلم" className="input-premium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
            <input type="tel" value={phone} onChange={(e): void => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="input-premium" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">العنوان</label>
            <input type="text" value={address} onChange={(e): void => setAddress(e.target.value)} placeholder="العنوان بالتفصيل" className="input-premium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">المدينة</label>
              <input type="text" value={city} onChange={(e): void => setCity(e.target.value)} placeholder="المدينة" className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">النوع</label>
              <select value={label} onChange={(e): void => setLabel(e.target.value)} className="input-premium">
                <option value="المنزل">المنزل</option>
                <option value="العمل">العمل</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-premium w-full disabled:opacity-60">
            {submitting ? 'جارٍ الحفظ...' : 'حفظ العنوان'}
          </button>
        </form>
      )}

      {/* Addresses list */}
      {addresses.length === 0 && !showForm ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-500 text-sm">لا توجد عناوين محفوظة</p>
        </div>
      ) : (
        addresses.map((addr: SavedAddress) => (
          <div key={addr.id} className="glass-card p-5 animate-fade-in-up">
            <div className="flex items-start justify-between mb-2">
              <span className="rounded-full glass px-3 py-1 text-xs font-bold text-lavender-600">
                {addr.label}
              </span>
              <button
                onClick={(): Promise<void> => onDelete(addr.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="حذف"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <p className="font-bold text-gray-800">{addr.recipient_name}</p>
            <p className="text-sm text-gray-500" dir="ltr">{addr.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{addr.address_ar}، {addr.city_ar}</p>
          </div>
        ))
      )}
    </div>
  )
}

// ── Settings tab ───────────────────────────────────────────────────
interface SettingsTabProps {
  user: Profile | null
  onAvatarUpload: (file: File) => Promise<void>
  onProfileUpdate: (updates: { full_name?: string; phone?: string; email?: string }) => Promise<void>
  onPasswordChange: (newPassword: string) => Promise<void>
  onLogout: () => void
}

function SettingsTab({ user, onAvatarUpload, onProfileUpdate, onPasswordChange, onLogout }: SettingsTabProps): JSX.Element {
  const [fullName, setFullName] = useState<string>(user?.full_name || '')
  const [phone, setPhone] = useState<string>(user?.phone || '')
  const [email, setEmail] = useState<string>(user?.email || '')
  const [newPassword, setNewPassword] = useState<string>('')
  const [savingProfile, setSavingProfile] = useState<boolean>(false)
  const [savingPassword, setSavingPassword] = useState<boolean>(false)
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)

  useEffect((): void => {
    setFullName(user?.full_name || '')
    setPhone(user?.phone || '')
    setEmail(user?.email || '')
  }, [user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      await onAvatarUpload(file)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleProfileSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      await onProfileUpdate({ full_name: fullName, phone, email })
      setProfileMsg('تم تحديث البيانات بنجاح')
    } catch (err) {
      setProfileMsg('حدث خطأ أثناء التحديث')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setSavingPassword(true)
    setPasswordMsg(null)
    try {
      await onPasswordChange(newPassword)
      setNewPassword('')
      setPasswordMsg('تم تغيير كلمة المرور بنجاح')
    } catch (err) {
      setPasswordMsg('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <div className="glass-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full glass shadow-premium overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <label className="btn-ghost cursor-pointer inline-block text-sm">
          {uploadingAvatar ? 'جارٍ الرفع...' : 'تغيير الصورة'}
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
        </label>
      </div>

      {/* Personal info */}
      <form onSubmit={handleProfileSave} className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-extrabold premium-gradient-text">البيانات الشخصية</h3>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم الكامل</label>
          <input type="text" value={fullName} onChange={(e): void => setFullName(e.target.value)} placeholder="اسمك الكامل" className="input-premium" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
          <input type="tel" value={phone} onChange={(e): void => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="input-premium" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
          <input type="email" value={email} onChange={(e): void => setEmail(e.target.value)} placeholder="email@example.com" className="input-premium" dir="ltr" />
        </div>
        {profileMsg && (
          <div className="rounded-2xl bg-green-50/80 border border-green-200 px-4 py-3 text-sm font-bold text-green-700 animate-fade-in">
            {profileMsg}
          </div>
        )}
        <button type="submit" disabled={savingProfile} className="btn-premium w-full disabled:opacity-60">
          {savingProfile ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-extrabold premium-gradient-text">تغيير كلمة المرور</h3>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
          <input type="password" value={newPassword} onChange={(e): void => setNewPassword(e.target.value)} placeholder="••••••••" className="input-premium" autoComplete="new-password" />
        </div>
        {passwordMsg && (
          <div className="rounded-2xl bg-green-50/80 border border-green-200 px-4 py-3 text-sm font-bold text-green-700 animate-fade-in">
            {passwordMsg}
          </div>
        )}
        <button type="submit" disabled={savingPassword} className="btn-premium w-full disabled:opacity-60">
          {savingPassword ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
        </button>
      </form>

      {/* Logout */}
      <button onClick={onLogout} className="btn-ghost w-full text-red-600 border-red-200">
        تسجيل الخروج
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function ProfilePage(): JSX.Element {
  const { navigate } = useRouter()

  const [user, setUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true)
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true)
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true)
  const [userLoading, setUserLoading] = useState<boolean>(true)

  // Load user
  const loadUser = useCallback(async (): Promise<void> => {
    try {
      const u: Profile | null = await getUser()
      setUser(u)
    } catch (err) {
      console.error('Failed to load user:', err)
    } finally {
      setUserLoading(false)
    }
  }, [])

  useEffect((): void => {
    loadUser()
  }, [loadUser])

  // Load orders
  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Order[] = await fetchCustomerOrders()
        setOrders(data)
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setOrdersLoading(false)
      }
    })()
  }, [])

  // Load favorites
  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: Favorite[] = await fetchFavorites()
        setFavorites(data)
      } catch (err) {
        console.error('Failed to load favorites:', err)
      } finally {
        setFavoritesLoading(false)
      }
    })()
  }, [])

  // Load addresses
  useEffect((): void => {
    (async (): Promise<void> => {
      try {
        const data: SavedAddress[] = await fetchAddresses()
        setAddresses(data)
      } catch (err) {
        console.error('Failed to load addresses:', err)
      } finally {
        setAddressesLoading(false)
      }
    })()
  }, [])

  // Handlers
  const handleTrack = (orderNumber: string): void => {
    navigate(`/track?order=${orderNumber}`)
  }

  const handleReorder = (_order: Order): void => {
    navigate('/store')
  }

  const handleAddAddress = async (addr: { recipient_name: string; phone: string; address: string; city: string; label?: string }): Promise<void> => {
    await addAddress(addr)
    const data: SavedAddress[] = await fetchAddresses()
    setAddresses(data)
  }

  const handleDeleteAddress = async (id: string): Promise<void> => {
    await deleteAddress(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const handleAvatarUpload = async (file: File): Promise<void> => {
    const { url, error } = await uploadAvatar(file)
    if (error) throw new Error(error)
    if (url) {
      setUser((prev) => prev ? { ...prev, avatar_url: url } : prev)
    }
  }

  const handleProfileUpdate = async (updates: { full_name?: string; phone?: string; email?: string }): Promise<void> => {
    const { error } = await updateProfile(updates)
    if (error) throw new Error(error.message)
    await loadUser()
  }

  const handlePasswordChange = async (newPassword: string): Promise<void> => {
    const { error } = await changePassword(newPassword)
    if (error) throw new Error(error.message)
  }

  const handleLogout = async (): Promise<void> => {
    await signOut()
    navigate('/')
  }

  // Tab definitions
  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    },
    {
      id: 'orders',
      label: 'الطلبات',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H3v9h6v-9z" /><path d="M21 11h-6v9h6v-9z" /><path d="M15 3H9v8h6V3z" /></svg>,
    },
    {
      id: 'favorites',
      label: 'المفضلة',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    },
    {
      id: 'addresses',
      label: 'العناوين',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    },
  ]

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24" dir="rtl">
        <div className="glass-card p-8 text-center">
          <svg className="animate-spin mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
          <p className="text-gray-600 font-bold">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24" dir="rtl">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-gray-800">يجب تسجيل الدخول</h2>
          <p className="mb-6 text-sm text-gray-500">سجل دخولك للوصول إلى حسابك</p>
          <button onClick={(): void => navigate('/auth')} className="btn-premium w-full">
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-10" dir="rtl">
      {/* ── Header ── */}
      <section className="px-4 pt-24 pb-6 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold premium-gradient-text">
            حسابي
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            مرحباً، {user.full_name || 'عميلنا العزيز'}
          </p>
        </div>
      </section>

      {/* ── Tabs ── */}
      <section className="px-4 mb-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(): void => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'btn-premium'
                    : 'glass text-gray-600 hover:text-blush-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab content ── */}
      <section className="px-4">
        <div className="mx-auto max-w-7xl">
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              orders={orders}
              favoritesCount={favorites.length}
              onTabChange={setActiveTab}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              loading={ordersLoading}
              onTrack={handleTrack}
              onReorder={handleReorder}
            />
          )}
          {activeTab === 'favorites' && (
            <FavoritesTab
              favorites={favorites}
              loading={favoritesLoading}
              onProductClick={(slug: string): void => navigate(`/product/${slug}`)}
            />
          )}
          {activeTab === 'addresses' && (
            <AddressesTab
              addresses={addresses}
              loading={addressesLoading}
              onAdd={handleAddAddress}
              onDelete={handleDeleteAddress}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              user={user}
              onAvatarUpload={handleAvatarUpload}
              onProfileUpdate={handleProfileUpdate}
              onPasswordChange={handlePasswordChange}
              onLogout={handleLogout}
            />
          )}
        </div>
      </section>
    </div>
  )
}

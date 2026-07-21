import { useEffect, useState, useMemo } from 'react'
import { fetchAllProfiles, fetchOrders } from '../../lib/api'
import type { Profile, Order } from '../../lib/types'

interface CustomerRow {
  profile: Profile
  orderCount: number
  totalSpent: number
}

export default function AdminCustomers(): JSX.Element {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    let mounted = true
    Promise.all([fetchAllProfiles(), fetchOrders()])
      .then(([p, o]) => {
        if (!mounted) return
        setProfiles(p as Profile[])
        setOrders(o)
      })
      .catch((err: unknown) => {
        console.error('Failed to load customers:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const customerRows: CustomerRow[] = useMemo(() => {
    return profiles.map((profile) => {
      const userOrders = orders.filter(
        (o) => o.user_id === profile.id
      )
      const orderCount = userOrders.length
      const totalSpent = userOrders
        .filter((o) => o.status === 'delivered' || o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0)
      return { profile, orderCount, totalSpent }
    })
  }, [profiles, orders])

  const filteredRows: CustomerRow[] = useMemo(() => {
    if (!search) return customerRows
    const q = search.toLowerCase()
    return customerRows.filter(
      (r) =>
        (r.profile.full_name || '').toLowerCase().includes(q) ||
        (r.profile.phone || '').toLowerCase().includes(q) ||
        (r.profile.email || '').toLowerCase().includes(q)
    )
  }, [customerRows, search])

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold premium-gradient-text">إدارة العملاء</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">
            قائمة بجميع العملاء المسجلين في المتجر
          </p>
        </div>

        {/* Search */}
        <div className="glass-card mb-6 p-4">
          <div className="relative">
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#916dba"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pr-10"
              placeholder="ابحث بالاسم أو الهاتف أو البريد..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500">لا يوجد عملاء</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="glass-card hidden overflow-x-auto no-scrollbar p-6 md:block">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-blush-100 text-xs font-bold text-gray-500">
                    <th className="pb-3 pr-2">العميل</th>
                    <th className="pb-3 pr-2">الهاتف</th>
                    <th className="pb-3 pr-2">البريد الإلكتروني</th>
                    <th className="pb-3 pr-2">تاريخ الانضمام</th>
                    <th className="pb-3 pr-2">عدد الطلبات</th>
                    <th className="pb-3 pr-2">إجمالي الإنفاق</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr
                      key={row.profile.id}
                      className="border-b border-blush-50 transition-colors hover:bg-blush-50/40 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <td className="py-4 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full glass text-sm font-extrabold premium-gradient-text">
                            {(row.profile.full_name || '؟').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {row.profile.full_name || 'بدون اسم'}
                            </p>
                            {row.profile.role === 'admin' && (
                              <span className="text-xs font-bold text-blush-600">مدير</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-2 text-sm text-gray-600" dir="ltr">
                        {row.profile.phone || '—'}
                      </td>
                      <td className="py-4 pr-2 text-sm text-gray-600">
                        {row.profile.email || '—'}
                      </td>
                      <td className="py-4 pr-2 text-sm text-gray-500">
                        {formatDate(row.profile.created_at)}
                      </td>
                      <td className="py-4 pr-2">
                        <span className="rounded-full bg-lavender-100 px-3 py-1 text-xs font-bold text-lavender-700">
                          {row.orderCount} طلب
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-sm font-extrabold premium-gradient-text">
                        {row.totalSpent > 0 ? `${row.totalSpent} ج.م` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {filteredRows.map((row, i) => (
                <div
                  key={row.profile.id}
                  className="glass-card p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full glass text-base font-extrabold premium-gradient-text">
                      {(row.profile.full_name || '؟').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-gray-800">
                        {row.profile.full_name || 'بدون اسم'}
                      </p>
                      {row.profile.role === 'admin' && (
                        <span className="text-xs font-bold text-blush-600">مدير</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-500">الهاتف</span>
                      <span className="text-gray-700" dir="ltr">{row.profile.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-500">البريد</span>
                      <span className="text-gray-700">{row.profile.email || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-500">تاريخ الانضمام</span>
                      <span className="text-gray-700">{formatDate(row.profile.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-500">عدد الطلبات</span>
                      <span className="rounded-full bg-lavender-100 px-3 py-0.5 font-bold text-lavender-700">
                        {row.orderCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-500">إجمالي الإنفاق</span>
                      <span className="font-extrabold premium-gradient-text">
                        {row.totalSpent > 0 ? `${row.totalSpent} ج.م` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

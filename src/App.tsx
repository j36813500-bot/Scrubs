import { useEffect, useState } from 'react'
import { RouterProvider, useRouter } from './lib/router'
import { onAuthChange, getUser } from './lib/auth'
import type { Profile } from './lib/types'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'

import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import TrackPage from './pages/TrackPage'
import TrackOrderPage from './pages/TrackOrderPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import FAQPage from './pages/FAQPage'
import SupportPage from './pages/SupportPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSales from './pages/admin/AdminSales'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminSettings from './pages/admin/AdminSettings'
import AdminFAQs from './pages/admin/AdminFAQs'
import AdminSocial from './pages/admin/AdminSocial'
import AdminChat from './pages/admin/AdminChat'

function AppContent() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthChange(async (session) => {
      if (session) {
        const profile = await getUser()
        setUser(profile)
      } else {
        setUser(null)
      }
      setAuthReady(true)
    })
    return unsub
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [router.path])

  const path = router.path
  const isAdminPage = path.startsWith('/admin')
  const isAuthPage = path === '/auth'

  // Admin route protection
  if (isAdminPage && authReady && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-3xl text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">غير مصرح</h2>
          <p className="text-gray-500 mb-6">يجب تسجيل الدخول كمدير للوصول إلى لوحة التحكم</p>
          <button onClick={() => router.navigate('/auth')} className="btn-premium">
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    if (path === '/' || path === '') return <HomePage />
    if (path === '/store') return <StorePage />
    if (path.startsWith('/product/')) return <ProductPage />
    if (path === '/cart') return <CartPage />
    if (path === '/track') return <TrackPage />
    if (path === '/track-order') return <TrackOrderPage />
    if (path === '/auth') return <AuthPage />
    if (path === '/profile') return <ProfilePage />
    if (path === '/favorites') return <FavoritesPage />
    if (path === '/faq') return <FAQPage />
    if (path === '/support') return <SupportPage />
    if (path === '/about') return <AboutPage />
    if (path === '/contact') return <ContactPage />

    if (path === '/admin') return <AdminDashboard />
    if (path === '/admin/orders') return <AdminOrders />
    if (path === '/admin/sales') return <AdminSales />
    if (path === '/admin/products') return <AdminProducts />
    if (path === '/admin/customers') return <AdminCustomers />
    if (path === '/admin/settings') return <AdminSettings />
    if (path === '/admin/faqs') return <AdminFAQs />
    if (path === '/admin/social') return <AdminSocial />
    if (path === '/admin/chat') return <AdminChat />

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
          <button onClick={() => router.navigate('/')} className="btn-premium mt-4">
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  const showChrome = !isAuthPage && !isAdminPage

  return (
    <div className="min-h-screen">
      {showChrome && <Navbar />}
      <main className={showChrome ? 'pb-20 lg:pb-0' : ''}>
        {renderPage()}
      </main>
      {showChrome && <Footer />}
      {showChrome && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  )
}

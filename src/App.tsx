import { useEffect, useState } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { initAuth } from './lib/auth';
import CinematicBackground from './components/CinematicBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomDock from './components/BottomDock';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import TrackPage from './pages/TrackPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import FaqPage from './pages/FaqPage';
import PolicyPage from './pages/PolicyPage';
import AuthPage from './pages/AuthPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSales from './pages/admin/AdminSales';
import AdminProducts from './pages/admin/AdminProducts';
import AdminFeedback from './pages/admin/AdminFeedback';
import FeedbackPage from './pages/FeedbackPage';

function Routes() {
  const { path } = useRouter();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [path]);

  const renderPage = () => {
    if (path === '/') return <HomePage />;
    if (path === '/store') return <StorePage />;
    if (path.startsWith('/product/')) return <ProductPage />;
    if (path === '/cart') return <CartPage />;
    if (path === '/favorites') return <FavoritesPage />;
    if (path === '/track') return <TrackPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/support') return <SupportPage />;
    if (path === '/faq') return <FaqPage />;
    if (path === '/returns') return <PolicyPage type="returns" />;
    if (path === '/privacy') return <PolicyPage type="privacy" />;
    if (path === '/terms') return <PolicyPage type="terms" />;
    if (path === '/auth') return <AuthPage />;
    if (path === '/feedback') return <FeedbackPage />;
    if (path === '/admin' || path === '/admin/orders') return <AdminLayout><AdminOrders /></AdminLayout>;
    if (path === '/admin/sales') return <AdminLayout><AdminSales /></AdminLayout>;
    if (path === '/admin/products') return <AdminLayout><AdminProducts /></AdminLayout>;
    if (path === '/admin/feedback') return <AdminLayout><AdminFeedback /></AdminLayout>;
    return (
      <div className="pt-28 px-4 text-center">
        <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
          <div className="text-5xl mb-4">🌌</div>
          <h2 className="font-display font-bold text-2xl text-beige-800 mb-2">الصفحة غير موجودة</h2>
          <p className="text-beige-600 mb-4">تبدو أنك ضلّت الطريق في صالتنا الافتراضية</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Navbar />
      {/* cinematic scene transition overlay */}
      <div
        className={`fixed inset-0 z-40 pointer-events-none transition-opacity duration-500 ${
          flash ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(255,228,236,0.7) 0%, rgba(247,244,252,0.9) 100%)',
          backdropFilter: flash ? 'blur(20px)' : 'blur(0px)',
        }}
      />
      <main
        key={path}
        className="page-enter-active pb-24 lg:pb-0"
      >
        {renderPage()}
      </main>
      <Footer />
      <BottomDock />
    </div>
  );
}

export default function App() {
  useEffect(() => { initAuth(); }, []);
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  );
}

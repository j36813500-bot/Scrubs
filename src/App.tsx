import { useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { initAuth } from './lib/auth';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import TrackPage from './pages/TrackPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import FAQPage from './pages/FAQPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function Routes() {
  const { path } = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  // Auth page: no navbar
  if (path === '/auth') return <AuthPage />;

  // Admin page placeholder
  if (path.startsWith('/admin')) {
    return (
      <>
        <Navbar />
        <div className="pt-28 px-4 pb-24 min-h-screen flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 text-center">
            <p className="text-beige-700 mb-4">لوحة الإدارة</p>
          </div>
        </div>
      </>
    );
  }

  let page: React.ReactNode;
  if (path === '/') page = <HomePage />;
  else if (path === '/store') page = <StorePage />;
  else if (path.startsWith('/product/')) page = <ProductPage />;
  else if (path === '/cart') page = <CartPage />;
  else if (path === '/track' || path === '/orders') page = <TrackPage />;
  else if (path === '/profile') page = <ProfilePage />;
  else if (path === '/favorites') page = <FavoritesPage />;
  else if (path === '/faq') page = <FAQPage />;
  else if (path === '/support') page = <SupportPage />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/contact') page = <ContactPage />;
  else page = <HomePage />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pb-24 lg:pb-12">{page}</div>
    </>
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

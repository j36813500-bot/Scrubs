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

function Routes() {
  const { path } = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const isAdmin = path.startsWith('/admin');
  const isAuth = path === '/auth';
  const isViewer = path.startsWith('/product/');

  if (isAdmin || isAuth) {
    if (isAuth) return <AuthPage />;
    return <div className="p-20 text-center text-beige-700">لوحة الإدارة</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {path === '/' && <HomePage />}
        {path === '/store' && <StorePage />}
        {path.startsWith('/product/') && <ProductPage />}
        {path === '/cart' && <CartPage />}
        {path === '/track' && <TrackPage />}
        {path === '/profile' && <ProfilePage />}
        {!['/', '/store', '/cart', '/track', '/profile'].includes(path) && !path.startsWith('/product/') && (
          <HomePage />
        )}
      </div>
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

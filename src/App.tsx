import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import AdminPage from './pages/AdminPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GoogleCallback from './pages/GoogleCallback';
import AdminLoginPage from './pages/AdminLoginPage';
import { isAdminTokenPresent } from './services/adminAuth';
import AccountPage from './pages/AccountPage';
import { isCustomerLoggedIn } from './services/customerAuth';
import Toasts from './components/Toasts';
import ScrollToTop from './components/ScrollToTop';

function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  if (!isAdminTokenPresent()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function RequireCustomerAuth({ children }: { children: React.ReactNode }) {
  if (!isCustomerLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Toasts />
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/account" element={<RequireCustomerAuth><AccountPage /></RequireCustomerAuth>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<RequireAdminAuth><AdminLayout><AdminPage /></AdminLayout></RequireAdminAuth>} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

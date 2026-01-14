import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import WholesalePortal from './pages/WholesalePortal';
import WholesaleCatalog from './pages/WholesaleCatalog';
import WholesalerOrders from './pages/WholesalerOrders';
import WholesaleOrderDetail from './pages/WholesaleOrderDetail';
import WholesalerOrderDetail from './pages/WholesalerOrderDetail';
import WholesaleOrderGrid from './pages/WholesaleOrderGrid';
import WholesaleOrderSummary from './pages/WholesaleOrderSummary';
import WholesalerRegistration from './pages/WholesalerRegistration';
import WholesaleInvoices from './pages/WholesaleInvoices';
import WholesaleReports from './pages/WholesaleReports';
import WholesaleSettings from './pages/WholesaleSettings';
import ProductVariantGridPage from './pages/admin/ProductVariantGridPage';
import AdminPanel from './components/admin/AdminPanel';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './App.css';

function AppContent() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPanel onLogout={handleLogout} />} />
      <Route path="/admin/products/:productId/variants" element={<ProductVariantGridPage />} />

      {/* Public Routes */}
      <Route path="/*" element={
        <div className="app">
          <TopBar />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wholesale" element={<WholesalePortal />} />
              <Route path="/wholesale/catalog" element={<WholesaleCatalog />} />
              <Route path="/wholesale/orders" element={<WholesalerOrders />} />
              <Route path="/wholesale/orders/:id" element={<WholesalerOrderDetail />} />
              <Route path="/wholesale/wholesale-orders/:id" element={<WholesaleOrderDetail />} />
              <Route path="/wholesale/grid" element={<WholesaleOrderGrid />} />
              <Route path="/wholesale/summary" element={<WholesaleOrderSummary />} />
              <Route path="/wholesale/register" element={<WholesalerRegistration />} />
              <Route path="/wholesale/invoices" element={<WholesaleInvoices />} />
              <Route path="/wholesale/reports" element={<WholesaleReports />} />
              <Route path="/wholesale/settings" element={<WholesaleSettings />} />
            </Routes>
          </main>
          <Footer />
          <FloatingButtons />
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;

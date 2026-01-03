import { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Designs from './pages/Designs';
import Gallery from './pages/Gallery';
import Contacts from './pages/Contacts';
import CartPage from './pages/CartPage';
import AdminLogin from './pages/AdminLogin';
import AdminManager from './pages/DesignManager';
import AddDesign from './pages/AddDesign';
import EditDesign from './pages/EditDesign';
import AddGallery from './pages/AddGallery';
import EditGallery from './pages/EditGallery';
import ScrollToTop from './components/ScrollToTop';
import ResetScroll from './utils/ResetScroll';
import { CartProvider } from './context/CartContext';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastContext';
import OrdersPanel from './components/OrdersPanel';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import MockBank from './pages/MockBank';
import CheckoutExpired from './pages/CheckoutExpired';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <ResetScroll />
      {children}
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/designs" element={<Layout><Designs /></Layout>} />
              <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route path="/checkout/success" element={<Layout><CheckoutSuccess /></Layout>} />
              <Route path="/checkout/cancel" element={<Layout><CheckoutCancel /></Layout>} />
              <Route path="/checkout/expired" element={<Layout><CheckoutExpired /></Layout>} />
              <Route path="/mock-bank" element={<Layout><MockBank /></Layout>} />
              <Route path="/admin-login" element={<Layout><AdminLogin /></Layout>} />
              <Route path="/admin-manager" element={<ProtectedRoute><Layout><AdminManager /></Layout></ProtectedRoute>} />
              <Route path="/admin-manager/add" element={<ProtectedRoute><Layout><AddDesign /></Layout></ProtectedRoute>} />
              <Route path="/admin-manager/edit/:id" element={<ProtectedRoute><Layout><EditDesign /></Layout></ProtectedRoute>} />
              <Route path="/admin-manager/gallery/add" element={<ProtectedRoute><Layout><AddGallery /></Layout></ProtectedRoute>}/>
              <Route path="/admin-manager/gallery/edit/:id" element={<ProtectedRoute><Layout><EditGallery /></Layout></ProtectedRoute>}/>
              <Route path="/admin-manager/category/add" element={<ProtectedRoute><Layout><AddCategory /></Layout></ProtectedRoute>}/>
              <Route path="/admin-manager/category/edit/:id" element={<ProtectedRoute><Layout><EditCategory /></Layout></ProtectedRoute>}/>
              <Route path="/admin-manager/orders" element={<ProtectedRoute><Layout><OrdersPanel /></Layout></ProtectedRoute>}/>
            </Routes>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

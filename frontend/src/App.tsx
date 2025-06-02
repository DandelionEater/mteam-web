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
          <Route path="/admin-login" element={<Layout><AdminLogin /></Layout>} />
          <Route path="/admin-manager" element={<Layout><AdminManager /></Layout>} />
          <Route path="/admin-manager/add" element={<Layout><AddDesign /></Layout>} />
          <Route path="/admin-manager/edit/:id" element={<Layout><EditDesign /></Layout>} />
          <Route path="/admin-manager/gallery/add" element={<Layout><AddGallery /></Layout>}/>
          <Route path="/admin-manager/gallery/edit/:id" element={<Layout><EditGallery /></Layout>}/>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

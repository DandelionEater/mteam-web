import { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Designs from './pages/Designs';
import Contacts from './pages/Contacts';
import CartPage from './pages/CartPage';
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
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

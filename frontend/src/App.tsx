import { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Designs from './pages/Designs';
import Contacts from './pages/Contacts';
import ScrollToTop from './components/ScrollToTop';
import ResetScroll from './utils/ResetScroll';

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
    <Router>
      <Navbar />
      {/* React Router Routes */}
      <Routes>
        <Route path="/" element={<Layout> <Home /> </Layout>}/>
        <Route path="/designs" element={<Layout> <Designs /> </Layout>}/>
        <Route path="/about" element={<Layout> <About /> </Layout>} />
        <Route path='/contacts' element={<Layout> <Contacts /> </Layout>}/>
      </Routes>
    </Router>
  );
}

export default App;

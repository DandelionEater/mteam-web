import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Įsitikinkite, kad teisingai nurodote kelią
import Home from './pages/Home'; // Puslapis, kur bus rodomas pagrindinis turinys
import About from './pages/About'; // Kitas puslapis

function App() {
  return (
    <Router>
      {/* Globaliai rodomas Navbar */}
      <Navbar />
      
      {/* React Router pagalba rodomi puslapiai */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* Kiti puslapiai */}
      </Routes>
    </Router>
  );
}

export default App;

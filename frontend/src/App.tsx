import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Designs from './pages/Designs';

function App() {
  return (
    <Router>
      <Navbar />
      {/* React Router Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/designs" element={<Designs />}/>
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

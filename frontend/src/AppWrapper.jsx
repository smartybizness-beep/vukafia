import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHome from './App';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Chatbot from './components/Chatbot';

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

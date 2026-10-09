import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHome from './App';
import ContactPage from './pages/ContactPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import SupportPage from './pages/SupportPage';
import Chatbot from './components/Chatbot';

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/business/:id" element={<BusinessDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

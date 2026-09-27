import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHome from './App';
import ContactPage from './pages/ContactPage';
import Chatbot from './components/Chatbot';

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHome from './App';
import ContactPage from './pages/ContactPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import SupportPage from './pages/SupportPage';
import AcceptableUsePolicyPage from './pages/AcceptableUsePolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import DisputeResolutionPage from './pages/DisputeResolutionPage';
import TemplatesPage from './pages/TemplatesPage';
import ChecklistPage from './pages/ChecklistPage';
import Chatbot from './components/Chatbot';

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/business/:id" element={<BusinessDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/acceptable-use-policy" element={<AcceptableUsePolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/dispute-resolution" element={<DisputeResolutionPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/checklists/:from/:to" element={<ChecklistPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

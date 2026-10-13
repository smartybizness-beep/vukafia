import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function AcceptableUsePolicyPage() {
  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>Acceptable Use Policy</h1>

        <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <p><strong>Vukafia Trans-African Business Directory</strong></p>
          <p>Effective Date: October 13, 2026</p>
          <p>Contact: info@vukafia.com | WhatsApp: +2348101477935</p>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            1. Overview
          </h2>
          <p>
            This Acceptable Use Policy outlines the prohibited activities, business types, and content restrictions
            for sellers listing businesses on the Vukafia platform. By claiming a business or creating an account on
            Vukafia, you agree to comply with this Policy.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            2. Prohibited Business Types
          </h2>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Financial Services (Unauthorized)</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>❌ Unlicensed money lending or microcredit</li>
            <li>❌ Unauthorized forex/currency exchange services</li>
            <li>❌ Unlicensed investment schemes or trading platforms</li>
            <li>❌ Pyramid schemes or multi-level marketing (MLM)</li>
            <li>❌ Unregistered cryptocurrency exchanges</li>
            <li>❌ Unlicensed insurance services</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Illegal Activities</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>❌ Drug trafficking or sale of controlled substances</li>
            <li>❌ Weapons/explosives trafficking</li>
            <li>❌ Human trafficking or forced labor</li>
            <li>❌ Document fraud or forgery services</li>
            <li>❌ Money laundering or financial crime services</li>
            <li>❌ Hacking or cyber crime services</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Prohibited Products & Services</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>❌ Counterfeit goods</li>
            <li>❌ Stolen property</li>
            <li>❌ Endangered species or wildlife products</li>
            <li>❌ Child exploitation material (any form)</li>
            <li>❌ Adult sexual services</li>
            <li>❌ Unregistered pharmaceuticals or fake medicines</li>
            <li>❌ Unlicensed medical procedures</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Fraudulent Operations</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>❌ Advance-fee fraud schemes</li>
            <li>❌ Romance scams or catfishing services</li>
            <li>❌ Employment scams</li>
            <li>❌ Fake documentation services</li>
            <li>❌ Impersonation of government agencies</li>
            <li>❌ Fake charity operations</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            3. Prohibited Seller Conduct
          </h2>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Fraudulent Behavior</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Misrepresenting business information</li>
            <li>Posting fake reviews or ratings</li>
            <li>Impersonating other businesses</li>
            <li>False claims about products/services</li>
            <li>Hidden fees or bait-and-switch pricing</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Harassment & Abuse</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Threatening or abusive communication</li>
            <li>Discrimination based on race, religion, gender, nationality</li>
            <li>Sexual harassment or inappropriate content</li>
            <li>Spam messaging or unsolicited contact</li>
            <li>Doxxing or sharing personal information</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            4. Enforcement & Violations
          </h2>

          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Warning (First Offense)</h3>
            <p>Minor policy violation → Policy education → Listing under review</p>
          </div>

          <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#c0522a', marginTop: 0 }}>Suspension (Repeated or Serious)</h3>
            <p>Listing hidden from directory → Cannot claim new businesses → 30-90 day review period</p>
          </div>

          <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#721c24', marginTop: 0 }}>Permanent Removal (Severe/Fraud)</h3>
            <p>Listing deleted → Account terminated → No refund → Potential law enforcement referral</p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            5. Appeals Process
          </h2>
          <p>
            If your listing is suspended or removed, you may submit an appeal within 15 days with:
          </p>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Your business name and ID</li>
            <li>Reason for appeal</li>
            <li>Supporting documentation</li>
          </ul>
          <p style={{ color: '#666' }}>
            Submit to: <strong>info@vukafia.com</strong> with subject line "APPEAL - [Business Name]"
          </p>
        </section>

        <section style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ color: '#2d1f0e', marginTop: 0, fontSize: '1.1rem' }}>Need Help?</h2>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            📧 Email: <strong>info@vukafia.com</strong>
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            💬 WhatsApp: <strong>+2348101477935</strong>
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            🌐 Website: <strong>https://vukafia.com</strong>
          </p>
        </section>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
          <p>Document Version: 1.0 | Last Updated: October 13, 2026</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/refund-policy" style={{ color: '#c0522a', textDecoration: 'none', marginRight: '1rem' }}>
              Refund Policy
            </Link>
            <span style={{ color: '#ddd' }}>|</span>
            <Link to="/dispute-resolution" style={{ color: '#c0522a', textDecoration: 'none', marginLeft: '1rem' }}>
              Dispute Resolution
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

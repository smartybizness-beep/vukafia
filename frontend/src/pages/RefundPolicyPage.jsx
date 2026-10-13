import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function RefundPolicyPage() {
  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>Refund Policy</h1>

        <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <p><strong>Vukafia Trans-African Business Directory</strong></p>
          <p>Effective Date: October 13, 2026</p>
          <p>Contact: info@vukafia.com | WhatsApp: +2348101477935</p>
        </div>

        <section style={{ marginBottom: '2rem', background: '#fff3cd', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
          <h2 style={{ color: '#2d1f0e', marginTop: 0 }}>Key Principle</h2>
          <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 0 }}>
            Vukafia is a <strong>B2B business directory</strong>, NOT an e-commerce marketplace. We facilitate connections
            between businesses and customers, but do <strong>NOT process or hold funds</strong> for individual transactions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            1. Types of Payments
          </h2>

          <div style={{ background: '#f0f8ff', padding: '1rem', borderRadius: '6px', marginTop: '1rem', borderLeft: '4px solid #0284c7' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Claim Verification Fee (Paid to Vukafia)</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}><strong>Amount:</strong> $14.99 USD or equivalent</p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}><strong>Purpose:</strong> Business verification, directory listing, 12-month promotion</p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}><strong>Payment Methods:</strong> Bachs (USD) or Paystack (local currency)</p>
            <p style={{ color: '#c0522a', margin: '1rem 0 0 0', fontWeight: 'bold' }}>🔴 Refund Policy: NO REFUNDS</p>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Transaction Payments (Buyer to Seller)</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}><strong>Responsibility:</strong> Between buyer and seller directly</p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}><strong>Vukafia Role:</strong> Directory facilitator only (no involvement)</p>
            <p style={{ color: '#666', margin: '1rem 0 0 0' }}>Refund Policy: Per individual seller's terms (not Vukafia's responsibility)</p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            2. Why Claim Fee Is Non-Refundable
          </h2>

          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Once payment is received, Vukafia immediately provides these services:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #4caf50' }}>
              <h4 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Business Verification</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 0 }}>Google Maps verification, photo authenticity check, information validation</p>
            </div>

            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #2196f3' }}>
              <h4 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Directory Listing</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 0 }}>Unique business page created, published on platform, 54-nation visibility</p>
            </div>

            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #9c27b0' }}>
              <h4 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ 12-Month Promotion</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 0 }}>Featured listing, WhatsApp integration, analytics dashboard</p>
            </div>

            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #ff9800' }}>
              <h4 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Claim Processing</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 0 }}>Manual review, payment processing, fraud prevention screening</p>
            </div>
          </div>

          <p style={{ color: '#666', marginTop: '1.5rem', fontStyle: 'italic' }}>
            <strong>These services are delivered immediately upon payment. Therefore, refunds are NOT available.</strong>
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            3. Non-Refundable Scenarios
          </h2>

          <p style={{ color: '#666', marginBottom: '1rem' }}>Refunds will NOT be issued for:</p>

          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>❌ Change of mind after purchase</li>
            <li>❌ Duplicate claim payments</li>
            <li>❌ User error (wrong amount entered)</li>
            <li>❌ Technical issues on buyer's device</li>
            <li>❌ Claim suspension for policy violations</li>
            <li>❌ Business closure or relocation</li>
            <li>❌ Seller requesting removal</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            4. Refundable Scenarios (Rare Exceptions)
          </h2>

          <p style={{ color: '#666', marginBottom: '1rem' }}>Refunds MAY be issued only in these cases:</p>

          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '6px', marginTop: '1rem', borderLeft: '4px solid #4caf50' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Technical Failure by Vukafia</h3>
            <ul style={{ marginLeft: '2rem', color: '#666', marginBottom: 0 }}>
              <li>Payment processed but listing NOT created within 24 hours</li>
              <li>Payment duplicated (charged twice)</li>
              <li>System error preventing access to claimed business</li>
            </ul>
          </div>

          <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '6px', marginTop: '1rem', borderLeft: '4px solid #2196f3' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Unauthorized Transaction</h3>
            <ul style={{ marginLeft: '2rem', color: '#666', marginBottom: 0 }}>
              <li>Payment made without seller's authorization</li>
              <li>Account compromised</li>
              <li>Fraudulent charge</li>
            </ul>
          </div>

          <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '6px', marginTop: '1rem', borderLeft: '4px solid #ff9800' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Service Unavailability</h3>
            <ul style={{ marginLeft: '2rem', color: '#666', marginBottom: 0 }}>
              <li>Vukafia platform unavailable for 7+ consecutive days</li>
              <li>Major technical outage affecting service delivery</li>
            </ul>
          </div>

          <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.95rem' }}>
            <strong>Documentation Required:</strong> Proof of the issue, screenshots, transaction details
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            5. How to Request a Refund
          </h2>

          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Submit Refund Request</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Email:</strong> info@vukafia.com
            </p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Subject:</strong> Refund Request - [Business Name] - [Transaction ID]
            </p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              Include: Business name, transaction ID, payment date, amount, reason, supporting documentation
            </p>
          </div>

          <div style={{ marginTop: '1rem', color: '#666' }}>
            <p><strong>Timeline:</strong></p>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>Response:</strong> 5 business days</li>
              <li><strong>Approved Refund:</strong> 5-10 business days after approval</li>
              <li><strong>Refund Method:</strong> Original payment method</li>
            </ul>
          </div>
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
            ⚖️ Legal: <strong>legal@vukafia.com</strong>
          </p>
        </section>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
          <p>Document Version: 1.0 | Last Updated: October 13, 2026</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/acceptable-use-policy" style={{ color: '#c0522a', textDecoration: 'none', marginRight: '1rem' }}>
              Acceptable Use Policy
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

import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function DisputeResolutionPage() {
  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>Dispute Resolution Policy</h1>

        <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <p><strong>Vukafia Trans-African Business Directory</strong></p>
          <p>Effective Date: October 13, 2026</p>
          <p>Contact: info@vukafia.com | WhatsApp: +2348101477935</p>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            1. How to File a Complaint
          </h2>

          <div style={{ background: '#f0f8ff', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid #0284c7' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Submit Your Complaint</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Email:</strong> info@vukafia.com
            </p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>WhatsApp:</strong> +2348101477935
            </p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Subject:</strong> [Type] - [Business Name] - [Details]
            </p>
            <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.95rem' }}>
              Include: Your name, business name/ID, date of issue, description, amount (if applicable), evidence, resolution requested
            </p>
          </div>

          <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid #4caf50' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Response Timeline</h3>
            <ul style={{ marginLeft: '2rem', color: '#666', marginBottom: 0 }}>
              <li><strong>🟢 Standard Issues:</strong> 5-10 business days</li>
              <li><strong>🟡 High Priority:</strong> 2-5 business days</li>
              <li><strong>🔴 Critical/Urgent:</strong> 24-48 hours</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            2. Types of Disputes We Handle
          </h2>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Seller Policy Violations</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Fraudulent business information</li>
            <li>Fake credentials or qualifications</li>
            <li>Misleading descriptions</li>
            <li>Prohibited business type</li>
            <li>Policy violations or illegal activity</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Buyer-Seller Disputes</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li><strong>Important:</strong> Vukafia is a directory facilitator only</li>
            <li>We do NOT hold funds or process transactions</li>
            <li>Disputes are between buyer and seller directly</li>
            <li>You can escalate to payment processor (Paystack/Bachs)</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Harassment & Abuse</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Threatening or abusive language</li>
            <li>Discrimination or harassment</li>
            <li>Sexual harassment</li>
            <li>Repeated unwanted contact</li>
            <li>Doxxing or personal information sharing</li>
          </ul>

          <h3 style={{ color: '#c0522a', marginTop: '1.5rem' }}>Technical Issues</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>Payment processing failures</li>
            <li>Listing access problems</li>
            <li>Account/login issues</li>
            <li>Platform downtime</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            3. Investigation Process
          </h2>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
              <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Step 1: Evidence Collection</h3>
              <p style={{ color: '#666', marginBottom: 0 }}>
                We request detailed information from you and the other party. We gather transaction records and review system logs.
              </p>
            </div>

            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
              <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Step 2: Verification</h3>
              <p style={{ color: '#666', marginBottom: 0 }}>
                We cross-reference information with Google Maps data, verify payments, review communication history, and check policy compliance.
              </p>
            </div>

            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px' }}>
              <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Step 3: Neutral Assessment</h3>
              <p style={{ color: '#666', marginBottom: 0 }}>
                We apply policies fairly to both parties with no bias. Decisions are evidence-based and thoroughly documented.
              </p>
            </div>
          </div>

          <p style={{ color: '#666', marginTop: '1.5rem', fontSize: '0.95rem' }}>
            <strong>Investigation Timeline:</strong> 5-15 business days depending on complexity
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            4. Resolution Outcomes
          </h2>

          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', borderLeft: '4px solid #2196f3' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>⚠️ Warning</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>For minor first-time violations</p>
            <p style={{ color: '#666', marginBottom: 0 }}>Outcome: Education, warning letter, 30-day monitoring period</p>
          </div>

          <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', borderLeft: '4px solid #ffc107' }}>
            <h3 style={{ color: '#c0522a', marginTop: 0 }}>🔶 Suspension</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>For serious or repeated violations</p>
            <p style={{ color: '#666', marginBottom: 0 }}>Outcome: Listing hidden, cannot claim new businesses, 30-90 day review, right to appeal</p>
          </div>

          <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', borderLeft: '4px solid #dc3545' }}>
            <h3 style={{ color: '#721c24', marginTop: 0 }}>🔴 Permanent Removal</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>For severe fraud or repeated violations</p>
            <p style={{ color: '#666', marginBottom: 0 }}>Outcome: Account terminated, no refund, possible law enforcement referral</p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            5. Appeal Your Decision
          </h2>

          <p style={{ color: '#666', marginBottom: '1rem' }}>
            You can appeal within <strong>15 days</strong> of receiving a decision if:
          </p>

          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>✅ New evidence emerges</li>
            <li>✅ You believe there was a factual error</li>
            <li>✅ The process wasn't followed correctly</li>
            <li>✅ The penalty seems disproportionate</li>
          </ul>

          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <h3 style={{ color: '#2d1f0e', marginTop: 0 }}>Submit Your Appeal</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Email:</strong> info@vukafia.com
            </p>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Subject:</strong> APPEAL - [Case ID] - [Reason]
            </p>
            <p style={{ color: '#666', marginBottom: 0 }}>
              Include: Case ID, reason for appeal, new evidence (if any), detailed explanation
            </p>
          </div>

          <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.95rem' }}>
            <strong>Appeal Timeline:</strong> 10-15 business days for review and decision
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2d1f0e', fontSize: '1.3rem', borderBottom: '2px solid #c0522a', paddingBottom: '0.5rem' }}>
            6. Harassment Reporting
          </h2>

          <p style={{ color: '#666', marginBottom: '1rem' }}>
            If you're experiencing harassment, we take it seriously:
          </p>

          <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <h3 style={{ color: '#721c24', marginTop: 0 }}>🚨 Urgent Harassment?</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              <strong>Email:</strong> info@vukafia.com (mark URGENT)
            </p>
            <p style={{ color: '#666', marginBottom: 0 }}>
              <strong>In Emergency:</strong> Contact local law enforcement
            </p>
          </div>

          <h3 style={{ color: '#2d1f0e' }}>Our Response:</h3>
          <ul style={{ marginLeft: '2rem', color: '#666' }}>
            <li>24-48 hour response for urgent cases</li>
            <li>Your identity protected where possible</li>
            <li>Actions: Warning → Suspension → Removal → Law enforcement referral</li>
            <li>Confidentiality maintained</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ color: '#2d1f0e', marginTop: 0, fontSize: '1.1rem' }}>Timeline Summary</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#666', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #c0522a' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0', color: '#2d1f0e' }}>Dispute Type</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0', color: '#2d1f0e' }}>Response</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0', color: '#2d1f0e' }}>Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.7rem 0' }}>Policy violation</td>
                <td style={{ padding: '0.7rem 0' }}>24 hours</td>
                <td style={{ padding: '0.7rem 0' }}>10-20 days</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.7rem 0' }}>Fraud report</td>
                <td style={{ padding: '0.7rem 0' }}>24-48 hours</td>
                <td style={{ padding: '0.7rem 0' }}>5-15 days</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.7rem 0' }}>Payment dispute</td>
                <td style={{ padding: '0.7rem 0' }}>24 hours</td>
                <td style={{ padding: '0.7rem 0' }}>5-10 days</td>
              </tr>
              <tr>
                <td style={{ padding: '0.7rem 0' }}>Harassment</td>
                <td style={{ padding: '0.7rem 0' }}>24 hours</td>
                <td style={{ padding: '0.7rem 0' }}>5-10 days</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ color: '#2d1f0e', marginTop: 0, fontSize: '1.1rem' }}>Contact & Support</h2>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            📧 <strong>Standard Support:</strong> info@vukafia.com
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            🚨 <strong>Urgent/Harassment:</strong> info@vukafia.com (mark URGENT)
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            💬 <strong>WhatsApp:</strong> +2348101477935
          </p>
        </section>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
          <p>Document Version: 1.0 | Last Updated: October 13, 2026</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/acceptable-use-policy" style={{ color: '#c0522a', textDecoration: 'none', marginRight: '1rem' }}>
              Acceptable Use Policy
            </Link>
            <span style={{ color: '#ddd' }}>|</span>
            <Link to="/refund-policy" style={{ color: '#c0522a', textDecoration: 'none', marginLeft: '1rem' }}>
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

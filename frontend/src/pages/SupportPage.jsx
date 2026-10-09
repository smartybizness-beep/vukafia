import { useState } from 'react';

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      category: 'Business Claiming',
      items: [
        {
          q: 'How do I claim my business on Vukafia?',
          a: 'Search for your business on Vukafia. Once found, click "Claim This Business" and follow the verification process. You\'ll need to pay a one-time fee ($14.99 USD) to verify ownership.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept secure payments via Bachs (supports cards globally) and WhatsApp for manual payment. All payments are secure and encrypted.'
        },
        {
          q: 'How long does verification take?',
          a: 'Most verifications are completed instantly after payment. You\'ll receive your verified badge immediately, and full access to premium features within minutes.'
        },
        {
          q: 'Can I claim multiple businesses?',
          a: 'Yes! Each business requires a separate $14.99 verification fee. You can claim as many businesses as you own.'
        }
      ]
    },
    {
      category: 'Payments & Billing',
      items: [
        {
          q: 'Why is my payment declined?',
          a: 'Please ensure your card details are correct, you have sufficient funds, and your bank hasn\'t blocked international payments. Try using a different payment method or contact your bank to authorize the transaction.'
        },
        {
          q: 'Is my payment secure?',
          a: 'Yes! All payments are processed through Bachs, which uses industry-leading encryption (PCI DSS Level 1 compliance). Your card details are never stored by Vukafia.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Refunds are available within 30 days of purchase if you haven\'t used premium features. Contact support for refund requests.'
        },
        {
          q: 'Do you offer payment plans?',
          a: 'Currently, we offer a one-time $14.99 USD payment per business. Contact us to discuss bulk business claims.'
        }
      ]
    },
    {
      category: 'Listing & Management',
      items: [
        {
          q: 'How do I edit my business information?',
          a: 'After claiming your business, you\'ll have full access to edit all details: photos, description, location, contact info, business hours, and services offered.'
        },
        {
          q: 'Can I add photos and videos?',
          a: 'Yes! You can upload multiple photos of your business, storefront, products, and team. Video support coming soon.'
        },
        {
          q: 'How do I respond to customer inquiries?',
          a: 'All customer messages come directly to you. You\'ll see inquiries in your dashboard and can respond via WhatsApp or email.'
        },
        {
          q: 'Can I delete my listing?',
          a: 'Yes, you can deactivate your listing anytime from your dashboard. The $14.99 fee is non-refundable unless requested within 30 days.'
        }
      ]
    },
    {
      category: 'Account & Security',
      items: [
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page and follow the email instructions. You\'ll receive a password reset link within 5 minutes.'
        },
        {
          q: 'Is my data private?',
          a: 'Yes. Your personal data is encrypted and never shared with third parties. We comply with data protection regulations across all African markets.'
        },
        {
          q: 'Can I have multiple accounts?',
          a: 'You can have one personal account for managing your businesses. Using multiple accounts violates our terms of service.'
        },
        {
          q: 'How do I delete my account?',
          a: 'You can request account deletion from your account settings. All data will be permanently removed within 30 days.'
        }
      ]
    },
    {
      category: 'Search & Discovery',
      items: [
        {
          q: 'Why can\'t I find my business on Vukafia?',
          a: 'Businesses are added from Google Maps data. If your business isn\'t listed, you may need to claim it on Google Maps first, then it will appear on Vukafia.'
        },
        {
          q: 'How do I get featured?',
          a: 'Featured businesses get priority visibility. Contact us at support@vukafia.com to discuss premium placement options.'
        },
        {
          q: 'Can customers find me in search results?',
          a: 'Yes! Once verified, your business appears in search results with your verified badge. Premium features boost visibility even more.'
        },
        {
          q: 'How do you rank search results?',
          a: 'Results are ranked by relevance to the search query, business rating/reviews, verification status, and location proximity.'
        }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
          Support Center
        </h1>
        <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
          Get help with claiming your business and managing your listings
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          {[
            { icon: '💬', title: 'Chat Support', desc: 'Real-time help' },
            { icon: '📧', title: 'Email Support', desc: 'support@vukafia.com' },
            { icon: '📱', title: 'WhatsApp', desc: '+234 810 147 7935' },
            { icon: '⏰', title: 'Response Time', desc: '2-4 hours' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '2rem',
            background: '#F3F4F6',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Frequently Asked Questions</h2>
          </div>

          {faqs.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <div style={{
                padding: '1.5rem',
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontWeight: '600',
                color: '#667eea',
                fontSize: '1.1rem'
              }}>
                {section.category}
              </div>

              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => setExpandedFaq(
                      expandedFaq === `${sectionIdx}-${itemIdx}` ? null : `${sectionIdx}-${itemIdx}`
                    )}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.target.parentElement.style.background = 'white'}
                  >
                    <span style={{ fontWeight: '500', color: '#1F2937' }}>{item.q}</span>
                    <span style={{
                      fontSize: '1.25rem',
                      color: '#667eea',
                      transition: 'transform 0.3s',
                      transform: expandedFaq === `${sectionIdx}-${itemIdx}` ? 'rotate(180deg)' : 'rotate(0)'
                    }}>
                      ▼
                    </span>
                  </button>

                  {expandedFaq === `${sectionIdx}-${itemIdx}` && (
                    <div style={{
                      padding: '1rem 1.5rem',
                      background: '#FAFBFC',
                      borderTop: '1px solid #E5E7EB',
                      color: '#4B5563',
                      lineHeight: '1.6'
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Still Need Help?</h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', opacity: 0.9 }}>
            Our support team is here to help! Reach out using any method below.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <a href="mailto:support@vukafia.com" style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              📧 Email Us
            </a>
            <a href="https://wa.me/2348101477935" target="_blank" rel="noopener noreferrer" style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

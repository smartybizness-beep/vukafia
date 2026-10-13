# Paystack Compliance Questionnaire - Complete Answers

**Company**: SOT Smartybiz Ltd  
**Platform**: Vukafia Trans-African Business Directory  
**Website**: https://vukafia.com  
**Date**: October 13, 2026  
**Contact**: info@vukafia.com | +2348101477935

---

## 1. How does the unique page for sellers work, and how do you onboard vendors?

### Seller Pages

Each business receives a **unique, verified listing page** on Vukafia:
- **URL Format**: https://vukafia.com/business/[business-id]
- **Content**: Business name, address, phone, website, ratings, photos, contact options
- **Features**: Analytics dashboard, WhatsApp integration, 12-month directory placement
- **Visibility**: Listed across 54 African nations in directory and search results

### 6-Step Onboarding Process

| Step | Action | Duration |
|------|--------|----------|
| 1 | User signs up (email/password) | 2 minutes |
| 2 | User searches and claims their business | 5 minutes |
| 3 | Information pre-populated from Google Maps | Automatic |
| 4 | Complete KYC verification | 5 minutes |
| 5 | Pay $14.99 USD claim fee (Bachs or Paystack) | 2 minutes |
| 6 | Business goes live in directory | 24 hours |

### Data Security
- ✅ HTTPS encryption (SSL/TLS)
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ PostgreSQL database encryption
- ✅ PCI DSS compliance for payments

---

## 2. What KYC information do you collect from third-party sellers?

### Tier 1: Basic KYC (All Sellers)

**Required Information**:
| Field | Required | Purpose |
|-------|----------|---------|
| Full Name | ✅ | Account identity |
| Email Address | ✅ | Verification, communication |
| Phone Number | ✅ | Business contact, emergency |
| Business Name | ✅ | Directory listing |
| Business Address | ✅ | Location verification |
| Business Category | ✅ | Classification, compliance |
| Website | ⭕ Optional | Additional verification |

### Tier 2: Enhanced KYC (High-Risk Categories)

For sensitive business types (financial services, medical, firearms, gambling):

| Field | Required | Purpose |
|-------|----------|---------|
| Government ID | ✅ | Identity verification |
| Business Registration | ✅ | Legal verification |
| Tax ID (TIN) | ✅ | Tax compliance |
| Proof of Address | ✅ | Physical verification |
| Business License | ✅ | Authority permission |

### Source Verification
- ✅ **Google Maps Cross-Reference**: All data validated against Google Maps listings
- ✅ **Photo Verification**: Business photos matched with Google Maps images
- ✅ **Rating/Review Validation**: Genuine Google reviews confirmed
- ✅ **Address Verification**: Google Maps address matching

### Data Storage & Retention
- **Database**: PostgreSQL (encrypted fields)
- **Retention**: 7 years (per compliance)
- **Deletion**: GDPR-compliant on request
- **Separation**: Kept separate from payment information

---

## 3. What enhanced due diligence do you carry out on vendors?

### Level 1: Automated Screening (All Vendors - Real-Time)

**Data Validation**:
- Email format verification
- Phone number validation
- Address postal code checks
- Name pattern analysis

**Fraud Detection**:
- Duplicate account detection
- Multiple claims from same person
- Rapid successive claims (>5 in 1 hour)
- Suspicious email patterns

**Source Verification**:
- Google Maps cross-reference
- Photo authenticity comparison (AI image verification)
- Rating and review validation
- Website domain verification

### Level 2: Manual Review (Flagged or High-Risk - 24-48 Hours)

**Policy Compliance**:
- Check against Acceptable Use Policy
- Screen for prohibited business types
- Detect illegal activity indicators

**Information Consistency**:
- Phone number matches business records
- Address matches Google Maps/registration
- Website domain ownership verification
- Business registration verification

**High-Risk Screening**:
- Financial services: License verification
- Medical services: Practitioner registration
- Alcohol/tobacco: Local licensing
- Gambling: Government authorization

### Level 3: Enhanced Verification (Complex Cases - 3-7 Days)

**Document Review**:
- Government ID verification
- Business registration documents
- Tax registration documents
- Professional licenses
- Bank account verification

**Sanctions Screening**:
- OFAC (US sanctions list) check
- EU sanctions list check
- UN consolidated list check
- PEP (Politically Exposed Persons) check

**Background Investigation**:
- Legal action history
- Financial crime database check
- Negative media search
- Criminal record check (where legal)

### Ongoing Monitoring
- Monthly compliance audits (random sample)
- Customer complaint review
- Unusual transaction monitoring
- Rating/review analysis
- Annual re-verification

---

## 4. Do you have an acceptable use policy? Share the direct link.

### ✅ YES - Comprehensive Acceptable Use Policy

**Direct Links**:
- **Web Page**: https://vukafia.com/acceptable-use-policy
- **Markdown File**: [ACCEPTABLE_USE_POLICY.md](/ACCEPTABLE_USE_POLICY.md)
- **PDF**: Available upon request

### Policy Coverage

**Prohibited Business Types**:
- ❌ Unlicensed financial services (lending, forex, investment schemes, MLM, crypto)
- ❌ Illegal activities (drugs, weapons, human trafficking, document fraud)
- ❌ Fraud operations (advance-fee schemes, romance scams, fake charities)
- ❌ Counterfeit goods, stolen property, endangered species
- ❌ Adult sexual services, unregistered pharmaceuticals

**Prohibited Seller Conduct**:
- ❌ Misrepresenting business information
- ❌ Posting fake reviews or ratings
- ❌ Impersonating other businesses
- ❌ Harassment, discrimination, or abuse
- ❌ Intellectual property violations
- ❌ Spam or unsolicited contact

**Prohibited Content**:
- ❌ Hate speech or discriminatory language
- ❌ Sexually explicit content
- ❌ Graphic violence or gore
- ❌ Child exploitation material
- ❌ Misinformation or health scams

### Enforcement Actions

| Violation | Action | Duration | Appeal |
|-----------|--------|----------|--------|
| Minor (1st offense) | Warning | 5 days to cure | Yes |
| Serious/Repeated | Suspension | 30-90 days | Yes |
| Severe/Fraud | Permanent Removal | Immediate | Limited |

**Appeals**: 15-day window with new evidence

---

## 5. Is your business a fulfillment center? Or do vendors ship directly?

### ✅ Vendors Ship Directly (B2B Directory Model)

**Vukafia is NOT**:
- ❌ An e-commerce marketplace
- ❌ A fulfillment center
- ❌ A payment processor
- ❌ A logistics provider
- ❌ An inventory holder

**Vukafia IS**:
- ✅ A B2B business directory
- ✅ A discovery and verification service
- ✅ A connection facilitator
- ✅ A communication platform

### Transaction Model

```
Buyer → Vukafia Directory → Vendor
        (discovery & verification only)
```

**Vukafia's Role**: Discovery (Steps 1-3)
**Vendor's Role**: Delivery & fulfillment (Steps 4-7)

### How It Works

1. **Buyer searches** Vukafia for business
2. **Views verified listing** with Google-validated info, photos, ratings
3. **Contacts seller directly** via WhatsApp/phone/email
4. **Negotiates terms** directly with vendor
5. **Arranges payment** directly (bank transfer, cash, M-Pesa, etc.)
6. **Receives goods** directly from vendor
7. **Handles disputes** directly with vendor

### Key Points
- ✅ **Zero inventory** held by Vukafia
- ✅ **No warehouse** operations
- ✅ **No logistics** responsibility
- ✅ **Vendor ships directly** to customer
- ✅ **No escrow** or fund holding

---

## 6. Do you hold funds until buyer confirmation? Describe the process.

### ✅ NO - Vukafia Does NOT Hold Funds

**Critical Clarification**: Vukafia is a B2B business directory, NOT a payment processor.

**Vukafia Does NOT**:
- ❌ Hold buyer funds
- ❌ Process transactions
- ❌ Provide escrow services
- ❌ Manage payment disputes
- ❌ Act as payment intermediary

### Payment Flow

**Claim Verification Fee** (Vukafia only payment):
```
Vendor → Bachs/Paystack → Vukafia
($14.99 USD for directory listing)
```

**Transaction Payments** (Vendor only):
```
Buyer → Vendor Directly
(bank transfer, M-Pesa, cash on delivery, etc.)
OR
Buyer → Payment Processor → Vendor
(Paystack, Flutterwave, etc.)
```

### Claim Fee Details
- **Amount**: $14.99 USD (fixed) or local currency equivalent
- **Payment Methods**: Bachs (USD) or Paystack (local currency)
- **Recipient**: SOT Smartybiz Ltd (Vukafia)
- **Purpose**: Directory listing, verification, 12-month promotion
- **Refund Policy**: Non-refundable (see Question 7)

### Dispute Resolution
- **Buyer-Vendor disputes**: Direct resolution between parties
- **Payment processor disputes**: Escalate to Paystack/Bachs/bank chargeback
- **Vukafia involvement**: Informational only; may remove fraudulent vendor
- **Law enforcement**: Referral for criminal activity

---

## 7. Do you have a refund policy? If yes, please share it.

### ✅ YES - Comprehensive Refund Policy

**Direct Links**:
- **Web Page**: https://vukafia.com/refund-policy
- **Markdown File**: [REFUND_POLICY.md](/REFUND_POLICY.md)
- **PDF**: Available upon request

### Claim Verification Fee - NON-REFUNDABLE

**Why Non-Refundable**: Services delivered immediately upon payment:
1. ✅ Business verification (Google Maps + photo validation)
2. ✅ Unique listing page created
3. ✅ 54-nation directory visibility
4. ✅ WhatsApp integration setup
5. ✅ Analytics dashboard access
6. ✅ 12-month featured placement

**Non-Refundable Scenarios**:
- ❌ Change of mind
- ❌ User error
- ❌ Technical issues on buyer's device
- ❌ Policy suspension
- ❌ Business closure
- ❌ Duplicate payments (except refund of duplicate)

### Refundable Scenarios (Exceptions)

| Scenario | Requirement | Timeline |
|----------|-------------|----------|
| **Technical Failure** | Payment processed but listing not created (24hrs) | 5-10 days |
| **Unauthorized Charge** | Payment without authorization or fraud | 5-10 days |
| **Service Unavailability** | Platform down 7+ consecutive days | 5-10 days |

### Refund Request Process

```
1. Submit Request
   Email: info@vukafia.com
   Subject: Refund Request - [Business Name]
   Include: Transaction ID, date, amount, reason, evidence

2. Review
   Response: 5 business days
   Investigation: Up to 15 days if needed

3. Decision
   ✅ Approved → Refund issued 5-10 business days
   ⚠️ Partial → Modified outcome
   ❌ Denied → Final decision

4. Refund Method
   Original payment method (Bachs/Paystack)
   Timeline: 5-10 business days
```

### Transaction Disputes (Buyer-Seller)
- **Responsibility**: Buyer and seller (not Vukafia)
- **Escalation**: Contact payment processor for chargeback
- **Vukafia action**: May remove fraudulent vendor if confirmed

### Age Limits
- **Standard requests**: Within 30 days
- **Fraud/unauthorized**: Within 90 days
- **Beyond 90 days**: Not eligible

---

## 8. How do you handle disputes and other issues?

### ✅ Comprehensive Dispute Resolution Process

**Direct Links**:
- **Web Page**: https://vukafia.com/dispute-resolution
- **Markdown File**: [DISPUTE_RESOLUTION_POLICY.md](/DISPUTE_RESOLUTION_POLICY.md)
- **PDF**: Available upon request

### How to File a Complaint

```
Email: info@vukafia.com
Subject: Dispute - [Type] - [Business Name]

Include:
- Your name and contact info
- Business name/ID involved
- Date of issue
- Detailed description
- Amount (if applicable)
- Evidence (screenshots, emails)
- Resolution requested
```

### Response Timeline

| Priority | Timeline | Examples |
|----------|----------|----------|
| 🔴 Critical | 24-48 hours | Threats, child safety, violence |
| 🟡 High | 2-5 days | Fraud, serious violations, harassment |
| 🟢 Standard | 5-10 days | Product quality, technical issues |

### Types of Disputes

**1. Seller Policy Violations**:
- Fraudulent business information
- Fake credentials or qualifications
- Prohibited business type
- Policy violations or illegal activity

**2. Harassment & Abuse**:
- Threatening or abusive communication
- Discrimination or discrimination
- Sexual harassment
- Repeated unwanted contact
- Doxxing or information sharing

**3. Payment/Claim Disputes**:
- Unauthorized charge
- Duplicate payment
- Failed payment

**4. Technical Issues**:
- System downtime
- Data loss
- Access problems
- Payment processing failures

**5. Buyer-Seller Disputes**:
- **Important**: NOT Vukafia responsibility
- **Action**: Refer to payment processor for chargeback

### Investigation Process

**Phase 1: Evidence Collection** (2-5 days)
- Request details from complainant
- Request response from respondent
- Gather transaction records
- Review system logs

**Phase 2: Verification** (3-7 days)
- Cross-reference with Google Maps data
- Verify payment records
- Review communication history
- Check policy compliance

**Phase 3: Assessment** (2-5 days)
- Neutral evaluation
- Evidence-based determination
- Policy application
- Final decision

### Resolution Outcomes

**For Seller Violations**:
| Outcome | Trigger | Action | Duration |
|---------|---------|--------|----------|
| **Warning** | Minor 1st violation | Education, 5-day cure period | 30 days monitoring |
| **Suspension** | Serious/repeated | Listing hidden, no new claims | 30-90 days |
| **Removal** | Severe/fraud | Account terminated, no refund | Immediate |

**For Harassment/Abuse**:
1. Warning → Escalation
2. Suspension → Communication block
3. Permanent removal → Account deleted
4. Law enforcement referral → For threats/violence

### Appeal Process

**Eligibility**: Within 15 days of notification

**Valid Reasons for Appeal**:
- ✅ New evidence emerges
- ✅ Factual error in decision
- ✅ Process violation
- ✅ Disproportionate penalty

**Invalid Reasons** (Cannot appeal):
- ❌ Confirmed fraud or illegal activity
- ❌ Repeated violations after warning
- ❌ Already appealed once

**Appeal Steps**:
1. Email info@vukafia.com with "APPEAL" in subject
2. Different reviewer assigned
3. 7-10 day review period
4. FINAL decision (no further appeal)

### Law Enforcement Cooperation

**We Report Immediately**:
- 🚨 Child exploitation
- 🚨 Human trafficking
- 🚨 Weapons/drug trafficking
- 🚨 Direct violence threats
- 🚨 Ongoing criminal activity

**We Report After Investigation**:
- 📋 Confirmed fraud
- 📋 Organized crime involvement
- 📋 Identity theft
- 📋 Money laundering

### Contact for Disputes

- 📧 **All Correspondence**: info@vukafia.com
- 💬 **WhatsApp**: +2348101477935

---

## Summary Table

| Question | Status | Link |
|----------|--------|------|
| 1. Seller pages & onboarding | ✅ Complete | 6-step process documented |
| 2. KYC information | ✅ Complete | Basic + Enhanced tiers |
| 3. Enhanced due diligence | ✅ Complete | 3-level screening framework |
| 4. Acceptable use policy | ✅ Published | https://vukafia.com/acceptable-use-policy |
| 5. Fulfillment model | ✅ B2B Directory | Vendors ship directly |
| 6. Fund holding | ✅ No funds held | Direct vendor payment only |
| 7. Refund policy | ✅ Published | https://vukafia.com/refund-policy |
| 8. Dispute handling | ✅ Published | https://vukafia.com/dispute-resolution |

---

## Key Points for Paystack

✅ **Business Model**: B2B directory facilitator, NOT marketplace  
✅ **Fund Holding**: NO - only $14.99 claim fee to Vukafia  
✅ **Vendor Responsibility**: Shipping, payment processing, dispute resolution  
✅ **Vukafia Role**: Discovery, verification, connection facilitation  
✅ **Compliance**: Full KYC, EDD, sanctions screening, policy enforcement  
✅ **Policies**: All published at vukafia.com with footer links  
✅ **Dispute Resolution**: Comprehensive 3-phase process with appeals  

---

**Document Version**: 2.0 (Updated October 13, 2026)  
**Status**: ✅ Ready for Submission  
**All Policies**: Published & Live  
**Web Integration**: Complete

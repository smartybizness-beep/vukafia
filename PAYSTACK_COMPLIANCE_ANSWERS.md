# Paystack Compliance Questionnaire - Complete Answers

**Company**: SOT Smartybiz Ltd  
**Platform**: Vukafia Trans-African Business Directory  
**Date**: October 13, 2026  
**Contact**: info@vukafia.com | +2348101477935

---

## Question 1: How does the unique page for sellers work, and how do you onboard vendors?

### Overview
Vukafia operates as a **B2B business directory platform**, not an e-commerce marketplace. Each seller (business) receives a unique, verified listing page on our platform that connects them with potential buyers, partners, and customers across 54 African nations.

### Seller Onboarding Process

**Step 1: User Registration**
- Email/password signup at vukafia.com
- Account activation via email verification
- User data securely stored in PostgreSQL database

**Step 2: Business Discovery & Claim**
- User searches Vukafia directory for their business
- Business data sourced from Google Maps (verified, real businesses)
- User initiates claim for their business

**Step 3: Pre-Population**
- Business information auto-populated from Google Maps:
  - Business name, address, phone, website
  - Hours of operation (if available)
  - Google ratings and review count
  - Google-verified photos
- User reviews and confirms information
- User can update/enhance details

**Step 4: KYC Verification**
- User provides contact email (verified)
- User provides phone number (for business contact)
- Optional: Government ID for high-risk categories
- Verification score assigned (80-100%)

**Step 5: Payment & Claim Activation**
- $14.99 USD one-time claim fee via Bachs or Paystack
- Payment verified and processed
- Claim marked as "Active" in database

**Step 6: Business Goes Live**
- Unique business page created: vukafia.com/business/[ID]
- Business indexed in search and directory
- WhatsApp integration enabled
- Business receives analytics dashboard access

### Unique Seller Pages
Each seller page includes:
- ✅ Business information (name, address, phone, website)
- ✅ Photos and ratings (from Google Maps)
- ✅ Contact options (WhatsApp, email, phone)
- ✅ Services/products offered
- ✅ Business hours and location map
- ✅ Analytics dashboard for seller
- ✅ 12-month directory placement
- ✅ Featured listing status

### Data Security
- HTTPS encryption for all transactions
- Passwords hashed with bcrypt
- JWT tokens for session authentication
- PCI DSS compliance for payment processing
- GDPR-compliant data handling

---

## Question 2: What KYC information do you collect from third-party sellers on your platform?

### Required KYC Information (Minimum)

**Tier 1: Basic Verification** (All sellers)
| Field | Required | Purpose |
|-------|----------|---------|
| Full Name | ✅ Yes | Account identity |
| Email Address | ✅ Yes | Communication, verification |
| Phone Number | ✅ Yes | Business contact, emergency |
| Business Name | ✅ Yes | Directory listing |
| Business Address | ✅ Yes | Verification, location |
| Business Category | ✅ Yes | Classification, compliance |
| Website (Optional) | ⭕ No | Additional verification |

**Tier 2: Enhanced KYC** (High-risk categories)
For businesses in sensitive categories (firearms, alcohol, gambling, financial services, medical):
| Field | Required | Purpose |
|-------|----------|---------|
| Government ID (National ID/Passport) | ✅ Yes | Identity verification |
| Business Registration Number | ✅ Yes | Legal business verification |
| Tax ID (TIN) | ✅ Yes | Tax compliance |
| Proof of Address | ✅ Yes | Physical location verification |
| Business License | ✅ Yes | Authority permission |

### Source Verification
- **Google Maps Verification**: All business data cross-referenced with Google Maps
- **Photo Verification**: Business photos compared to Google Maps images
- **Rating/Review Verification**: Genuine Google reviews validated
- **Address Verification**: Google Maps address matching

### Data Collection Method
1. **Web Form**: User enters information directly
2. **Google Maps Integration**: Data auto-populated from official Google listing
3. **Email Verification**: Confirmation email sent
4. **Phone Verification**: Optional SMS/call confirmation
5. **Document Upload**: For enhanced KYC categories

### Data Storage
- PostgreSQL database (encrypted fields)
- Separate from payment information
- Retention period: 7 years (per compliance)
- GDPR-compliant deletion on request

### Data Usage
- ✅ Business verification and listing
- ✅ Fraud detection and prevention
- ✅ Regulatory compliance
- ✅ Dispute resolution
- ✅ Analytics (anonymized)

**NOT used for**:
- ❌ Marketing without consent
- ❌ Third-party sales
- ❌ Credit assessment
- ❌ Risk scoring

---

## Question 3: Kindly confirm what type of enhanced due diligence you carry out on the vendors signing up on your platform.

### Enhanced Due Diligence (EDD) Framework

**Level 1: Automated Screening** (All vendors)

1. **Data Validation**
   - Email format verification
   - Phone number format validation
   - Address format and postal code check
   - Name format and pattern analysis

2. **Fraud Pattern Detection**
   - Duplicate account detection
   - Multiple claims from same person
   - Rapid successive claims (>5 in 1 hour)
   - Suspicious email patterns (@gmail vs @business domains)

3. **Source Verification**
   - Cross-reference with Google Maps
   - Photo authenticity comparison (AI image verification)
   - Rating and review validation
   - Website domain verification

**Level 2: Manual Review** (For flagged or high-risk vendors)

1. **Policy Compliance Check**
   - Business type against Acceptable Use Policy
   - Prohibited business types screening
   - Illegal activity indicators

2. **Information Consistency**
   - Phone number matches business records
   - Address matches Google Maps/registration
   - Website domain ownership verification
   - Business registration verification

3. **High-Risk Category Screening**
   - Financial services: License verification
   - Medical services: Practitioner registration
   - Alcohol/tobacco: Local licensing
   - Gambling: Government authorization

**Level 3: Enhanced Verification** (For high-risk or suspected fraud)

1. **Document Review**
   - Government ID verification
   - Business registration documents
   - Tax registration documents
   - Professional licenses
   - Bank account verification

2. **Sanctions Screening**
   - OFAC (US sanctions list) check
   - EU sanctions list check
   - UN consolidated list check
   - PEP (Politically Exposed Persons) check

3. **Background Investigation**
   - Legal action history search
   - Financial crime database check
   - Negative media search
   - Criminal record check (where legally permitted)

### Ongoing Monitoring

**Post-Claim Monitoring**
- Monthly compliance audits (random sample)
- Review of customer complaints
- Unusual transaction pattern monitoring
- Rating and review analysis
- Recurrence of policy violations

**Triggers for Re-Verification**
- Major change in business information
- Complaint received about vendor
- Suspicious activity detected
- Category change to high-risk
- Periodic re-verification (annually)

### Risk Scoring

| Score | Risk Level | Action |
|-------|-----------|--------|
| 90-100 | Low Risk | Approve immediately |
| 70-89 | Medium Risk | Manual review required |
| 40-69 | High Risk | Enhanced documents required |
| 0-39 | Critical Risk | Deny or escalate to legal |

### Timeline
- **Automated Screening**: 5 minutes
- **Manual Review**: 24-48 hours
- **Enhanced Verification**: 3-7 days
- **Sanctions Screening**: Real-time

### Documentation
- All EDD results recorded in database
- Audit trail maintained for 7 years
- Available for regulatory inspection
- Accessible via admin dashboard

---

## Question 4: Do you have an acceptable use policy? Kindly share the direct link.

### Yes, we have a comprehensive Acceptable Use Policy

**Direct Link**: https://vukafia.com/acceptable-use-policy

**Also Available**:
- **Markdown File**: `/ACCEPTABLE_USE_POLICY.md` (in repository)
- **PDF Available**: Upon request (info@vukafia.com)

### Policy Coverage

**Prohibited Business Types**:
- Unlicensed financial services (lending, forex, investment schemes)
- Illegal activities (drugs, weapons, human trafficking)
- Fraud operations (advance-fee schemes, fake documentation)
- Counterfeit goods, stolen property, endangered species
- Adult services, unregistered pharmaceuticals

**Prohibited Conduct**:
- Fraudulent business information
- Fake reviews and ratings
- Harassment and discrimination
- Intellectual property violations
- Spam and unsolicited contact

**Prohibited Content**:
- Hate speech and discrimination
- Sexually explicit material
- Graphic violence
- Child exploitation
- Health scams and misinformation

### Enforcement Actions

| Violation Type | Action | Duration |
|---|---|---|
| Minor (First) | Warning | 5 business days to cure |
| Serious or Repeated | Suspension | 30-90 days |
| Severe/Fraud | Permanent Removal | Immediate |

**Appeals Process**: 15-day window with new evidence

### Compliance Monitoring
- Real-time content scanning
- Manual compliance audits (random)
- Complaint-triggered investigation
- Periodic re-verification
- Third-party reporting capability

**Policy Last Updated**: October 13, 2026

---

## Question 5: Is your business a fulfillment center? Or are products directly shipped from third-party vendors to the customers who place orders?

### Business Model: B2B Directory Facilitator

**Vukafia is NOT**:
- ❌ An e-commerce marketplace
- ❌ A fulfillment center
- ❌ A payment processor
- ❌ A logistics provider
- ❌ An inventory holder

**Vukafia IS**:
- ✅ A B2B business directory
- ✅ A connection platform
- ✅ A discovery and verification service
- ✅ A communication facilitator

### Transaction Model

**Our Role**:
1. **Discovery**: Customers find businesses in directory
2. **Verification**: Confirmed business information
3. **Connection**: Direct contact information provided
4. **Communication**: WhatsApp/phone/email enabled
5. **Facilitation**: Buyer and seller connect directly

**Vendor Role**:
1. Maintains accurate business information
2. Responds to customer inquiries
3. Negotiates terms directly with buyer
4. Handles delivery and fulfillment
5. Processes payment (if desired)
6. Manages customer service and support

**Buyer Role**:
1. Searches and discovers businesses
2. Views verified information and ratings
3. Contacts vendor directly
4. Negotiates purchase terms
5. Arranges payment (direct to vendor)
6. Arranges delivery (direct with vendor)

### No Inventory Holdings
- Vukafia holds **zero inventory**
- No physical warehouse
- No stock management
- No supply chain operations
- No logistics partnership

### No Payment Holding
- Buyers pay vendors directly OR
- Buyers use payment processors (Paystack, Bachs, etc.)
- Vukafia does NOT hold funds
- Vukafia does NOT process transactions (except claim fees)
- Escrow services NOT offered

### Key Differentiator
```
Traditional E-commerce:
Buyer → E-commerce Platform → Vendor
       (funds held, inventory managed)

Vukafia Model:
Buyer → Directory → Vendor
        (connection only, no funds/inventory)
```

### Example Transaction

1. **Buyer searches** Vukafia for "Agricultural Supplies Nigeria"
2. **Finds verified seller**: FarmCorp Ltd, Lagos
3. **Clicks business listing** with Google-verified photos, ratings
4. **Contacts via WhatsApp**: Direct message to seller
5. **Negotiates price/delivery** directly with FarmCorp
6. **Arranges payment**: Bank transfer or cash
7. **Receives goods**: Direct from FarmCorp
8. **Resolves issues**: Directly with FarmCorp

**Vukafia's Role**: Steps 1-3 only (directory facilitation)

---

## Question 6: Do you hold the funds until the buyer has confirmed the order? If so, could you please describe the process you use to hold the funds pending buyer confirmation?

### Answer: NO, Vukafia Does NOT Hold Funds

**Important Clarification**: Vukafia is a B2B business directory, NOT a payment processor or marketplace. We do NOT:

- ❌ Hold buyer funds
- ❌ Process transactions
- ❌ Provide escrow services
- ❌ Manage payment disputes
- ❌ Hold funds pending confirmation
- ❌ Act as intermediary in payments

### Payment Responsibility

**Payment Processing**:
- Entirely between buyer and vendor
- Direct payment methods:
  - Bank transfer
  - Mobile money (M-Pesa, MTN Money, etc.)
  - Cash on delivery
  - Vendor's own payment processor
  - Third-party processors (Paystack, Flutterwave, etc.)

**Vukafia's ONLY Payment**:
- **Claim Verification Fee**: $14.99 USD
- **Who pays**: Business owner (seller)
- **Who receives**: Vukafia
- **Purpose**: Directory listing + verification + 12-month promotion
- **Processing**: Via Bachs (USD) or Paystack (local currency)

### Fund Flow

```
Claim Payment:
Vendor → Bachs/Paystack → Vukafia Account
(Vukafia retains funds for directory services)

Transaction Payment:
Buyer → [Vendor or Payment Processor] → Vendor
(Vukafia not involved)
```

### Dispute Resolution
- **Vendor-Vendor disputes**: Direct mediation or payment processor
- **Buyer-Vendor disputes**: Escalate to payment processor
- **Paystack**: Chargeback process
- **Bachs**: Transaction dispute process
- **Bank**: Traditional chargeback

Vukafia involvement:
- Informational only
- May remove fraudulent vendor
- Cannot reverse transactions
- May refer to authorities

### Refund Policy
See: https://vukafia.com/refund-policy

**Claim Fee Refunds**: Only for technical failures or fraud by Vukafia
**Transaction Refunds**: Handled by payment processor, not Vukafia

---

## Question 7: Do you have a refund policy? If yes, please share it.

### Yes, we have a comprehensive Refund Policy

**Direct Link**: https://vukafia.com/refund-policy

**Also Available**:
- **Markdown File**: `/REFUND_POLICY.md` (in repository)
- **PDF Available**: Upon request (info@vukafia.com)

### Claim Verification Fee - Non-Refundable

**Amount**: $14.99 USD (or local currency equivalent via Paystack)

**Why Non-Refundable**:
Immediate services delivered upon payment:
1. ✅ Business verification (Google Maps + photo validation)
2. ✅ Unique listing page created
3. ✅ 54-nation directory visibility
4. ✅ WhatsApp integration setup
5. ✅ Analytics dashboard access
6. ✅ 12-month featured placement

**Non-Refundable Scenarios**:
- ❌ Change of mind after payment
- ❌ Duplicate payments (refund only duplicate)
- ❌ User error
- ❌ Technical issues on buyer's device
- ❌ Claim suspension for policy violations
- ❌ Business closure or relocation

### Refundable Scenarios (Exceptions)

**1. Technical Failure by Vukafia** ✅
- Payment processed but listing NOT created (24hrs)
- Payment duplicated (charged twice)
- System error preventing access
- **Timeline**: 5-10 business days

**2. Unauthorized Transaction** ✅
- Payment without authorization
- Account compromised
- Fraudulent charge
- **Timeline**: 5-10 business days

**3. Service Unavailability** ✅
- Platform down 7+ consecutive days
- Major outage affecting service
- **Timeline**: 5-10 business days (plus credit option)

### Refund Request Process

```
1. Submit Request
   Email: info@vukafia.com
   Subject: Refund Request - [Business Name]
   Include: Transaction ID, date, amount, reason, evidence

2. Support Review
   Response: 5 business days
   Investigation: Up to 15 days if complex

3. Decision
   ✅ Approved → Refund issued in 5-10 business days
   ⚠️ Partial → Modified outcome
   ❌ Denied → Final decision, no further appeal

4. Refund Method
   Original payment method (Bachs/Paystack account)
   Timeline: 5-10 business days
```

### Transaction Disputes (Buyer-Seller)

**Important**: Vukafia is NOT responsible for buyer-seller transactions

- **Your responsibility**: Contact seller directly
- **Seller's refund policy**: Applies (not Vukafia's)
- **Payment processor**: Escalate for chargeback
  - Paystack: Dispute process
  - Bachs: Transaction dispute
  - Bank: Chargeback process

### Duplicate Payment Handling

If charged twice:
1. Report immediately to info@vukafia.com
2. Vukafia verifies duplicate transaction
3. Duplicate charge refunded within 3-5 business days
4. Original claim remains active
5. Second listing offered (if requested)

### Age of Transaction

Refund requests must be submitted:
- **Standard**: Within 30 days
- **Fraud/Unauthorized**: Within 90 days
- **Beyond 90 days**: Not eligible

### Chargeback Policy

If you initiate a chargeback:
- Account suspended pending investigation
- Chargeback fee applied ($25-50)
- Additional fraud verification required
- Business may be removed if chargeback invalid

---

## Question 8: How do you handle disputes and other issues?

### Comprehensive Dispute Resolution Process

**Direct Link**: https://vukafia.com/dispute-resolution

**Also Available**:
- **Markdown File**: `/DISPUTE_RESOLUTION_POLICY.md` (in repository)
- **PDF Available**: Upon request (info@vukafia.com)

### How to File a Dispute

**Step 1: Submit Complaint**
```
Email: info@vukafia.com
Subject: Dispute - [Type] - [Business Name] - [Details]

Include:
- Your name and contact info
- Business name and ID involved
- Date of transaction/issue
- Clear description of dispute
- Amount involved (if applicable)
- Evidence/documentation (screenshots, emails)
- Resolution requested
```

**Step 2: Response Timeline**
- 🟢 **Standard**: 5-10 business days
- 🟡 **High Priority**: 2-5 business days
- 🔴 **Urgent**: 24-48 hours

### Types of Disputes Handled

**1. Seller Policy Violations**
- Fraudulent business information
- Fake credentials or qualifications
- Prohibited business type
- Policy violations or illegal activity

**2. Harassment & Abuse Reports**
- Threatening or abusive communication
- Discrimination or harassment
- Sexual harassment
- Repeated unwanted contact
- Doxxing or personal information sharing

**3. Payment/Claim Disputes**
- Unauthorized charge
- Duplicate payment
- Failed payment
- Payment not processed

**4. Technical Issues**
- System downtime
- Data loss
- Access/login problems
- Payment processing failures

**5. Buyer-Seller Disputes**
**Important**: Not Vukafia's responsibility (see below)

### Dispute Resolution Process

**Phase 1: Evidence Collection** (2-5 days)
- Request detailed info from complainant
- Request response from respondent
- Gather transaction records
- Review system logs

**Phase 2: Verification** (3-7 days)
- Cross-reference with Google Maps data
- Verify payment records
- Review communication history
- Check policy compliance

**Phase 3: Assessment** (2-5 days)
- Neutral evaluation by staff
- No bias toward either party
- Evidence-based determination
- Policy application verification

### Resolution Outcomes

**For Seller Policy Violations**:

| Outcome | Trigger | Action | Duration | Appeal |
|---------|---------|--------|----------|--------|
| **Warning** | Minor 1st violation | Education letter | 5 days to cure | Yes |
| **Suspension** | Serious or repeated | Listing hidden | 30-90 days | Yes |
| **Removal** | Severe/fraud | Account terminated | Immediate | Limited |

**For Harassment/Abuse**:
1. **Warning** → Escalation to law enforcement
2. **Suspension** → Prevent communication
3. **Permanent Removal** → Delete account
4. **Law Enforcement Referral** → For threats/violence

**For Payment Disputes**:
- **Unauthorized**: Refund + investigation
- **Duplicate**: Refund duplicate charge
- **Failed Payment**: No charge, retry
- **Processing Error**: Refund + credit option

**For Buyer-Seller Disputes**:
- ❌ **NOT Vukafia responsibility**
- ✅ **Action**: Recommend direct resolution
- ✅ **Escalation**: Payment processor dispute/chargeback
- ⚠️ **Fraud Removal**: If seller scam confirmed

### Appeal Process

**Who Can Appeal?**
- Users with suspended or removed accounts
- Within 15 days of notification

**What Can Be Appealed?**
- ✅ New evidence emerges
- ✅ Claim factual error
- ✅ Process violation
- ✅ Disproportionate penalty

**What Cannot Be Appealed?**
- ❌ Confirmed fraud/illegal activity
- ❌ Repeated violations after warning
- ❌ Already appealed once

**Appeal Process**:
1. Submit to info@vukafia.com
2. Different reviewer (not original)
3. 7-10 day review period
4. Decision (Approved/Partial/Denied)
5. FINAL decision

### Harassment & Abuse Reporting

**Critical/Urgent** (24-48 hours):
- Direct threats of violence
- Child safety concerns
- Ongoing criminal activity
- Severe harassment

**High Priority** (2-5 days):
- Discrimination/abuse
- Sexual harassment
- Threats or intimidation
- Sustained contact

**Actions**:
1. Warn harasser
2. Suspend communication access
3. Block harasser account
4. Remove from platform
5. Law enforcement referral

### Law Enforcement Cooperation

**We Report Immediately**:
- 🚨 Child exploitation
- 🚨 Trafficking (human, weapons, drugs)
- 🚨 Direct violence threats
- 🚨 Ongoing criminal activity

**We Report After Investigation**:
- 📋 Confirmed fraud
- 📋 Organized crime
- 📋 Identity theft
- 📋 Money laundering

### Timeline Summary

| Dispute Type | Initial Response | Investigation | Resolution | Appeal |
|---|---|---|---|---|
| Policy violation | 24 hours | 5-15 days | 10-20 days | 10-15 days |
| Fraud | 24-48 hours | 3-10 days | 5-15 days | Limited |
| Payment dispute | 24 hours | 2-5 days | 5-10 days | 10 days |
| Harassment | 24 hours | 3-7 days | 5-10 days | 10 days |

### Contact for Disputes

- 📧 **Standard**: info@vukafia.com
- 🚨 **Urgent**: info@vukafia.com (mark URGENT)
- 💬 **WhatsApp**: +2348101477935
- ⚖️ **Legal**: legal@vukafia.com

---

## Summary

| Question | Answer | Link |
|----------|--------|------|
| 1. Seller pages & onboarding | Verified directory listings | https://vukafia.com/business/[id] |
| 2. KYC information | Email, phone, business info + enhanced for high-risk | PAYSTACK_COMPLIANCE_ANSWERS.md |
| 3. Enhanced due diligence | Automated screening + manual review + sanctions check | PAYSTACK_COMPLIANCE_ANSWERS.md |
| 4. Acceptable use policy | Yes - published and active | https://vukafia.com/acceptable-use-policy |
| 5. Fulfillment model | B2B directory (vendor ships directly) | PAYSTACK_COMPLIANCE_ANSWERS.md |
| 6. Fund holding | No - buyer pays vendor directly | PAYSTACK_COMPLIANCE_ANSWERS.md |
| 7. Refund policy | Yes - claim fee non-refundable, exceptions exist | https://vukafia.com/refund-policy |
| 8. Dispute handling | Comprehensive process with appeals | https://vukafia.com/dispute-resolution |

---

**Document Version**: 1.0  
**Date**: October 13, 2026  
**Ready for**: Paystack Merchant Account Onboarding  
**Status**: ✅ Complete & Comprehensive

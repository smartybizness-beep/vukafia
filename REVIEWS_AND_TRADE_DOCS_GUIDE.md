# Verified Reviews & Trade Docs Hub Implementation Guide

**Date**: October 13, 2026  
**Status**: ✅ Live (Deployed to Railway)  
**Features**: Bidirectional Reviews + Trade Compliance Hub

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Usage Examples](#usage-examples)
6. [Sample Data Setup](#sample-data-setup)
7. [Testing Checklist](#testing-checklist)

---

## Feature Overview

### #1: Verified Reviews System

**What it does:**
- ✅ Bidirectional reviews (buyers review sellers, sellers review buyers)
- ✅ Evidence/evidence support (screenshots, receipts required for approval)
- ✅ Seller responses (like Google Maps)
- ✅ Auto-escalation (low ratings <= 2 stars auto-flag)
- ✅ Rating aggregation (updates listing average rating)

**Flow:**
```
User submits review
    ↓
Optionally uploads evidence (screenshot/receipt)
    ↓
If evidence provided: Status = pending (awaiting approval)
If no evidence: Status = approved (published immediately)
    ↓
If rating <= 2: Auto-flags in review_disputes table
    ↓
Seller can respond to review
    ↓
If dispute resolved by seller: Status = resolved
```

**Use Cases:**
- Buyer rates seller: "Great communication, fast shipping" ⭐⭐⭐⭐⭐
- Seller rates buyer: "Professional, paid on time" ⭐⭐⭐⭐⭐
- Bad experience: "Product arrived damaged" ⭐ (auto-flags)

---

### #2: Trade Documentation & Compliance Hub

**What it does:**
- ✅ Trade document templates (invoices, packing lists, customs forms)
- ✅ Free 7-day access (then premium upgrade)
- ✅ Expert directory (customs brokers, lawyers, consultants)
- ✅ Trade compliance checklists (step-by-step guides by country pair)
- ✅ Country coverage: Nigeria, Kenya, Ghana, Benin

**Templates Include:**
- Export invoices
- Packing lists
- Bill of lading
- Customs declarations
- Insurance documentation
- Compliance checklists

**Expert Directory Includes:**
- Title: "Customs Broker", "Trade Lawyer", "Compliance Consultant"
- Expertise: customs_clearance, legal_documentation, compliance
- Trade routes served: ["Nigeria-Kenya", "Kenya-Ghana"]
- Rating and reviews

**Trade Checklists:**
- Nigeria → Kenya checklist
- Kenya → Ghana checklist
- Nigeria → Ghana checklist
- Ghana → Benin checklist
- (More routes can be added)

---

## Database Schema

### Tables Added

#### 1. **reviews** (Enhanced)
```sql
- reviewer_user_id (FK: users.id) -- Who left the review
- reviewer_type (enum: 'buyer', 'seller')
- status (enum: 'pending', 'approved', 'disputed', 'resolved')
- evidence_required (boolean)
- admin_notes (text)
```

#### 2. **review_evidence**
```sql
- review_id (FK: reviews.id)
- file_url (string) -- S3/Cloudinary URL
- file_type (enum: 'image', 'document', 'receipt')
- mime_type (string) -- image/png, application/pdf
- file_size (integer) -- bytes
- description (text)
- status (enum: 'pending', 'verified', 'rejected')
```

#### 3. **review_responses**
```sql
- review_id (FK: reviews.id)
- respondent_user_id (FK: users.id) -- Seller responding
- response_text (text)
- response_type (enum: 'explanation', 'apology', 'resolution')
- dispute_resolution (boolean) -- Does this resolve the dispute?
```

#### 4. **review_disputes**
```sql
- review_id (FK: reviews.id)
- listing_id (FK: listings.id)
- dispute_reason (enum: 'low_rating', 'inappropriate_content', 'unverified_claim', 'abuse')
- status (enum: 'flagged', 'investigating', 'resolved')
- investigation_notes (text)
- resolution (enum: 'upheld', 'removed', 'appeal_granted')
- assigned_to_user_id (FK: users.id) -- Admin handling case
- resolved_at (timestamp)
```

#### 5. **templates**
```sql
- name (string) -- "Export Invoice"
- description (text)
- category (enum: 'invoicing', 'shipping', 'compliance', 'customs')
- file_url (string) -- PDF/DOC URL
- country_code (string) -- NG, KE, GH, BJ
- country_name (string)
- trade_route (string) -- "Nigeria-Kenya"
- instructions (text) -- How to fill out
- access_days (integer) -- 7 days free
- template_type (enum: 'invoice', 'packing', 'permit', 'customs', 'insurance', 'checklist')
```

#### 6. **template_access**
```sql
- user_id (FK: users.id)
- template_id (FK: templates.id)
- first_access_at (timestamp)
- free_access_expires_at (timestamp) -- 7 days from first access
- has_paid (boolean)
- paid_at (timestamp)
- paid_amount (decimal)
- payment_ref (string) -- Paystack/Flutterwave ref
```

#### 7. **experts**
```sql
- name (string)
- title (string) -- "Customs Broker", "Trade Lawyer"
- expertise (enum: 'customs_clearance', 'legal_documentation', 'compliance')
- country_code (string) -- NG, KE, GH, BJ
- city (string)
- bio (text)
- phone (string)
- email (string)
- website (string)
- company_name (string)
- trade_routes_served (json) -- ["Nigeria-Kenya", "Kenya-Ghana"]
- years_experience (integer)
- rating (decimal 1-5)
- review_count (integer)
- verified (boolean)
- status (enum: 'active', 'inactive', 'pending_verification')
```

#### 8. **checklists**
```sql
- title (string) -- "How to Export from Nigeria to Kenya"
- from_country_code (string) -- NG
- to_country_code (string) -- KE
- step_count (integer)
- introduction (text)
- documentation_notes (text)
- customs_notes (text)
- timeline (text) -- "3-5 days"
- estimated_cost (decimal)
- contacts (json)
```

#### 9. **checklist_steps**
```sql
- checklist_id (FK: checklists.id)
- step_number (integer)
- title (string) -- "Get HS Code Classification"
- description (text)
- documents_needed (text)
- responsible_party (string) -- "Exporter", "Broker"
- duration (string) -- "1-2 days"
- estimated_cost (decimal)
- tips (text) -- Pro tips
- order (integer)
```

---

## API Endpoints

### Reviews API

#### **POST /api/reviews** — Create Review
```bash
curl -X POST https://vukafia.com/api/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": 5,
    "rating": 4,
    "comment": "Excellent product, fast shipping!",
    "reviewer_type": "buyer",
    "evidence_urls": [
      {
        "file_url": "https://s3.../screenshot.png",
        "file_type": "image",
        "mime_type": "image/png",
        "file_size": 102400,
        "description": "Screenshot of delivery"
      }
    ]
  }'
```

**Response:**
```json
{
  "id": 42,
  "status": "published",
  "message": "Review published"
}
```

---

#### **GET /api/reviews/listing/:listing_id** — Get Listing Reviews
```bash
curl https://vukafia.com/api/reviews/listing/5
```

**Response:**
```json
{
  "listing_id": 5,
  "total_reviews": 3,
  "reviews": [
    {
      "id": 42,
      "reviewer_user_id": 10,
      "reviewer_name": "Kofi Mensah",
      "reviewer_type": "buyer",
      "rating": 5,
      "comment": "Excellent service!",
      "status": "approved",
      "created_at": "2026-10-13T10:30:00Z",
      "evidence": [
        {
          "id": 1,
          "file_url": "https://s3.../screenshot.png",
          "file_type": "image",
          "status": "verified"
        }
      ],
      "responses": [
        {
          "id": 1,
          "responder_name": "John Supplier",
          "response_text": "Thank you for your business!",
          "response_type": "explanation"
        }
      ]
    }
  ]
}
```

---

#### **POST /api/reviews/:review_id/response** — Seller Response
```bash
curl -X POST https://vukafia.com/api/reviews/42/response \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response_text": "Thank you for your feedback! We appreciate your business.",
    "response_type": "explanation",
    "dispute_resolution": false
  }'
```

---

#### **POST /api/reviews/:review_id/dispute** — Flag for Review
```bash
curl -X POST https://vukafia.com/api/reviews/42/dispute \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dispute_reason": "inappropriate_content"
  }'
```

---

### Templates API

#### **GET /api/templates** — List Templates
```bash
curl "https://vukafia.com/api/templates?country=NG&category=invoicing"
```

**Response:**
```json
{
  "total": 5,
  "templates": [
    {
      "id": 1,
      "name": "Export Invoice Template",
      "category": "invoicing",
      "country_name": "Nigeria",
      "trade_route": "Nigeria-Kenya",
      "template_type": "invoice",
      "description": "Professional export invoice for use in Nigeria-Kenya trade",
      "file_url": "https://s3.../invoice_template.pdf"
    }
  ]
}
```

---

#### **POST /api/templates/:id/download** — Download (Free 7 Days)
```bash
curl -X POST https://vukafia.com/api/templates/1/download \
  -H "Authorization: Bearer TOKEN"
```

**Response (First Time):**
```json
{
  "file_url": "https://s3.../invoice_template.pdf",
  "access_type": "free_trial",
  "days_remaining": 7,
  "expires_at": "2026-10-20T10:30:00Z",
  "message": "First-time download! Free access for 7 days"
}
```

**Response (After 7 Days):**
```json
{
  "error": "Free access expired",
  "message": "Please upgrade to premium access",
  "access_expired": true
}
```

---

#### **GET /api/templates/experts** — Expert Directory
```bash
curl "https://vukafia.com/api/templates/experts?country=NG&expertise=customs_clearance"
```

**Response:**
```json
{
  "total": 3,
  "experts": [
    {
      "id": 1,
      "name": "Ahmed Hassan",
      "title": "Customs Broker",
      "expertise": "customs_clearance",
      "country_name": "Nigeria",
      "city": "Lagos",
      "phone": "+234 810 147 7935",
      "email": "ahmed@customsng.com",
      "company_name": "Customs Clearing House",
      "trade_routes_served": ["Nigeria-Kenya", "Nigeria-Ghana"],
      "years_experience": 12,
      "rating": 4.8,
      "review_count": 45,
      "verified": true
    }
  ]
}
```

---

#### **GET /api/templates/checklists/:from/:to** — Trade Checklist
```bash
curl https://vukafia.com/api/templates/checklists/NG/KE
```

**Response:**
```json
{
  "id": 1,
  "title": "How to Export from Nigeria to Kenya",
  "from_country": "Nigeria",
  "to_country": "Kenya",
  "introduction": "Step-by-step guide to successfully export goods from Nigeria to Kenya...",
  "timeline": "3-5 business days",
  "estimated_cost": 150.50,
  "steps": [
    {
      "id": 1,
      "step_number": 1,
      "title": "Get HS Code Classification",
      "description": "Determine the Harmonized System (HS) code for your product...",
      "documents_needed": "Product specifications, invoice",
      "responsible_party": "Exporter",
      "duration": "same day",
      "estimated_cost": 0,
      "tips": "Use the official HS code database..."
    }
  ]
}
```

---

## Frontend Components

### ReviewForm Component
**Path**: `frontend/src/components/ReviewForm.jsx`

**Props:**
- `listingId` (number) — Business listing ID
- `onSubmit` (function) — Callback on successful submit
- `onCancel` (function) — Callback to close form

**Features:**
- 5-star rating system with emoji feedback
- Comment textarea
- Reviewer type selector (buyer/seller)
- Multiple file upload for evidence
- Auto-submits to `/api/reviews`

**Usage:**
```jsx
import ReviewForm from './components/ReviewForm';

<ReviewForm 
  listingId={5}
  onSubmit={(result) => console.log('Review submitted:', result)}
  onCancel={() => setShowForm(false)}
/>
```

---

### ReviewsList Component
**Path**: `frontend/src/components/ReviewsList.jsx`

**Props:**
- `listingId` (number) — Business listing ID

**Features:**
- Displays all reviews for a listing
- Shows evidence (screenshots)
- Shows seller responses
- Shows status badges
- Loading state handling

**Usage:**
```jsx
import ReviewsList from './components/ReviewsList';

<ReviewsList listingId={5} />
```

---

### TemplatesPage
**Path**: `frontend/src/pages/TemplatesPage.jsx`  
**Route**: `/templates`

**Features:**
- Browse all templates
- Filter by country and category
- Download button with 7-day free access tracking
- Shows remaining days
- Premium upgrade CTA after free access expires

---

### ChecklistPage
**Path**: `frontend/src/pages/ChecklistPage.jsx`  
**Route**: `/checklists/:from/:to` (e.g., `/checklists/NG/KE`)

**Features:**
- Interactive step-by-step checklist
- Progress bar with completion percentage
- Checkbox to mark steps complete
- Shows documents needed, duration, cost, tips
- Completion celebration message

---

## Usage Examples

### Example 1: Buyer Leaving a Review

**Scenario:** Kofi purchased cocoa from a Nigerian exporter

```jsx
import { useState } from 'react';
import ReviewForm from './ReviewForm';

export default function BusinessDetail() {
  const [showReview, setShowReview] = useState(false);

  return (
    <div>
      <button onClick={() => setShowReview(true)}>
        ⭐ Leave a Review
      </button>

      {showReview && (
        <ReviewForm
          listingId={5}
          onSubmit={(result) => {
            alert('Review submitted!');
            setShowReview(false);
          }}
          onCancel={() => setShowReview(false)}
        />
      )}
    </div>
  );
}
```

---

### Example 2: Accessing Trade Templates

**User wants to export from Nigeria to Kenya:**

1. Click "📄 Templates" in navigation
2. Select "Nigeria" from country filter
3. Filter by "Export Invoice"
4. Click "Download (Free - 7 days)"
5. Receives access for 7 days
6. After 7 days, upgrade to premium or request new access

---

### Example 3: Using Trade Checklist

**User navigating Nigeria → Kenya export:**

```
URL: /checklists/NG/KE
    ↓
Loads: "How to Export from Nigeria to Kenya"
    ↓
Shows steps:
  1. Get HS Code Classification (same day, no cost)
  2. Obtain Certificate of Origin (1-2 days, $25)
  3. Register with Kenya Revenue Authority (same day, $0)
  ... (7+ more steps)
    ↓
User checks off completed steps
    ↓
Progress bar updates: 0% → 14% → 28% ...
    ↓
At 100%: Celebration message "You're ready to export! 🚀"
```

---

## Sample Data Setup

### SQL to Populate Sample Data

#### 1. Add Sample Templates
```sql
INSERT INTO templates (name, description, category, country_code, country_name, trade_route, template_type, active) 
VALUES
('Export Invoice Template', 'Professional export invoice for Nigeria-Kenya trade', 'invoicing', 'NG', 'Nigeria', 'Nigeria-Kenya', 'invoice', true),
('Packing List Template', 'Standard packing list with weight/dimensions', 'shipping', 'NG', 'Nigeria', 'Nigeria-Kenya', 'packing', true),
('Customs Declaration Form', 'Nigerian customs declaration for Kenya-bound shipments', 'customs', 'NG', 'Nigeria', 'Nigeria-Kenya', 'permit', true);
```

#### 2. Add Sample Experts
```sql
INSERT INTO experts (name, title, expertise, country_code, country_name, city, phone, email, company_name, trade_routes_served, years_experience, rating, verified, status)
VALUES
('Ahmed Hassan', 'Customs Broker', 'customs_clearance', 'NG', 'Nigeria', 'Lagos', '+234 810 147 7935', 'ahmed@customsng.com', 'Customs Clearing House', '["Nigeria-Kenya", "Nigeria-Ghana"]', 12, 4.8, true, 'active'),
('Dr. Stella Okoro', 'Trade Lawyer', 'legal_documentation', 'NG', 'Nigeria', 'Lagos', '+234 703 555 1234', 'stella@tradelaw.ng', 'Okoro Legal Associates', '["Nigeria-Kenya", "Nigeria-Ghana", "Nigeria-Benin"]', 8, 4.9, true, 'active');
```

#### 3. Add Sample Checklist (Nigeria → Kenya)
```sql
INSERT INTO checklists (title, from_country_code, from_country, to_country_code, to_country, introduction, timeline, estimated_cost, active)
VALUES
('How to Export from Nigeria to Kenya', 'NG', 'Nigeria', 'KE', 'Kenya', 
 'Step-by-step guide to successfully export goods from Nigeria to Kenya with all required documentation...',
 '3-5 business days', 150.50, true);

INSERT INTO checklist_steps (checklist_id, step_number, title, description, documents_needed, responsible_party, duration, estimated_cost, tips)
VALUES
(1, 1, 'Get HS Code Classification', 'Determine the HS code for your product...', 'Product specs, invoice', 'Exporter', 'same day', 0, 'Use official HS database'),
(1, 2, 'Obtain Certificate of Origin', 'Apply for Chamber of Commerce certificate...', 'Invoice, packing list', 'Chamber', '1-2 days', 25, 'Apply early to avoid delays'),
(1, 3, 'Register with KRA', 'Notify Kenya Revenue Authority...', 'Import license, passport', 'Exporter', 'same day', 0, 'Done online');
```

---

## Testing Checklist

### Backend Tests
- [ ] POST /api/reviews — Create review with evidence
- [ ] POST /api/reviews — Create review without evidence
- [ ] POST /api/reviews — Auto-flag for low rating (<=2)
- [ ] GET /api/reviews/listing/:id — Get reviews
- [ ] POST /api/reviews/:id/response — Seller response
- [ ] POST /api/reviews/:id/dispute — Flag review
- [ ] GET /api/templates — List with filters
- [ ] POST /api/templates/:id/download — First download (free)
- [ ] POST /api/templates/:id/download — After 7 days (expired)
- [ ] GET /api/templates/experts — Expert directory
- [ ] GET /api/templates/checklists/:from/:to — Checklist with steps

### Frontend Tests
- [ ] ReviewForm renders and submits
- [ ] ReviewsList displays reviews
- [ ] TemplatesPage filters work
- [ ] Download button tracks 7-day access
- [ ] ChecklistPage loads and marks steps complete
- [ ] Progress bar updates correctly
- [ ] Routes work: /templates, /checklists/NG/KE

### Integration Tests
- [ ] User can create review with screenshot
- [ ] Seller can respond to review
- [ ] Low rating auto-escalates
- [ ] Template access expires after 7 days
- [ ] Checklist progress persists (localStorage)
- [ ] Email notifications when review posted (if enabled)

---

## Next Steps

### Phase 2: Premium Features (Optional)
- [ ] Paystack integration for premium template access
- [ ] Expert booking system (schedule consultation)
- [ ] AI-powered document generation
- [ ] Review analytics dashboard for sellers
- [ ] Multi-language support for checklists

### Phase 3: Advanced Features
- [ ] Bulk template downloads
- [ ] Video tutorials for checklists
- [ ] Real-time expert availability
- [ ] Trade route cost calculator
- [ ] Shipping integration

---

**Document Version**: 1.0  
**Last Updated**: October 13, 2026  
**Status**: Ready for production deployment ✅

# End-to-End Testing Guide - Claim Business with Payment

**Date**: October 8, 2026  
**Status**: Testing Checklist  
**Environment**: https://vukafia.com (Production)

---

## 🎯 Complete Testing Flow

### Phase 1: Authentication

#### Step 1.1: Test Signup
1. Go to https://vukafia.com
2. Click **👤 Login** button in navbar
3. Switch to **Sign Up** tab
4. Fill in:
   - **Name**: Test Business Owner
   - **Email**: test@example.com
   - **Phone**: +234 810 147 7935
   - **Password**: TestPassword123
   - **Confirm Password**: TestPassword123
5. Click **✍️ Create Account**
6. **Expected**: Account created, modal closes, user name shows in navbar

#### Step 1.2: Test Login After Logout
1. Click **Logout** button in navbar
2. Click **👤 Login** button
3. Fill in:
   - **Email**: test@example.com
   - **Password**: TestPassword123
4. Click **👤 Login**
5. **Expected**: Successfully logged in, user name shows in navbar

---

### Phase 2: Search & Select Business

#### Step 2.1: Search Business to Claim
1. Make sure you're logged in
2. Click **Claim Business** button in navbar
3. Search for business:
   - **Business Name**: Haier (or any business in your database)
   - **Country**: Nigeria
4. Click **Search**
5. **Expected**: List of matching businesses appears

#### Step 2.2: Select Business
1. Click on "Haier Thermocool Showroom" (or your test business)
2. **Expected**: Business selected, shows business details

---

### Phase 3: Ownership Verification

#### Step 3.1: Enter Phone Number
1. Enter phone number that matches business phone
   - Example: +234 810 147 7935 (or business's actual phone)
2. Click **Verify Ownership**
3. **Expected**: Success message, proceed to OTP step

#### Step 3.2: Receive & Enter OTP
1. You should receive OTP via WhatsApp or console log
2. **Note**: In test environment, OTP sent to console
3. Enter 6-digit OTP
4. Click **Verify OTP**
5. **Expected**: OTP verified, proceed to edit business info

---

### Phase 4: Edit Business Information

#### Step 4.1: Update Business Details
1. Fill in optional fields:
   - **Business Photo URL**: (can leave blank or add image URL)
   - **Business Phone**: +234 810 147 7935
   - **Business Email**: business@example.com
   - **Business Website**: https://example.com
   - **Contact Name**: John Doe
2. Click **Next: Review Payment**
3. **Expected**: Proceed to payment step

---

### Phase 5: Payment Selection (CRITICAL TEST)

#### Step 5.1: Select Payment Method

**Option A: Test Paystack**
1. Select **💳 Paystack** button
2. Select currency: **USD** or **NGN**
3. Click **💳 Pay with Paystack**
4. **Expected**: Redirected to Paystack payment page
5. Use Paystack test card:
   - Card: 4111111111111111
   - Expiry: 01/50
   - CVV: 123
6. **Expected**: Payment success, redirected back to website

**Option B: Test Bachs (NEW)**
1. Select **💳 Bachs (NEW)** button
2. Select currency: **USD** or **NGN**
3. Click **💳 Pay with Bachs**
4. **Expected**: Redirected to Bachs checkout page
5. **In Sandbox**: Use test card details (from Bachs docs)
6. Complete payment
7. **Expected**: Webhook received, claim verified

**Option C: Test WhatsApp Manual**
1. Select **💬 WhatsApp** button
2. Select currency: **USD** or **NGN**
3. Click **💬 Pay via WhatsApp**
4. **Expected**: Opens WhatsApp with pre-filled message
5. Message format:
   ```
   Hi Vukafia! I want to claim my business and am ready to pay 
   $14.99 USD. Please send me payment instructions.
   ```

---

### Phase 6: Verification & Completion

#### Step 6.1: Verify Payment Processed
1. **For Paystack**: Should auto-verify after payment success
2. **For Bachs**: Check webhook in Bachs Dashboard:
   - Go to: https://dashboard.bachs.io → Events
   - Look for: `collection.succeeded` event
   - **Expected**: Event shows 0% error rate
3. **For WhatsApp**: Manual verification within 2 hours

#### Step 6.2: Check Claim Success
1. Go back to homepage
2. Search for the claimed business
3. **Expected**: Business shows with ✅ verified badge
4. Click on business
5. **Expected**: Business detail page loads with all info

---

## 🧪 Test Scenarios

### Scenario 1: Complete Flow with Bachs (RECOMMENDED FOR TESTING)
```
Time Required: ~10 minutes
Steps: Signup → Search → Verify → Edit → Bachs Payment → Webhook Confirmation
```

### Scenario 2: Complete Flow with Paystack
```
Time Required: ~8 minutes
Steps: Signup → Search → Verify → Edit → Paystack Payment → Auto Verification
```

### Scenario 3: Complete Flow with WhatsApp
```
Time Required: ~5 minutes (instant) + 2 hours (manual verification)
Steps: Signup → Search → Verify → Edit → WhatsApp Manual → Wait for verification
```

### Scenario 4: Error Handling
```
Test Cases:
- Wrong phone number → Error message
- Invalid OTP → Error message
- Expired OTP → Resend option
- Payment failure → Retry option
- Not logged in → Login prompt
```

---

## ✅ Testing Checklist

### Authentication
- [ ] Signup works correctly
- [ ] Login works correctly
- [ ] User name shows in navbar when logged in
- [ ] Logout works correctly
- [ ] Cannot claim without logging in
- [ ] "Please Log In" message shows on payment step if logged out

### Business Search
- [ ] Can search by business name
- [ ] Can filter by country
- [ ] Search results display correctly
- [ ] Can select business from results
- [ ] Business details show correctly

### Ownership Verification
- [ ] Phone verification works
- [ ] OTP generation works
- [ ] OTP entry validation works
- [ ] Can resend OTP if needed
- [ ] Expired OTP shows error

### Business Info Editing
- [ ] Can edit all optional fields
- [ ] Photo URL saves correctly
- [ ] Contact info saves correctly
- [ ] Can proceed to payment step

### Payment - Paystack
- [ ] Paystack button selectable
- [ ] Currency selector works (USD/NGN)
- [ ] Redirects to Paystack correctly
- [ ] Test payment processes
- [ ] Auto-verification works after payment
- [ ] Verified badge appears

### Payment - Bachs (NEW)
- [ ] Bachs button visible with "(NEW)" label
- [ ] Bachs button selectable
- [ ] Currency selector works (USD/NGN)
- [ ] Redirects to Bachs checkout
- [ ] Test payment processes
- [ ] Webhook received (check Bachs Dashboard)
- [ ] Verified badge appears after webhook

### Payment - WhatsApp
- [ ] WhatsApp button selectable
- [ ] Currency selector works (USD/NGN)
- [ ] Opens WhatsApp with pre-filled message
- [ ] Message includes correct amount and currency
- [ ] Manual verification process works

### Overall Flow
- [ ] Can complete full flow without errors
- [ ] Verified badge appears after payment
- [ ] Can search and view claimed business
- [ ] Business detail page shows all info
- [ ] Multiple users can claim different businesses

---

## 🔍 Debugging Tips

### Check Browser Console
```javascript
// Check localStorage
console.log(localStorage.getItem('auth_token'))
console.log(localStorage.getItem('auth_user'))

// Check API calls
// Open DevTools → Network tab
// Filter for /api/auth, /api/claims
```

### Monitor Bachs Webhooks
1. Go to https://dashboard.bachs.io
2. Click **Events** tab
3. Look for webhook deliveries
4. Check for `collection.succeeded` events
5. View response and payload

### Monitor Backend Logs
```bash
# SSH into your Railway app
# Check logs for:
# - [BACHS] Checkout session created
# - [BACHS WEBHOOK] Processing event
# - [CRAWLER JOB] ✅ SUCCESS
```

### Test Different Scenarios
```
Test with:
- Different currencies (USD vs NGN)
- Different payment methods (Paystack vs Bachs vs WhatsApp)
- Different business types (Product, Service, Restaurant, etc.)
- Different countries
- Network issues (disable internet after clicking pay)
```

---

## 📊 Expected Results

### Success Indicators

**✅ Authentication**
- User created successfully
- Token stored in localStorage
- User can log out and log back in

**✅ Business Claim**
- Business found in search
- Ownership verified via phone
- OTP validation works
- Business info can be edited

**✅ Payment**
- **Paystack**: Instant verification after payment
- **Bachs**: Webhook received within seconds
- **WhatsApp**: Manual 2-hour verification
- Verified badge appears on business

**✅ User Experience**
- Clear error messages
- No console errors
- Responsive on mobile
- Fast load times

---

## ⚠️ Common Issues & Fixes

### Issue: "Please log in first" but no login button visible
- **Fix**: Refresh page, button should appear in navbar
- **Verify**: Check localStorage has auth_token

### Issue: Business not found in search
- **Fix**: Ensure business exists in database
- **Check**: Search with different keywords

### Issue: OTP not received
- **Fix**: Check console logs for OTP code (in test env)
- **Verify**: Phone number matches business phone
- **Note**: In production, OTP sent via WhatsApp

### Issue: Bachs redirect not working
- **Fix**: Check BACHS_API_KEY in .env
- **Verify**: BACHS_API_URL is correct (https://api.bachs.io/v1)

### Issue: Webhook not received
- **Fix**: Check webhook URL registered in Bachs Dashboard
- **Verify**: URL is https://vukafia.com/api/claims/bachs-webhook
- **Monitor**: Check Events tab in Bachs Dashboard

---

## 🚀 Testing Priority

### Must Test (Blocking)
1. ✅ Authentication flow (signup/login)
2. ✅ Business search and claim
3. ✅ At least ONE payment method (recommend Bachs new)

### Should Test (Important)
4. ✅ All three payment methods
5. ✅ Error handling
6. ✅ Webhook verification

### Nice to Test (Polish)
7. ✅ Mobile responsiveness
8. ✅ Multiple claims with different users
9. ✅ Currency switching (USD vs NGN)

---

## 📝 Testing Report Template

```
TEST RUN: [Date/Time]
Tester: [Name]
Environment: Production (vukafia.com)

✅ Authentication
- Signup: PASS / FAIL
- Login: PASS / FAIL
- Logout: PASS / FAIL

✅ Business Search
- Search: PASS / FAIL
- Filter: PASS / FAIL

✅ Ownership Verification
- Phone: PASS / FAIL
- OTP: PASS / FAIL

✅ Payment - [Method]
- Redirect: PASS / FAIL
- Payment: PASS / FAIL
- Verification: PASS / FAIL

Issues Found:
1. [Issue]
2. [Issue]

Overall: PASS / FAIL
```

---

## 🎯 Sign-Off Criteria

Website is **READY FOR PRODUCTION** when:

- ✅ All authentication flows work
- ✅ Business claim flow completes
- ✅ At least one payment method verified
- ✅ Verified badge appears correctly
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Webhooks being received
- ✅ Users can see claimed businesses

---

**Good luck testing! 🚀**

For issues, check the logs in Railway Dashboard or contact support.

---

*Generated: October 8, 2026*  
*Framework: React 18 + Express.js*  
*Payment Providers: Paystack, Bachs, WhatsApp Manual*

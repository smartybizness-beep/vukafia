# Vukafia WhatsApp Message Templates Integration

Your WhatsApp integration now automatically sends templates at key points in the claim flow. Here's how it all works.

## 📋 Templates Created

You need to create these 4 templates in Meta Business Manager:

### **1. claim_invitation** (Marketing)
**When it's sent:** When you run a claim campaign targeting unclaimed businesses

**Template name in Meta:** `claim_invitation`  
**Parameters:** 3
```
{{1}} - Business owner's first name
{{2}} - Business name
{{3}} - Claim link
```

**Example message:**
```
🎉 Hello John!

Your business "ABC Store" is on Vukafia (verified from Google Maps).

Claim it now for $15 to:
✅ Get verified badge
✅ Manage your profile
✅ Respond to customers
✅ Boost visibility

[Claim Your Business](https://vukafia.com/claim/123)

Questions? Reply here! 📞
```

---

### **2. claim_verified** (Transactional)
**When it's sent:** Automatically after successful payment & claim verification

**Template name in Meta:** `claim_verified`  
**Parameters:** 3
```
{{1}} - Business owner's first name
{{2}} - Business name
{{3}} - Business profile link
```

**Automatically sent to:** The business phone number on file  
**Timing:** 2 seconds after payment confirmation

**Example message:**
```
✅ Congratulations John!

Your business "ABC Store" is now verified on Vukafia!

Your verified badge is active.
[Manage Your Profile](https://vukafia.com/business/123)

Welcome to Vukafia! 🎉
```

---

### **3. payment_confirmation** (Transactional)
**When it's sent:** Automatically right after successful Bachs payment

**Template name in Meta:** `payment_confirmation`  
**Parameters:** 3
```
{{1}} - Business name
{{2}} - Amount (e.g., "14.99")
{{3}} - Business profile link
```

**Automatically sent to:** The business phone number on file  
**Timing:** Immediately after payment completes

**Example message:**
```
💳 Payment Received!

Business: ABC Store
Amount: $14.99
Status: ✅ Verified

[View Your Listing](https://vukafia.com/business/123)

Thank you for choosing Vukafia! 🙏
```

---

### **4. otp_verification** (Transactional)
**When it's sent:** When 2FA OTP is needed (future feature)

**Template name in Meta:** `otp_verification`  
**Parameters:** 1
```
{{1}} - OTP code (e.g., "123456")
```

**Example message:**
```
🔐 Your Vukafia OTP Code

123456

This code expires in 10 minutes.
Never share this code with anyone.
```

---

## 🔄 Automatic Flow

```
1. User Completes Payment (Bachs)
   ↓
2. Payment Verified ✅
   ↓
3. Listing marked as Claimed
   ↓
4. AUTOMATIC: Send payment_confirmation template
   ↓
5. AUTOMATIC: Send claim_verified template (2 seconds later)
   ↓
6. Business owner sees both confirmations on WhatsApp
```

---

## 📱 Code Integration

### **Auto-sent on Successful Claim**

In `routes/claims.js`, after payment verification:
```javascript
// These are sent automatically (non-blocking)
sendPaymentConfirmationTemplate(businessPhone, businessName, 14.99, businessId);
sendClaimVerifiedTemplate(businessPhone, businessName, businessId);
```

### **Campaign: Bulk Invitations**

In `services/claimCampaign.js`, when running campaigns:
```javascript
// Sends claim_invitation template to all businesses in batch
await sendClaimInvitationTemplate(phone, businessName, businessId);
```

### **Send Template Manually in Your Code**

```javascript
const { sendClaimInvitationTemplate } = require('./services/whatsappService');

// Send claim invitation
await sendClaimInvitationTemplate(
  '2348101477935',        // Phone number
  'ABC Store',            // Business name
  123                     // Business ID
);
```

---

## ✅ How to Create Templates in Meta

1. Go to [business.facebook.com](https://business.facebook.com)
2. **Tools** → **Message Templates** (or Settings → Message Templates)
3. Click **Create Template**
4. For each template:
   - **Name:** Use the exact name from above (e.g., `claim_invitation`)
   - **Category:** Choose `Marketing` or `Transactional`
   - **Language:** English (US)
   - **Body:** Write the message with `{{1}}`, `{{2}}`, `{{3}}` for parameters
5. Submit for approval (usually 15-30 mins)

---

## 🧪 Test Template Sending

Once templates are approved, test sending:

```bash
curl --request POST \
  --url https://graph.instagram.com/v18.0/1286946574511055/messages \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "messaging_product": "whatsapp",
    "to": "2348101477935",
    "type": "template",
    "template": {
      "name": "claim_verified",
      "language": { "code": "en_US" },
      "parameters": {
        "body": {
          "parameters": [
            { "type": "text", "text": "John" },
            { "type": "text", "text": "ABC Store" },
            { "type": "text", "text": "https://vukafia.com/business/123" }
          ]
        }
      }
    }
  }'
```

---

## 📊 Template Status

| Template | Status | Created | Approved | Integrated |
|----------|--------|---------|----------|------------|
| claim_invitation | ⏳ Pending | Need to create | Waiting | ✅ Ready |
| claim_verified | ⏳ Pending | Need to create | Waiting | ✅ Ready |
| payment_confirmation | ⏳ Pending | Need to create | Waiting | ✅ Ready |
| otp_verification | ⏳ Pending | Need to create | Waiting | ✅ Ready |

---

## 🚀 Deployment

Everything is ready! Just:

1. **Create templates in Meta** (the 4 templates above)
2. **Wait for approval** (usually 15-30 mins)
3. **Push code to Railway:**
   ```bash
   git push origin main  # Already done! ✅
   ```
4. **Test the flow:**
   - Complete a claim with payment
   - Check if templates arrive on the business WhatsApp

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Templates not sending | Check template names match exactly in Meta |
| "Template name not found" | Template not created yet in Meta, or still pending approval |
| Typo in template name | Template names are case-sensitive: use lowercase |
| Parameters missing | Make sure you provide all {{1}}, {{2}}, {{3}} values |
| Long delivery delay | Normal for transactional templates (1-5 mins) |

---

## 📞 Support

Need help with templates? Check:
- Meta's [Template Documentation](https://developers.facebook.com/docs/whatsapp/message-templates)
- Your template approval status in Meta Business Manager
- Rails logs for template send errors: `logs | grep -i template`

---

## ✨ What's Next

- ✅ Templates created & integrated
- ⏳ Waiting for Meta template approval
- 🚀 Auto-sending on claim completion
- 📊 Track delivery & responses

Your WhatsApp integration is **complete and ready to go!** 🎉


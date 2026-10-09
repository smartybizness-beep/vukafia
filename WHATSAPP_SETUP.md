# WhatsApp Business API Setup Guide for Vukafia

Your webhook is ready! Follow these steps to get it working with Meta's WhatsApp Business API.

## 📋 Step 1: Create a Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Sign in with your Facebook account
3. Create a new Business Account (if you don't have one)
4. Go to **Settings** → **Account Details** and note your **Business Account ID**

## 🔐 Step 2: Get Your WhatsApp Credentials

### Option A: Via Meta Business Manager (Recommended)

1. Log in to [business.facebook.com](https://business.facebook.com)
2. Go to **Tools** → **All Tools** → Search for **"WhatsApp"**
3. Click **"Set Up"** (or **"Manage"** if already set up)
4. Choose your WhatsApp Business Account or create a new one
5. You'll see your **Phone Number** (this is your business number, e.g., +234...)

### Get Phone Number ID and Access Token

1. In Meta Business Manager, go to **Settings** → **WhatsApp Accounts**
2. Select your WhatsApp Business Account
3. Go to **API Setup** tab
4. You'll see:
   - **Phone Number ID** - Copy this
   - **Business Account ID** - Copy this

### Generate Access Token

1. Still in Meta Business Manager
2. Go to **Settings** → **System Users**
3. Create a new System User (or use existing)
4. Grant permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Click **Generate Token**
6. Copy your **Access Token** (keep it secret!)

## 🔗 Step 3: Configure Your .env File

Update `C:\Users\Olaye\Project\Vukafia\.env`:

```env
# ── WHATSAPP (Meta Cloud API) ─────────────────────────────────────────
WA_PHONE_NUMBER=YOUR_BUSINESS_PHONE_HERE
WA_PHONE_NUMBER_ID=XXXXXXXXXXXX
WA_BUSINESS_ACCOUNT_ID=XXXXXXXXXXXX
WA_API_TOKEN=EAAxxxxxxxxxxxxxx...
WA_VERIFY_TOKEN=vukafia_webhook_verify_2025
```

### Where to find each value:

- **WA_PHONE_NUMBER**: Your WhatsApp Business phone number (e.g., `2348101477935`)
- **WA_PHONE_NUMBER_ID**: Found in Meta → WhatsApp Setup → API Setup
- **WA_BUSINESS_ACCOUNT_ID**: Found in Meta → Settings → WhatsApp Accounts
- **WA_API_TOKEN**: Generated from Meta → System Users → Generate Token
- **WA_VERIFY_TOKEN**: Keep as `vukafia_webhook_verify_2025` (or create your own)

## ✅ Step 4: Set Up Webhook Callback

### In Meta Business Manager:

1. Go to **Settings** → **Configuration**
2. Under **Webhooks**, click **Edit**
3. Set your **Callback URL**:
   - **For Production:** `https://vukafia.com/api/webhook/whatsapp`
   - **For Testing:** `https://YOUR_RAILWAY_URL.railway.app/api/webhook/whatsapp`
4. Set **Verify Token**: `vukafia_webhook_verify_2025` (must match .env)
5. Click **Verify and Save**

### Subscribe to Webhook Events:

1. After verification, you'll see **Webhook Fields**
2. Subscribe to:
   - ✅ `messages` - Receive incoming messages
   - ✅ `message_template_status_update` - Track template status
   - ✅ `message_status` - Track delivery status

## 🧪 Step 5: Test Your Webhook

### Via cURL (from terminal):

```bash
# Verify webhook
curl -X GET "http://localhost:5000/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=vukafia_webhook_verify_2025&hub.challenge=test_challenge_string"

# Should return: test_challenge_string
```

### Send a Test Message:

```bash
curl -X POST "http://localhost:5000/api/webhook/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "2348101477935",
            "id": "wamid.ABC123",
            "text": { "body": "Hello Vukafia!" }
          }]
        }
      }]
    }]
  }'
```

## 📤 Step 6: Send Messages from Your App

### Example 1: Send a simple message

```javascript
const { sendMessage } = require('./services/whatsappService');

// Send payment confirmation
await sendMessage('2348101477935', 'Payment received! Your business is now verified ✓');
```

### Example 2: Send after claim payment

In your claim payment handler:

```javascript
const { sendPaymentConfirmation } = require('./services/whatsappService');

// After successful payment
await sendPaymentConfirmation(
  req.body.phone_number,
  'John\'s Auto Repair',
  14.99
);
```

### Example 3: Send verification link

```javascript
const { sendVerificationLink } = require('./services/whatsappService');

await sendVerificationLink(
  '2348101477935',
  'ABC Electronics',
  'https://vukafia.com/claim/xyz123'
);
```

## 🔍 Debugging

### Check webhook logs:

```bash
# On your server / Railway logs
curl https://api.railway.app/logs  # See your Railway logs
```

### Test webhook connectivity:

```bash
# Verify token is correct
echo $WA_VERIFY_TOKEN  # Should show: vukafia_webhook_verify_2025

# Check .env loaded
node -e "require('dotenv').config(); console.log(process.env.WA_API_TOKEN)"
```

### Common Issues:

| Issue | Solution |
|-------|----------|
| ❌ "Webhook verification failed" | Double-check `WA_VERIFY_TOKEN` matches in .env and Meta |
| ❌ "401 Unauthorized" | Verify `WA_API_TOKEN` is correct and hasn't expired |
| ❌ "Messages not received" | Make sure you subscribed to `messages` webhook field |
| ❌ "Connection refused" | Check your server is running and accessible from internet |

## 🚀 Deploy to Railway

1. Push changes to GitHub:
```bash
git add .
git commit -m "feat: WhatsApp Business API integration"
git push
```

2. Railway auto-deploys from main
3. Update `.env` on Railway dashboard with your credentials
4. Verify webhook in Meta Business Manager

## 📚 Useful Links

- [Meta WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Message Types](https://developers.facebook.com/docs/whatsapp/cloud-api/messages)
- [API Explorer](https://developers.facebook.com/tools/explorer)

## ✨ Next Steps

1. ✅ Create system user and access token in Meta
2. ✅ Update `.env` with credentials
3. ✅ Test webhook verification
4. ✅ Send a test message
5. ✅ Integrate WhatsApp payment confirmations in claim flow
6. ✅ Deploy to Railway

Need help? Contact Meta Support or Vukafia team! 🚀

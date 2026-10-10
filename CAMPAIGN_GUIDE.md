# Vukafia WhatsApp Claim Campaign Guide

Send WhatsApp invitations to businesses asking them to claim their listing on Vukafia.

## ⚠️ Important: Compliance & Ethics

**Before launching any campaign, ensure:**

1. ✅ **You have consent** to message these numbers (opt-in list or existing customers)
2. ✅ **Messages are valuable** (not spam) — you're helping businesses, not just promoting
3. ✅ **Follow WhatsApp ToS** — Marketing messages require opt-in; transactional messages don't
4. ✅ **Check local laws** — Many countries restrict unsolicited marketing (GDPR, CAN-SPAM, etc.)
5. ✅ **Start small** — Test with 10-20 messages before larger campaigns

**Recommended approach:**
- Focus on businesses that **already exist in your database**
- Frame as "Your business is on Vukafia" (informational) not "BUY NOW!" (promotional)
- Include clear unsubscribe/contact options

---

## 🚀 How to Use

### Step 1: Preview the Campaign

Before sending anything, preview statistics:

```bash
# Get stats on unclaimed businesses
curl -X GET "http://localhost:5000/api/campaigns/stats" \
  -H "Authorization: Bearer vukafia_admin_2025"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUnclaimed": 1245,
    "byCountry": {
      "Nigeria": 523,
      "Ghana": 312,
      "Kenya": 201,
      ...
    },
    "byCategory": {
      "Restaurant": 245,
      "Retail": 198,
      "Services": 156,
      ...
    },
    "sample": [
      {
        "id": 1,
        "name": "John's Auto Repair",
        "phone": "234 810 147 7935",
        "country": "Nigeria",
        "category": "Auto Services"
      },
      ...
    ]
  }
}
```

### Step 2: Run a Dry Run (Test)

Test the campaign without sending real messages:

```bash
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?dryRun=true&batchSize=5" \
  -H "Authorization: Bearer vukafia_admin_2025" \
  -H "Content-Type: application/json"
```

**Output preview:**
```
📤 Starting campaign...
   Dry run: ✅ YES (no messages sent)
   Batch size: 5
   Delay between messages: 2000ms

[1/5] 🧪 [DRY RUN] John's Auto Repair (2348101477935)
    Message preview:
🎉 *Hello! Your business is on Vukafia!*
...

📊 Campaign Summary:
   Total: 5
   Sent: 0
   Failed: 0
```

### Step 3: Run the Campaign

Once you're happy with the preview, send for real:

```bash
# Send to 50 businesses in Nigeria
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?batchSize=50&country=Nigeria" \
  -H "Authorization: Bearer vukafia_admin_2025" \
  -H "Content-Type: application/json"
```

**For larger campaigns (>500 messages), require confirmation:**

```bash
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites" \
  -H "Authorization: Bearer vukafia_admin_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "batchSize": 1000,
    "country": "Nigeria",
    "confirmed": true
  }'
```

---

## 📊 API Reference

### GET /api/campaigns/stats
**Get campaign statistics (preview)**

**Query Parameters:**
- `country` (optional) — Filter by country (e.g., "Nigeria", "Ghana")
- `category` (optional) — Filter by business category (e.g., "Restaurant", "Retail")

**Example:**
```bash
GET /api/campaigns/stats?country=Nigeria&category=Restaurant
```

---

### POST /api/campaigns/send-claim-invites
**Send WhatsApp claim invitations**

**Query Parameters:**
- `dryRun=true|false` — Test run (default: false)
- `batchSize=N` — Number of messages to send (default: 50, max: 5000 per request)
- `country=XX` — Filter by country (optional)
- `category=Name` — Filter by category (optional)
- `delayMs=N` — Delay between messages in milliseconds (default: 2000, avoid rate limiting)

**Body (for large campaigns):**
```json
{
  "batchSize": 1000,
  "country": "Nigeria",
  "category": "Restaurant",
  "confirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "type": "claim_invitation",
    "dryRun": false,
    "results": {
      "total": 50,
      "sent": 48,
      "failed": 2,
      "errors": [
        {
          "business": "ABC Store",
          "phone": "2341234567890",
          "error": "Send failed"
        }
      ]
    }
  },
  "message": "Campaign complete! Sent 48/50 messages"
}
```

---

## 📱 Message Template

The campaign sends this message:

```
🎉 *Hello! Your business is on Vukafia!*

We found *[Business Name]* in our directory (verified from Google Maps).

*Claim it now for $15 to:*
✅ Get a verified badge
✅ Manage your business profile
✅ Respond to customer inquiries
✅ Boost your visibility across Africa

👉 **[Claim Your Business](https://vukafia.com/claim/[BUSINESS_ID])**

Questions? Reply here or contact us! 📞
```

---

## 🔧 Advanced Usage

### Campaign in Batches

Send 100 messages per day:

```bash
# Day 1: Nigeria
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?batchSize=100&country=Nigeria&dryRun=false" \
  -H "Authorization: Bearer vukafia_admin_2025"

# Day 2: Ghana
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?batchSize=100&country=Ghana&dryRun=false" \
  -H "Authorization: Bearer vukafia_admin_2025"

# Day 3: Kenya
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?batchSize=100&country=Kenya&dryRun=false" \
  -H "Authorization: Bearer vukafia_admin_2025"
```

### Custom Delay Between Messages

Avoid rate limiting with custom delays:

```bash
# 5 second delay between messages (safer for WhatsApp)
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?delayMs=5000&batchSize=30" \
  -H "Authorization: Bearer vukafia_admin_2025"
```

### Specific Category

Only restaurants:

```bash
curl -X POST "http://localhost:5000/api/campaigns/send-claim-invites?category=Restaurant&batchSize=100" \
  -H "Authorization: Bearer vukafia_admin_2025"
```

---

## 📈 Success Metrics

Track campaign performance:

| Metric | How to Track |
|--------|-------------|
| **Messages Sent** | Check API response `results.sent` |
| **Failed Messages** | Check API response `results.failed` |
| **Claims Completed** | Check `/api/claims` for new claims |
| **Conversion Rate** | Claims completed ÷ Messages sent |
| **Response Rate** | WhatsApp messages received via webhook |

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid phone number" | Numbers must be 10+ digits. Check database phone format. |
| "Send failed" | Check `WA_API_TOKEN` is valid in `.env`. Verify Railway has it. |
| "Too many requests" | Increase `delayMs` (default 2000ms). WhatsApp has rate limits. |
| "No unclaimed businesses" | Check your filters. Maybe all businesses are claimed? |
| "Campaign not starting" | Verify `ADMIN_TOKEN` header matches `.env` |

---

## 🛡️ Safety Checks

Your campaign system includes:

✅ **Admin authentication** — Only `ADMIN_TOKEN` holders can send  
✅ **Dry run mode** — Preview messages before sending  
✅ **Rate limiting** — 2000ms delay between messages (configurable)  
✅ **Large campaign confirmation** — >500 messages requires approval  
✅ **Error logging** — All failures tracked and returned  
✅ **Phone validation** — Invalid numbers skipped  

---

## 📝 Best Practices

1. **Start Small**: Test with 10-20 messages first
2. **Monitor Responses**: Watch for WhatsApp messages back (handle via webhook)
3. **Space Out Campaigns**: Don't send 10,000 in one day
4. **Personalize if Possible**: Business name in message (already done ✓)
5. **Track Results**: Log campaign IDs and conversion rates
6. **Offer Unsubscribe**: Allow businesses to opt out (via WhatsApp reply)

---

## 🚀 Next Steps

1. **Test with 5 messages** (dry run)
2. **Send to 50 businesses** in one country
3. **Monitor WhatsApp replies** (webhook)
4. **Check claims submitted** in dashboard
5. **Scale based on response rates**

---

## 📞 Support

Questions? Check:
- WhatsApp webhook status: `/health`
- Admin credentials: `.env` → `ADMIN_TOKEN`
- API token: `/api/auth` endpoints

Need help? Contact Vukafia support! 🎉

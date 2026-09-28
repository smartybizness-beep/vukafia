# Crawler Email Notifications - Quick Setup Guide

## Overview
The Google Crawler job (runs daily at 2 AM UTC) will now send you email notifications with data picked up and job status.

- ✅ **Success**: Detailed report of new/updated businesses, progress toward 1000 target
- ❌ **Failure**: Error message, stack trace, and troubleshooting steps

**Email goes to**: `smartybizness@gmail.com` (configurable via `ADMIN_EMAIL` in .env)

---

## Quick Setup (3 steps)

### Step 1: Add Email Configuration to `.env`
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
ADMIN_EMAIL=smartybizness@gmail.com
```

### Step 2: Generate Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to Security → App Passwords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste into `.env` as `EMAIL_PASSWORD`

### Step 3: Restart Server
```bash
npm run dev
```

---

## Test Email Configuration

**Test if emails work:**
```bash
curl -X POST http://localhost:5000/api/admin/crawler/test-email \
  -H "x-admin-token: your_admin_token"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Email configuration verified! Test email sent to admin."
}
```

Check your inbox for test email.

---

## What You'll Get

### ✅ Success Email Example

**Subject:** ✅ Vukafia Crawler - Success (42 new businesses)

**Contents:**
- 📊 Data Summary Table
  - New Businesses Inserted: 42
  - Existing Businesses Updated: 8
  - Total Businesses in Database: 487
  - Progress to 1000: 48%
  - Duration: 127 seconds
- 📍 Data Picked Up (summary of what was found)
- 📅 Timestamp and next scheduled run

### ❌ Failure Email Example

**Subject:** ❌ Vukafia Crawler - Failed (Google Maps API quota exceeded)

**Contents:**
- Error message with details
- Full stack trace for debugging
- Troubleshooting checklist
- Next scheduled retry time

---

## API Endpoints

### Manually Trigger Crawler (+ send email)
```bash
curl -X POST http://localhost:5000/api/admin/crawler/trigger \
  -H "x-admin-token: your_admin_token"
```

### Check Crawler Status
```bash
curl http://localhost:5000/api/admin/crawler/status \
  -H "x-admin-token: your_admin_token"
```

### Test Email Configuration
```bash
curl -X POST http://localhost:5000/api/admin/crawler/test-email \
  -H "x-admin-token: your_admin_token"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Email not received** | Check `.env` has correct `EMAIL_USER` and `EMAIL_PASSWORD`. Test with `/test-email` endpoint. Check spam folder. |
| **Gmail says "allow less secure apps"** | You're using wrong password. Generate App Password: https://myaccount.google.com → Security → App Passwords |
| **Connection timeout** | Check firewall/VPN isn't blocking SMTP port 587. Test Gmail settings. |
| **No error in logs but no email** | Verify `EMAIL_USER` and `EMAIL_PASSWORD` by running test endpoint. |

---

## Scheduled Runs

- **Time**: 2:00 AM UTC daily
- **Email Recipient**: `ADMIN_EMAIL` from .env
- **On Success**: Detailed data report sent
- **On Failure**: Error alert + troubleshooting guide sent

---

## Files Modified

- `services/mailer.js` - NEW email service
- `jobs/scheduler.js` - Now sends emails after job completes
- `routes/admin-crawler.js` - Added test-email endpoint
- `.env` - Added EMAIL_* configuration
- `IMPLEMENTATION_GUIDE.md` - Full documentation

---

## Need Help?

**Check logs:**
```bash
npm run dev  # See console output for [MAILER] messages
```

**Verify config:**
```bash
# Test endpoint
curl -X POST http://localhost:5000/api/admin/crawler/test-email \
  -H "x-admin-token: your_admin_token"
```

**Configuration reference:**
- Full docs: `IMPLEMENTATION_GUIDE.md` → "Crawler Email Notifications"
- Email service code: `services/mailer.js`
- Scheduler code: `jobs/scheduler.js`

---

**Version**: 1.0  
**Date**: September 28, 2026  
**Status**: Ready to use

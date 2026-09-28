/**
 * services/mailer.js
 * Email notification service for crawler jobs
 */

'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize email transporter
 */
function initializeMailer() {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT || 587;

  if (!emailUser || !emailPassword) {
    console.warn('[MAILER] Email credentials not configured. Email notifications disabled.');
    return null;
  }

  try {
    if (emailService === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword // Use App Password for Gmail if 2FA enabled
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });
    }

    console.log('[MAILER] ✅ Email service initialized');
    return transporter;
  } catch (err) {
    console.error('[MAILER] ❌ Failed to initialize:', err.message);
    return null;
  }
}

/**
 * Send success email after crawler job completes
 */
async function sendSuccessEmail(result) {
  const mailer = initializeMailer();
  if (!mailer) return;

  try {
    const recipientEmail = process.env.ADMIN_EMAIL || 'smartybizness@gmail.com';
    const { inserted = 0, updated = 0, total = 0, progress = 0, duration = 0, timestamp = new Date() } = result;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">✅ Google Crawler Job Completed Successfully</h2>

          <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>

          <h3 style="color: #2196F3;">📊 Crawler Data Summary</h3>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Metric</td>
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Value</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">New Businesses Inserted</td>
              <td style="border: 1px solid #ddd; padding: 10px; color: #4CAF50; font-weight: bold;">${inserted}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="border: 1px solid #ddd; padding: 10px;">Existing Businesses Updated</td>
              <td style="border: 1px solid #ddd; padding: 10px; color: #FF9800; font-weight: bold;">${updated}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Total Businesses in Database</td>
              <td style="border: 1px solid #ddd; padding: 10px; color: #2196F3; font-weight: bold;">${total}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="border: 1px solid #ddd; padding: 10px;">Progress to 1000</td>
              <td style="border: 1px solid #ddd; padding: 10px; color: #9C27B0; font-weight: bold;">${progress}%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Duration</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${duration} seconds</td>
            </tr>
          </table>

          <h3 style="color: #2196F3;">📍 Data Picked Up</h3>
          <ul>
            <li><strong>${inserted}</strong> new African businesses added to the directory</li>
            <li><strong>${updated}</strong> existing businesses updated with latest info</li>
            <li>Database now contains <strong>${total}</strong> verified businesses</li>
            <li>Target progress: <strong>${progress}% of 1000 goal</strong></li>
          </ul>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Vukafia Crawler Job.<br>
            Next scheduled run: Daily at 2:00 AM UTC
          </p>
        </body>
      </html>
    `;

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `✅ Vukafia Crawler - Success (${inserted} new businesses)`,
      html: htmlContent,
      text: `Crawler Job Successful\n\nNew Businesses: ${inserted}\nUpdated: ${updated}\nTotal: ${total}\nProgress: ${progress}%\nDuration: ${duration}s`
    });

    console.log(`[MAILER] ✅ Success email sent to ${recipientEmail}`);
  } catch (err) {
    console.error('[MAILER] ❌ Failed to send success email:', err.message);
  }
}

/**
 * Send failure email when crawler job fails
 */
async function sendFailureEmail(error, duration = 0) {
  const mailer = initializeMailer();
  if (!mailer) return;

  try {
    const recipientEmail = process.env.ADMIN_EMAIL || 'smartybizness@gmail.com';
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || '';

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #f44336;">❌ Google Crawler Job Failed</h2>

          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>

          <h3 style="color: #f44336;">⚠️ Error Details</h3>
          <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
            <p><strong>Error Message:</strong></p>
            <p style="color: #c62828; font-family: monospace; white-space: pre-wrap;">${errorMessage}</p>
          </div>

          <h3 style="color: #FF9800;">📋 Troubleshooting Steps</h3>
          <ol>
            <li>Check Google Maps API quota and billing status</li>
            <li>Verify API key is valid and has access to Places API</li>
            <li>Check database connection and availability</li>
            <li>Review server logs for detailed error messages</li>
            <li>Ensure network connectivity to Google Maps API</li>
          </ol>

          ${errorStack ? `
          <h3 style="color: #FF9800;">🔍 Full Stack Trace</h3>
          <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${errorStack}</pre>
          ` : ''}

          <h3 style="color: #2196F3;">⏱️ Job Metadata</h3>
          <ul>
            <li>Duration: ${duration} seconds</li>
            <li>Status: FAILED</li>
            <li>Next retry: Daily at 2:00 AM UTC</li>
          </ul>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Vukafia Crawler Job.<br>
            Immediate action may be required. Please check your Google API console.
          </p>
        </body>
      </html>
    `;

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `❌ Vukafia Crawler - Failed (${errorMessage})`,
      html: htmlContent,
      text: `Crawler Job Failed\n\nError: ${errorMessage}\nDuration: ${duration}s\n\nPlease review the logs immediately.`
    });

    console.log(`[MAILER] ❌ Failure email sent to ${recipientEmail}`);
  } catch (err) {
    console.error('[MAILER] ❌ Failed to send failure email:', err.message);
  }
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
  const mailer = initializeMailer();
  if (!mailer) {
    console.error('[MAILER] Email not configured');
    return false;
  }

  try {
    await mailer.verify();
    console.log('[MAILER] ✅ Email configuration verified successfully');
    return true;
  } catch (err) {
    console.error('[MAILER] ❌ Email configuration failed:', err.message);
    return false;
  }
}

module.exports = {
  initializeMailer,
  sendSuccessEmail,
  sendFailureEmail,
  testEmailConfig
};

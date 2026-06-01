/**
 * mailer.js — Centralised Nodemailer helper for Dharma Setu
 *
 * Uses Gmail SMTP by default. Set these in server/.env:
 *   SMTP_USER=dharmasetu03@gmail.com
 *   SMTP_PASS=xxxx xxxx xxxx xxxx   ← 16-char Gmail App Password
 *   SMTP_FROM="Dharma Setu <dharmasetu03@gmail.com>"
 */

const https = require('https');

// ── HTTP Mailer (Bypasses Render SMTP Block) ──────────────────────────────────
// Sends via Brevo API (Port 443) instead of SMTP
function sendViaBrevo({ to, subject, htmlContent }) {
  return new Promise((resolve, reject) => {
    if (!process.env.BREVO_API_KEY) {
      return reject(new Error('BREVO_API_KEY is missing in .env! Cannot send email.'));
    }

    const payload = JSON.stringify({
      sender: { name: 'Dharma Setu', email: process.env.SMTP_USER || 'dharmasetu03@gmail.com' },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Brevo API Error (${res.statusCode}): ${data}`));
        }
      });
    });

    // Fail fast after 15 s so the admin sees a clear error instead of a hang
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Brevo API timed out (15 s). Check your network or Render outbound rules.'));
    });

    req.on('error', error => reject(error));
    req.write(payload);
    req.end();
  });
}

// ── Shared HTML wrapper ───────────────────────────────────────────────────────
function htmlWrap(bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dharma Setu</title>
  <style>
    body { margin:0; padding:0; background:#0f0e17; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:580px; margin:40px auto; background:#1a1826; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); }
    .header { background:linear-gradient(135deg,#2d1b69 0%,#1a1231 100%); padding:36px 40px 28px; text-align:center; }
    .logo { font-size:28px; color:#f5c542; font-weight:700; letter-spacing:1px; margin-bottom:4px; }
    .logo-sub { font-size:12px; color:rgba(255,255,255,0.35); letter-spacing:3px; text-transform:uppercase; }
    .body { padding:32px 40px; }
    .footer { padding:20px 40px; border-top:1px solid rgba(255,255,255,0.05); text-align:center; font-size:11px; color:rgba(255,255,255,0.2); }
    h2 { color:#f5c542; font-size:20px; margin:0 0 16px; font-weight:600; }
    p { color:rgba(255,255,255,0.65); font-size:14px; line-height:1.7; margin:0 0 14px; }
    .msg-box { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px 20px; color:rgba(255,255,255,0.55); font-size:13px; line-height:1.7; margin:16px 0; white-space:pre-wrap; }
    .reply-box { background:rgba(80,200,120,0.06); border:1px solid rgba(80,200,120,0.18); border-radius:10px; padding:16px 20px; color:rgba(255,255,255,0.75); font-size:14px; line-height:1.7; margin:16px 0; white-space:pre-wrap; }
    .otp-box { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); border-radius:12px; padding:24px; text-align:center; margin:20px 0; }
    .otp-code { font-size:40px; font-weight:700; letter-spacing:12px; color:#818cf8; font-family:monospace; }
    .otp-note { font-size:12px; color:rgba(255,255,255,0.3); margin-top:10px; }
    .badge { display:inline-block; background:rgba(80,200,120,0.12); border:1px solid rgba(80,200,120,0.25); border-radius:999px; padding:4px 14px; font-size:12px; color:#4ade80; margin-bottom:16px; }
    a { color:#818cf8; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">🕉 Dharma Setu</div>
      <div class="logo-sub">धर्म सेतु</div>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Dharma Setu · India 🇮🇳<br/>
      <a href="mailto:dharmasetu03@gmail.com">dharmasetu03@gmail.com</a>
    </div>
  </div>
</body>
</html>`;
}

// Helper to get FROM address
function getFrom() {
  return process.env.SMTP_FROM || `"Dharma Setu" <${process.env.SMTP_USER}>`;
}

// ── 1. Admin → User contact reply ─────────────────────────────────────────────
async function sendContactReplyEmail({ to, userName, userMessage, subject, replyText }) {
  const html = htmlWrap(`
    <span class="badge">✓ We've replied to your message</span>
    <h2>Namaste, ${userName} 🙏</h2>
    <p>Our team has replied to your message regarding <strong style="color:#f5c542">${subject || 'General Inquiry'}</strong>.</p>

    <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:4px;">YOUR ORIGINAL MESSAGE</p>
    <div class="msg-box">${userMessage}</div>

    <p style="font-size:12px;color:rgba(80,200,120,0.6);margin-bottom:4px;">REPLY FROM DHARMA SETU TEAM</p>
    <div class="reply-box">${replyText}</div>

    <p>If you have any further questions, feel free to reply to this email or visit our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/contact">Contact page</a>.</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;">With gratitude,<br/>The Dharma Setu Team 🕉</p>
  `);

  return sendViaBrevo({
    to,
    subject: `Re: ${subject || 'Your message to Dharma Setu'}`,
    htmlContent: html,
  });
}

// ── 2. Payment OTP email ───────────────────────────────────────────────────────
async function sendPaymentOtpEmail({ to, userName, otp, courseTitle }) {
  const html = htmlWrap(`
    <h2>Verify Your Email</h2>
    <p>Hi <strong style="color:rgba(255,255,255,0.85)">${userName || 'there'}</strong>,</p>
    <p>You're enrolling in <strong style="color:#f5c542">${courseTitle}</strong>. Use the OTP below to verify your email address and complete your payment.</p>

    <div class="otp-box">
      <div style="font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:12px;letter-spacing:2px;text-transform:uppercase;">Your One-Time Password</div>
      <div class="otp-code">${otp}</div>
      <div class="otp-note">⏱ This OTP expires in 5 minutes. Do not share it with anyone.</div>
    </div>

    <p>If you did not request this, please ignore this email — no action is needed.</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;">With gratitude,<br/>The Dharma Setu Team 🕉</p>
  `);

  return sendViaBrevo({
    to,
    subject: `${otp} — Your Dharma Setu Payment OTP`,
    htmlContent: html,
  });
}

// ── 3. Payment confirmation email to buyer ────────────────────────────────────
async function sendPaymentConfirmationEmail({ to, userName, courseTitle, transactionId, amount }) {
  const html = htmlWrap(`
    <span class="badge">✓ Payment Confirmed</span>
    <h2>Your Course Access is Confirmed! 🎉</h2>
    <p>Hi <strong style="color:rgba(255,255,255,0.85)">${userName}</strong>,</p>
    <p>Great news! Your payment for <strong style="color:#f5c542">${courseTitle}</strong> has been verified and your course access is now active.</p>

    <div class="msg-box">
Course: ${courseTitle}
Amount Paid: ₹${parseFloat(amount).toLocaleString('en-IN')}
Transaction ID: ${transactionId}
Status: ✅ Confirmed
    </div>

    <p>You can now access your course from your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard">Dashboard</a>.</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;">With gratitude,<br/>The Dharma Setu Team 🕉</p>
  `);

  return sendViaBrevo({
    to,
    subject: `✅ Course Access Confirmed — ${courseTitle}`,
    htmlContent: html,
  });
}

// ── 4. Payment rejection email to buyer ───────────────────────────────────────
async function sendPaymentRejectionEmail({ to, userName, courseTitle, adminNote }) {
  const html = htmlWrap(`
    <h2>Payment Verification Update</h2>
    <p>Hi <strong style="color:rgba(255,255,255,0.85)">${userName}</strong>,</p>
    <p>Unfortunately, we were unable to verify your payment for <strong style="color:#f5c542">${courseTitle}</strong>.</p>

    ${adminNote ? `
    <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:4px;">NOTE FROM OUR TEAM</p>
    <div class="msg-box">${adminNote}</div>
    ` : ''}

    <p>Please <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/contact">contact us</a> if you believe this is an error or to retry your payment.</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;">With gratitude,<br/>The Dharma Setu Team 🕉</p>
  `);

  return sendViaBrevo({
    to,
    subject: `Payment Update — ${courseTitle}`,
    htmlContent: html,
  });
}

module.exports = {
  sendViaBrevo, // Exported so admin.js can reuse it for tests
  sendContactReplyEmail,
  sendPaymentOtpEmail,
  sendPaymentConfirmationEmail,
  sendPaymentRejectionEmail,
};

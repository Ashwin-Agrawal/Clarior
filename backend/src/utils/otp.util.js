const crypto = require("crypto");
const nodemailer = require("nodemailer");

const generateOTP = () => String(1000 + crypto.randomInt(9000));

const isOTPExpired = (expiry) => {
  if (!expiry) return true;
  return new Date() > new Date(expiry);
};

const createTransporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const sendOTPEmail = async ({ to, name, otp, purpose = "verification" }) => {
  const transporter = createTransporter();
  const isReset = purpose === "reset";
  const subject = isReset ? "Your Clarior Password Reset Code" : "Verify your phone number - Clarior";
  const heading = isReset ? "Password Reset OTP" : "Phone Verification OTP";
  const bodyText = isReset
    ? "You requested to reset your Clarior password. Use the code below - it expires in 10 minutes."
    : "To secure your Clarior account, verify your phone number using the OTP below. Expires in 10 minutes.";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(37,99,235,0.10);">
        <tr><td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:28px 36px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;">Clarior</div>
          <div style="color:#bfdbfe;font-size:11px;margin-top:3px;font-weight:600;letter-spacing:0.1em;">HONEST CAMPUS ADVICE</div>
        </td></tr>
        <tr><td style="padding:32px 36px 24px;">
          <h2 style="color:#1e293b;font-size:18px;font-weight:800;margin:0 0 10px;">${heading}</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#1e293b;">${name}</strong>, ${bodyText}</p>
          <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:10px;font-weight:800;color:#2563eb;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px;">Your 4-Digit OTP</div>
            <div style="font-size:54px;font-weight:900;color:#1d4ed8;letter-spacing:16px;font-family:monospace;">${otp}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:12px;font-weight:600;">Expires in 10 minutes</div>
          </div>
          <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">If you did not request this, please ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 36px;text-align:center;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">© 2025 Clarior - Built for students, by students.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await transporter.sendMail({ from: `"Clarior" <${process.env.EMAIL_USER}>`, to, subject, html });
};

module.exports = { generateOTP, isOTPExpired, sendOTPEmail };

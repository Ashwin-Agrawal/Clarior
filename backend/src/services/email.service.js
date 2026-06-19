const nodemailer = require("nodemailer");

// Initialize transporter
const getTransporter = () => {
  const user = process.env.SUPPORT_EMAIL_USER || "support.clarior@gmail.com";
  const pass = process.env.SUPPORT_EMAIL_PASS;

  if (!pass) {
    console.warn("⚠️ [EMAIL] SUPPORT_EMAIL_PASS is not configured in .env. Email notifications will be skipped.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });
};

exports.sendSupportNotification = async (ticket) => {
  try {
    const transporter = getTransporter();
    if (!transporter) return false;

    const targetEmail = process.env.SUPPORT_EMAIL_USER || "support.clarior@gmail.com";

    const mailOptions = {
      from: `"Clarior Support Hub" <${targetEmail}>`,
      to: targetEmail,
      subject: `🚨 [New Support Ticket] ${ticket.category} - ${ticket.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 800;">New Support Request</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Ticket ID: ${ticket._id}</p>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #64748b;">From:</td>
                <td style="padding: 8px 0;">${ticket.name} (${ticket.email})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Category:</td>
                <td style="padding: 8px 0;"><span style="background: #eff6ff; color: #1e40af; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">${ticket.category}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Received:</td>
                <td style="padding: 8px 0;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">Message Content:</h3>
              <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; font-style: italic;">
                "${ticket.message.replace(/\n/g, "<br/>")}"
              </div>
            </div>
            
            <div style="margin-top: 28px; text-align: center;">
              <a href="http://localhost:3000/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
                Go to Admin Dashboard
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            This is an automated notification from your Clarior Platform.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ [EMAIL] Support ticket email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ [EMAIL] Support email failed to send:", error.message);
    return false;
  }
};

exports.sendCollegeRequestNotification = async (request) => {
  try {
    const transporter = getTransporter();
    if (!transporter) return false;

    const targetEmail = process.env.SUPPORT_EMAIL_USER || "support.clarior@gmail.com";

    const mailOptions = {
      from: `"Clarior Admin Notification" <${targetEmail}>`,
      to: targetEmail,
      subject: `🏫 [College Add Request] ${request.name} (${request.city})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 800;">College Add Request</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Review and approval required</p>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px 0; font-size: 15px;">A user has requested to add a new college to the platform. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">College Name:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${request.name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b;">City / State:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${request.city}, ${request.state}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b;">Type:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${request.type}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b;">Established:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${request.established || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #64748b;">Requested By:</td>
                <td style="padding: 12px;">${request.requesterEmail || "Anonymous / Guest"}</td>
              </tr>
            </table>
            
            <div style="margin-top: 28px; text-align: center;">
              <a href="http://localhost:3000/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
                Review in Admin Dashboard
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            This is an automated notification from your Clarior Platform.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ [EMAIL] College request email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ [EMAIL] College request email failed to send:", error.message);
    return false;
  }
};

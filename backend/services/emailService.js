const axios = require('axios');

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@spatialai.edu';
  const senderName = process.env.BREVO_SENDER_NAME || 'Spatial AI';
  return { apiKey, senderEmail, senderName };
};

const sendBrevoEmail = async ({ to, subject, htmlContent, textContent }) => {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    },
    {
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
    }
  );
};

const buildVerificationEmail = (verifyUrl, name) => {
  const safeName = name || 'there';
  const subject = 'Verify your Spatial AI account';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="color: #1d4ed8;">Verify your email</h2>
      <p>Hi ${safeName},</p>
      <p>Thanks for joining Spatial AI. Please confirm your email address to activate your account.</p>
      <p style="margin: 24px 0;">
        <a
          href="${verifyUrl}"
          style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;"
        >
          Verify Email
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${verifyUrl}</p>
      <p style="font-size: 12px; color: #6b7280;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
  const textContent = `Hi ${safeName},\n\nPlease verify your email address by visiting: ${verifyUrl}\n\nIf you did not request this, you can ignore this email.`;

  return { subject, htmlContent, textContent };
};

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  const { subject, htmlContent, textContent } = buildVerificationEmail(verifyUrl, name);
  await sendBrevoEmail({ to, subject, htmlContent, textContent });
};

module.exports = {
  sendBrevoEmail,
  sendVerificationEmail,
};

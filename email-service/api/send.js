const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers['x-api-key'];
  if (!authHeader || authHeader !== process.env.API_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ message: 'to, subject, and html are required' });
  }

  try {
    const fromName = process.env.ALERT_FROM_NAME || 'CollegeMS';
    const fromEmail = process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (error) {
    console.error('Email send error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // 1. Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (name.trim().length === 0 || subject.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Fields cannot be empty' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message is too short (minimum 10 characters)' });
    }

    // 2. Transporter configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Email content
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, // authenticated sender
      to: process.env.CONTACT_RECEIVER_EMAIL, // your email
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      text: `New contact message from your portfolio\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ success: false, message: 'Unable to send message. Please try again later.' });
  }
}

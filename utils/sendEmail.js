// utils/sendEmail.js
import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, text }) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., Gmail, SendGrid
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_SERVICE_API_KEY,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

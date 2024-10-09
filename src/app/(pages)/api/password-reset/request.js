// pages/api/password-reset/request.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const tokensFilePath = path.join(process.cwd(), 'public', 'resetTokens.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Read existing users
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    // Read existing tokens
    let tokens = [];
    if (fs.existsSync(tokensFilePath)) {
      const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
      tokens = JSON.parse(tokensData);
    }

    // Add new token
    tokens.push({ email, token, expiry });
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/password-reset?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Password reset email sent.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

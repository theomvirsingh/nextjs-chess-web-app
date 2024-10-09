// pages/api/users/reset-password.js
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../../../utils/sendEmail'; // You'll need to implement this utility
import { hash } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const tokensFilePath = path.join(process.cwd(), 'public', 'resetTokens.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Read existing users
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(fileData);

    // Check if user exists
    const user = users.find((user) => user.email === email);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Generate a reset token
    const resetToken = uuidv4();
    const expiry = Date.now() + 3600000; // Token valid for 1 hour

    // Read existing tokens
    let tokens = [];
    if (fs.existsSync(tokensFilePath)) {
      const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
      tokens = JSON.parse(tokensData);
    }

    // Add new token
    tokens.push({ email, token: resetToken, expiry });
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));

    // Send reset email
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
      });
      res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

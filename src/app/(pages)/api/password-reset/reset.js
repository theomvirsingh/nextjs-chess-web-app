// pages/api/password-reset/reset.js
import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const tokensFilePath = path.join(process.cwd(), 'public', 'resetTokens.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, token, newPassword } = req.body;

    // Read existing tokens
    if (!fs.existsSync(tokensFilePath)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
    let tokens = JSON.parse(tokensData);

    const resetToken = tokens.find(
      (t) => t.email === email && t.token === token && t.expiry > Date.now()
    );

    if (!resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Read users
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    let users = JSON.parse(usersData);

    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    // Write updated users
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Remove used token
    tokens = tokens.filter((t) => t.token !== token);
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

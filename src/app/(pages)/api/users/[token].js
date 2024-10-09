// pages/api/users/reset-password/[token].js
import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const tokensFilePath = path.join(process.cwd(), 'public', 'resetTokens.json');

export default async function handler(req, res) {
  const { token } = req.query;

  if (req.method === 'POST') {
    const { newPassword } = req.body;

    // Read tokens
    if (!fs.existsSync(tokensFilePath)) {
      res.status(400).json({ success: false, message: 'Invalid or expired token.' });
      return;
    }

    const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
    const tokens = JSON.parse(tokensData);

    const tokenEntry = tokens.find((t) => t.token === token && t.expiry > Date.now());

    if (!tokenEntry) {
      res.status(400).json({ success: false, message: 'Invalid or expired token.' });
      return;
    }

    // Read users
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    // Find user
    const userIndex = users.findIndex((u) => u.email === tokenEntry.email);
    if (userIndex === -1) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    // Update users file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Remove used token
    const updatedTokens = tokens.filter((t) => t.token !== token);
    fs.writeFileSync(tokensFilePath, JSON.stringify(updatedTokens, null, 2));

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

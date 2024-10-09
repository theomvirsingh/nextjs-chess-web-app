// pages/api/users/verify-email.js
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const verificationTokensFilePath = path.join(process.cwd(), 'public', 'verificationTokens.json');

export default async function handler(req, res) {
  const { token } = req.query;

  if (req.method === 'GET') {
    if (!token) {
      res.status(400).json({ success: false, message: 'No token provided.' });
      return;
    }

    // Read verification tokens
    if (!fs.existsSync(verificationTokensFilePath)) {
      res.status(400).json({ success: false, message: 'Invalid or expired token.' });
      return;
    }

    const tokensData = fs.readFileSync(verificationTokensFilePath, 'utf8');
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

    // Verify user's email
    users[userIndex].isVerified = true;

    // Update users file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Remove used token
    const updatedTokens = tokens.filter((t) => t.token !== token);
    fs.writeFileSync(verificationTokensFilePath, JSON.stringify(updatedTokens, null, 2));

    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/users.js
import fs from 'fs';
import path from 'path';
import { hash, compare } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Read existing users
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(fileData);

    // Find user
    const user = users.find((user) => user.email === email);

    if (user) {
      // Compare password
      const isMatch = await compare(password, user.password);
      if (isMatch) {
        res.status(200).json({ success: true, user: { email: user.email } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

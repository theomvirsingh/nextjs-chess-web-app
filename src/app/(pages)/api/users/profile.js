// pages/api/users/profile.js
import fs from 'fs';
import path from 'path';
import { hash, compare } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

export default async function handler(req, res) {
  // Authentication should be handled via sessions or tokens.
  // For simplicity, we'll assume the user's email is sent in the request body.

  if (req.method === 'GET') {
    const { email } = req.query;

    // Read users
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    const user = users.find((u) => u.email === email);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Exclude password from the response
    const { password, ...userData } = user;

    res.status(200).json({ success: true, user: userData });
  } else if (req.method === 'PUT') {
    const { email, currentPassword, newPassword } = req.body;

    // Read users
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    const userIndex = users.findIndex((u) => u.email === email);
    if (userIndex === -1) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const user = users[userIndex];

    // Verify current password
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    // Update users file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

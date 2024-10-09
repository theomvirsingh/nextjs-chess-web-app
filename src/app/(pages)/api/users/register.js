// pages/api/users/register.js
import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../../../utils/sendEmail';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');
const verificationTokensFilePath = path.join(process.cwd(), 'public', 'verificationTokens.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Read existing users
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(fileData);

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists.' });
      return;
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Add new user
    const newUser = { email, password: hashedPassword, isVerified: false };
    users.push(newUser);

    // Write to file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Generate verification token
    const verificationToken = uuidv4();
    const expiry = Date.now() + 86400000; // Token valid for 24 hours

    // Read existing verification tokens
    let tokens = [];
    if (fs.existsSync(verificationTokensFilePath)) {
      const tokensData = fs.readFileSync(verificationTokensFilePath, 'utf8');
      tokens = JSON.parse(tokensData);
    }

    // Add new token
    tokens.push({ email, token: verificationToken, expiry });
    fs.writeFileSync(verificationTokensFilePath, JSON.stringify(tokens, null, 2));

    // Send verification email
    const verificationLink = `http://localhost:3000/loginPage?token=${verificationToken}`;
    try {
      await sendEmail({
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the following link: ${verificationLink}`,
      });
      res.status(201).json({ success: true, message: 'User registered. Verification email sent.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to send verification email.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

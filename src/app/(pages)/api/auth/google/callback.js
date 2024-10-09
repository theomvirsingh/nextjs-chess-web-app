// pages/api/auth/google/callback.js
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/api/auth/google/callback'; // Update based on your deployment

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    res.status(400).send('No code provided.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    const { email } = data;

    // Read existing users
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(fileData);

    // Check if user exists
    let user = users.find((user) => user.email === email);
    if (!user) {
      // If user doesn't exist, register them with a random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hash(randomPassword, 10);
      user = { email, password: hashedPassword };
      users.push(user);
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    }

    // Here, you can create a session or JWT token for the user
    // For simplicity, we'll redirect to the login page with a success message

    res.redirect('/loginPage?success=Google%20login%20successful');
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed.');
  }
}

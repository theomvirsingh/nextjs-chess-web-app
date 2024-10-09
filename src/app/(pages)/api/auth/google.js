// pages/api/auth/google.js
import { google } from 'googleapis';

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/api/auth/google/callback'; // Update based on your deployment

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

export default async function handler(req, res) {
  const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
}

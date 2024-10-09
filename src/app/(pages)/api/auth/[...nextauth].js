// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email;

      // Read existing users
      const fileData = readFileSync(usersFilePath, 'utf8');
      const users = JSON.parse(fileData);

      let existingUser = users.find((u) => u.email === email);

      if (!existingUser) {
        // Register new user
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await hash(randomPassword, 10);
        existingUser = { email, password: hashedPassword };
        users.push(existingUser);
        writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      }

      return true;
    },
    async session({ session, token, user }) {
      // Attach user info to session
      session.user = token.user;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});

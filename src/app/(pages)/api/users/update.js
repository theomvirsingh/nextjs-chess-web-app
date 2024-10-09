// pages/api/users/update.js
import fs from "fs";
import path from "path";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utils/sendEmail"; // Implement this utility
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { authenticateToken } from "../../../middleware/auth";

// Define the path to the users.json and verificationTokens.json files
const usersFilePath = path.join(process.cwd(), "public", "users.json");
const verificationTokensFilePath = path.join(
  process.cwd(),
  "public",
  "verificationTokens.json"
);

// Define validation schema using Yup
const updateSchema = Yup.object().shape({
  newEmail: Yup.string().email("Invalid email format"),
  newPassword: Yup.string().min(6, "Password must be at least 6 characters"),
  confirmNewPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match"
  ),
});

async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const { authorization } = req.headers;

      if (!authorization || !authorization.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authorization.split(" ")[1];
      let decoded;

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }

      const { email, newEmail, newPassword, confirmNewPassword } = req.body;

      // Validate input
      await updateSchema.validate(
        { newEmail, newPassword, confirmNewPassword },
        { abortEarly: false }
      );

      // Read existing users
      const fileData = fs.readFileSync(usersFilePath, "utf8");
      const users = JSON.parse(fileData);
      const userIndex = users.findIndex((u) => u.email === decoded.email);

      if (userIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      const user = users[userIndex];

      // If updating email
      if (newEmail && newEmail !== user.email) {
        // Check if the new email is already taken
        const emailExists = users.some((u) => u.email === newEmail);
        if (emailExists) {
          return res
            .status(400)
            .json({ success: false, message: "Email is already in use." });
        }

        // Update email and mark as unverified
        users[userIndex].email = newEmail;
        users[userIndex].isVerified = false;

        // Generate email verification token
        const verificationToken = uuidv4();
        const expiry = Date.now() + 86400000; // 24 hours

        // Read existing verification tokens
        let tokens = [];
        if (fs.existsSync(verificationTokensFilePath)) {
          const tokensData = fs.readFileSync(
            verificationTokensFilePath,
            "utf8"
          );
          tokens = JSON.parse(tokensData);
        }

        // Add new verification token
        tokens.push({ email: newEmail, token: verificationToken, expiry });
        fs.writeFileSync(
          verificationTokensFilePath,
          JSON.stringify(tokens, null, 2)
        );

        // Send verification email
        const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/loginPage?token=${verificationToken}`;
        await sendEmail({
          to: newEmail,
          subject: "Email Verification",
          text: `Please verify your new email by clicking the following link: ${verificationLink}`,
        });
      }

      // If updating password
      if (newPassword) {
        // Optional: Require current password for additional security
        const { currentPassword } = req.body;
        if (!currentPassword) {
          return res
            .status(400)
            .json({ success: false, message: "Current password is required." });
        }

        const isMatch = await compare(currentPassword, user.password);
        if (!isMatch) {
          return res
            .status(401)
            .json({
              success: false,
              message: "Current password is incorrect.",
            });
        }

        // Hash the new password
        const hashedPassword = await hash(newPassword, 10);
        users[userIndex].password = hashedPassword;
      }

      // Write updated users back to the file
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

      res
        .status(200)
        .json({ success: true, message: "Account updated successfully." });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = error.inner.map((e) => e.message);
        return res
          .status(400)
          .json({ success: false, message: errors.join(" ") });
      }
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
export default authenticateToken(handler);

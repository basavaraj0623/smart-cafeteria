const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Loads EMAIL_USER, EMAIL_PASS, EMAIL_FROM from .env

const router = express.Router();
const otpStore = new Map(); // In-memory store for OTPs

// ✅ Nodemailer transporter (use EMAIL_USER to authenticate)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // ✅ Gmail account for login (NOT display name)
    pass: process.env.EMAIL_PASS,     // ✅ Gmail App Password (not normal password)
  },
});

// ✅ Send OTP Route
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,  // display email (optional name)
    to: email,
    subject: "Smart Cafeteria - OTP Verification",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5">
        <h2>🔐 Your OTP for Smart Cafeteria</h2>
        <p>Use the following One-Time Password to verify your email:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${otp}</div>
        <p>This OTP is valid for only a short time. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📨 OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }
});

// ✅ Verify OTP Route
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  const storedOtp = otpStore.get(email);

  if (storedOtp !== otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  otpStore.delete(email); // Clean up after verification
  return res.status(200).json({ message: "OTP Verified" });
});

module.exports = router;

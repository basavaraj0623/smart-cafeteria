const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// In-memory OTP store
const otpStore = new Map();

// ✅ Nodemailer transporter (more stable config)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify transporter on startup (IMPORTANT)
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mail server error:", err);
  } else {
    console.log("✅ Mail server is ready");
  }
});


// =========================
// ✅ SEND OTP ROUTE (FIXED)
// =========================
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  console.log("👉 OTP request received:", email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  const mailOptions = {
    from: `"Smart Cafeteria" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Smart Cafeteria OTP Verification",
    html: `
      <div style="font-family: Arial; padding: 20px">
        <h2>🔐 OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="color: #4f46e5;">${otp}</h1>
        <p>This OTP is valid for a short time.</p>
      </div>
    `,
  };

  try {
    console.log("📩 Sending email...");

    // ✅ Prevent hanging (VERY IMPORTANT FIX)
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout")), 10000)
      ),
    ]);

    console.log("✅ OTP sent:", otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("❌ OTP ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to send OTP (timeout or config issue)",
    });
  }
});


// =========================
// ✅ VERIFY OTP ROUTE
// =========================
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log("👉 Verifying OTP:", email, otp);

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  const storedOtp = otpStore.get(email);

  if (!storedOtp) {
    return res.status(400).json({ error: "OTP expired or not found" });
  }

  if (storedOtp !== otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  otpStore.delete(email);

  console.log("✅ OTP verified");

  return res.status(200).json({
    message: "OTP Verified",
  });
});

module.exports = router;

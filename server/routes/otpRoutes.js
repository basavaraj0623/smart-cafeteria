const express = require("express");
require("dotenv").config();

const router = express.Router();

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = new Map();

// SEND OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  console.log("👉 OTP request:", email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Smart Cafeteria OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    console.log("✅ OTP sent:", otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("❌ Resend error:", err);

    return res.status(500).json({
      error: "Failed to send OTP",
    });
  }
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  const storedOtp = otpStore.get(email);

  if (!storedOtp) {
    return res.status(400).json({ error: "OTP expired" });
  }

  if (storedOtp !== otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  otpStore.delete(email);

  return res.status(200).json({
    message: "OTP Verified",
  });
});

module.exports = router;
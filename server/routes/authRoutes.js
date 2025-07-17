const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (user/admin)
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields including role are required" });
    }

    if (!["user", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role specified (must be user or admin)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
    });

    await user.save();

    return res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user/admin and return token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "✅ Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after OTP
 * @access  Public
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "✅ Password reset successfully" });
  } catch (err) {
    console.error("🔥 Reset Password Error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (name + avatar)
 * @access  Private
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name avatar email role");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      success: true,
      user: {
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Fetch profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

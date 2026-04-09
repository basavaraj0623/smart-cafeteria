const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields including role are required" });
    }

    const normalizedRole = role.toLowerCase();

    if (!["user", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });

    // 🔥 USER EXISTS → ADD ROLE SAFELY
    if (existingUser) {

      // ✅ FIX: convert string → array (IMPORTANT)
      if (!Array.isArray(existingUser.role)) {
        existingUser.role = [existingUser.role];
      }

      if (existingUser.role.includes(normalizedRole)) {
        return res.status(400).json({
          error: `${normalizedRole} already exists for this email`,
        });
      }

      existingUser.role.push(normalizedRole);
      await existingUser.save();

      return res.status(200).json({
        message: `${normalizedRole} role added successfully`,
      });
    }

    // 🔥 NEW USER
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: [normalizedRole], // ✅ always array
    });

    await user.save();

    return res.status(201).json({
      message: "✅ User registered successfully",
    });

  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ error: err.message }); // 🔥 show real error
  }
});

/**
 * @route   POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
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
      roles: user.role, // 🔥 now array
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
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "✅ Password reset successfully",
    });

  } catch (err) {
    console.error("🔥 Reset Password Error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});


/**
 * @route   GET /api/auth/me
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name avatar email role");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
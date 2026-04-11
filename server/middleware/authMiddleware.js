const jwt = require("jsonwebtoken");

// =========================
// ✅ VERIFY TOKEN
// =========================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Ensure role is always array
    if (!Array.isArray(decoded.role)) {
      decoded.role = [decoded.role];
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Token error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

// =========================
// ✅ ADMIN CHECK (FIXED 🔥)
// =========================
const isAdmin = (req, res, next) => {
  // ✅ Check if role array contains admin
  if (!req.user.role || !req.user.role.includes("admin")) {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
};

module.exports = { verifyToken, isAdmin };
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// ✅ Load env variables
dotenv.config();

const app = express();

// =========================
// ✅ CORS CONFIG (FIXED 🔥)
// =========================
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);

      // ✅ allow all Vercel + localhost
      if (
        origin.includes("vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      return callback(new Error("❌ Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// =========================
// ✅ MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// ✅ STATIC FILES
// =========================
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// =========================
// ✅ ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const menuRoutes = require("./routes/menuRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);

// =========================
// ✅ HEALTH CHECK ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("🚀 Smart Cafeteria API is running");
});

// =========================
// ✅ MONGODB CONNECTION
// =========================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Atlas connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// =========================
// ✅ START SERVER
// =========================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
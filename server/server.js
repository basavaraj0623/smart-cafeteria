const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// ✅ Load env variables
dotenv.config();

const app = express();

// =========================
// ✅ CORS CONFIG (secure)
// =========================
app.use(
  cors({
    origin: ["https://smart-cafeteria-zeta.vercel.app"], // your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================
// ✅ MIDDLEWARE
// =========================
app.use(express.json()); // ❌ removed duplicate

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
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// ✅ Load env variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files (logos, avatars, menu images)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Routes
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

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Smart Cafeteria API is running");
});

// ✅ MongoDB Connection (ROBUST VERSION)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast if network issue
    });

    console.log("✅ MongoDB Atlas connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:");
    console.error(error.message);
    process.exit(1); // stop app if DB fails
  }
};

// ✅ Start server AFTER DB connects
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectDB();
});
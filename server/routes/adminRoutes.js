const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const Cafeteria = require("../models/Cafeteria");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const User = require("../models/User");

require("dotenv").config();
const nodemailer = require("nodemailer");

// ✅ Multer for admin avatar only
const avatarPath = path.join(__dirname, "../public/uploads/avatars");
if (!fs.existsSync(avatarPath)) fs.mkdirSync(avatarPath, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `admin_${req.user.userId}_${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

// ✅ Email transport setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Email content builder
const getEmailContent = (status, name, items) => {
  const itemList = items.map((i) => `<li>${i.itemId.name}</li>`).join("");
  const statusMessages = {
    pending: "We’ve received your order and will begin processing it soon.",
    preparing: "Your order is now being prepared.",
    ready: "Your order is ready for pickup!",
    delivered: "Your order has been delivered. Bon appétit!",
  };

  const subject = `Order Update: Your order is now ${status.toUpperCase()}`;
  const text = `Hi ${name},\n\n${statusMessages[status] || ""}\n\nItems:\n${items.map((i) => `- ${i.itemId.name}`).join("\n")}\n\nSmart Cafeteria`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hi ${name},</h2>
      <p>${statusMessages[status] || ""}</p>
      <h3>Your Order Items:</h3>
      <ul>${itemList}</ul>
      <p style="margin-top:20px;">Thank you for choosing <strong>Smart Cafeteria</strong>!</p>
    </div>
  `;

  return { subject, text, html };
};

// -------------------- ADMIN ROUTES --------------------

// ✅ 1. Create Cafeteria (uses logoUrl)
router.post("/cafeteria", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, openHours, logoUrl } = req.body;

    if (!name || !openHours || !logoUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await Cafeteria.findOne({ owner: req.user.userId });
    if (existing) {
      return res.status(400).json({ error: "Cafeteria already exists for this admin" });
    }

    const cafeteria = new Cafeteria({
      name,
      openHours,
      logo: logoUrl,
      owner: req.user.userId,
    });

    await cafeteria.save();
    res.status(201).json({ message: "Cafeteria created", cafeteria });
  } catch (err) {
    console.error("Cafeteria creation error:", err);
    res.status(500).json({ error: "Failed to create cafeteria" });
  }
});

// ✅ 2. Update Cafeteria
router.put("/cafeteria/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, openHours, logoUrl } = req.body;
    const updates = { name, openHours };
    if (logoUrl) updates.logo = logoUrl;

    const updated = await Cafeteria.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Cafeteria not found" });
    res.json({ message: "Cafeteria updated", cafeteria: updated });
  } catch (err) {
    console.error("Cafeteria update error:", err);
    res.status(500).json({ error: "Failed to update cafeteria" });
  }
});

// ✅ 3. Delete Cafeteria
router.delete("/cafeteria/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Cafeteria.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Cafeteria not found" });
    res.json({ message: "Cafeteria deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete cafeteria" });
  }
});

// ✅ 4. Get Admin’s Cafeteria
router.get("/my-cafeteria", verifyToken, isAdmin, async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findOne({ owner: req.user.userId });
    res.json({ cafeteria: cafeteria || null });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ 5. Add Menu Item
router.post("/menu", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, tags, image, cafeteriaId } = req.body;
    const item = new MenuItem({ name, price, tags, image, cafeteriaId });
    await item.save();
    res.status(201).json({ message: "Item added", item });
  } catch {
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

// ✅ 6. Get Menu
router.get("/menu/:cafeteriaId", verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await MenuItem.find({ cafeteriaId: req.params.cafeteriaId });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// ✅ 7. Update Menu Item
router.put("/menu/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item updated", item: updatedItem });
  } catch {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

// ✅ 8. Delete Menu Item
router.delete("/menu/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// ✅ 9. Get Orders
router.get("/orders", verifyToken, isAdmin, async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findOne({ owner: req.user.userId });
    if (!cafeteria) return res.status(404).json({ error: "Cafeteria not found" });

    const orders = await Order.find({ cafeteriaId: cafeteria._id })
      .populate("userId", "name email")
      .populate("items.itemId", "name price");

    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ 10. Update Order Status + Send Email
router.put("/order-status/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.orderId)
      .populate("userId", "email name")
      .populate("items.itemId", "name");

    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    const { subject, text, html } = getEmailContent(status, order.userId.name, order.items);

    await transporter.sendMail({
      from: `"Smart Cafeteria" <${process.env.EMAIL_USER}>`,
      to: order.userId.email,
      subject,
      text,
      html,
    });

    res.json({ message: "Status updated and email sent" });
  } catch (err) {
    console.error("Status update/email error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ✅ 11. Delete Order
router.delete("/order/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findOne({ owner: req.user.userId });
    if (!cafeteria) return res.status(403).json({ error: "Unauthorized" });

    const order = await Order.findOneAndDelete({
      _id: req.params.orderId,
      cafeteriaId: cafeteria._id,
    });

    if (!order) return res.status(404).json({ error: "Order not found or unauthorized" });

    res.json({ message: "Order deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ✅ 12. Update Admin Profile (with avatar upload)
router.put("/profile", verifyToken, isAdmin, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
    });

    if (!updatedUser) return res.status(404).json({ error: "Admin not found" });

    res.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;

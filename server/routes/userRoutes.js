const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

const Cafeteria = require("../models/Cafeteria");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

// ✅ Helper: generate random 8-char alphanumeric token
function generateToken(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ✅ 1. Get all cafeterias (user view)
router.get("/cafeterias", verifyToken, async (req, res) => {
  try {
    const cafeterias = await Cafeteria.find().select("name logoUrl openHours");
    res.status(200).json(cafeterias);
  } catch (err) {
    console.error("❌ Failed to load cafeterias:", err.message);
    res.status(500).json({ error: "Failed to load cafeterias" });
  }
});

// ✅ 2. Get menu for a specific cafeteria — with virtuals!
router.get("/menu/:cafeteriaId", verifyToken, async (req, res) => {
  try {
    const menu = await MenuItem.find({ cafeteriaId: req.params.cafeteriaId }).lean({ virtuals: true });
    res.status(200).json(menu);
  } catch (err) {
    console.error("❌ Failed to load menu:", err.message);
    res.status(500).json({ error: "Failed to load menu" });
  }
});

// ✅ 3. Place an order
router.post("/order", verifyToken, async (req, res) => {
  const { items, cafeteriaId, pickupTime, total } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order items required" });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ error: "Total amount is required" });
  }

  try {
    const token = generateToken();

    const order = new Order({
      userId: req.user.userId,
      cafeteriaId,
      items,
      pickupTime,
      token,
      status: "pending",
      total,
    });

    await order.save();

    // ✅ Increment sold count
    for (const item of items) {
      await MenuItem.findByIdAndUpdate(item.itemId, {
        $inc: { soldCount: item.quantity },
      });
    }

    res.status(201).json({ message: "Order placed successfully", orderId: order.token });
  } catch (err) {
    console.error("❌ Failed to place order:", err.message);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// ✅ 4. Get a single order
router.get("/order/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.itemId", "name price")
      .populate("cafeteriaId", "name");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Failed to fetch order:", err.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// ✅ 5. Get all orders for the user
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate("items.itemId", "name price")
      .sort({ createdAt: -1 });

    const response = orders.map((order) => ({
      _id: order._id,
      pickupTime: order.pickupTime,
      status: order.status,
      createdAt: order.createdAt,
      token: order.token,
      items: order.items.map((i) => ({
        name: i.itemId.name,
        price: i.itemId.price,
        quantity: i.quantity,
      })),
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Failed to fetch my orders:", err.message);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// ✅ 6. Submit rating
router.post("/rate/:itemId", verifyToken, async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const item = await MenuItem.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    item.rating.total += rating;
    item.rating.count += 1;

    await item.save();

    res.status(200).json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("❌ Failed to submit rating:", err.message);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});
// ✅ 7. Delete a user order
router.delete("/order/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const order = await Order.findOneAndDelete({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("❌ Failed to delete order:", err.message);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = router;

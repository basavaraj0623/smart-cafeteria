// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cafeteriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafeteria",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    pickupTime: {
      type: String,
    },
    token: {
      type: String,
      required: true, // unique order token
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered"],
      default: "pending",
    },
    total: {
      type: Number,
      required: true, // 💰 required for revenue tracking
    },
    feedback: {
      rating: Number,
      comment: String,
    },
  },
  { timestamps: true } // includes createdAt and updatedAt
);

module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const cafeteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String, // Updated from logoUrl → logo
    },
    openHours: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Must be an admin
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cafeteria", cafeteriaSchema);

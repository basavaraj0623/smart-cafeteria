const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  cafeteriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cafeteria",
    required: true,
  },
  soldCount: { type: Number, default: 0 },
  rating: {
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
});

// ✅ Virtual field for averageRating
menuItemSchema.virtual("averageRating").get(function () {
  return this.rating.count > 0 ? this.rating.total / this.rating.count : 0;
});

menuItemSchema.set("toJSON", { virtuals: true });
menuItemSchema.set("toObject", { virtuals: true });

// ✅ Safe export: prevents OverwriteModelError
module.exports =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);

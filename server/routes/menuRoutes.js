const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  cafeteriaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cafeteria" },
  soldCount: { type: Number, default: 0 },
  rating: {
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
});

// ✅ Add virtual field for average rating
menuItemSchema.virtual("averageRating").get(function () {
  return this.rating.count > 0 ? this.rating.total / this.rating.count : 0;
});

// ✅ Ensure virtuals are included when converting to JSON
menuItemSchema.set("toJSON", { virtuals: true });
menuItemSchema.set("toObject", { virtuals: true });

// ✅ Fix: only compile model if it doesn't exist
module.exports =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);

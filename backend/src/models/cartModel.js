const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  foodType: { type: String,  },
  photos: { type: [String], default: [] }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  restaurantName: { type: String, required: true },
  items: { type: [cartItemSchema], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);

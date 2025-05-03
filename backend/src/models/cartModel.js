const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuOfRestaurant", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  basePrice: { type: Number, required: true },
  packagingCharges: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isVeg: { type: Boolean,  },
  photos: { type: [String], default: [] }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  restaurantName: { type: String, required: true },
  items: { type: [cartItemSchema], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);

const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  date: { type: String, unique: true, required: true }, 
  morning: [
    {
      menuName: { type: String, required: true },
      image: { type: String }, 
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, min: 1 }
    },
  ],
  afternoon: [
    {
      menuName: { type: String, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, min: 1 }
    },
  ],
  evening: [
    {
      menuName: { type: String, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, min: 1 }
    },
  ],
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    items: [
        {
            menuName: String,
            price: Number,
            quantity: Number,
        }
    ],
    shippingDetails: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    totalAmount: Number,
    paymentMethod: String,
    status: { type: String, default: "Pending" }, // Pending, Shipped, Delivered
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);

const Cart = require("../models/cartModel");
const User = require("../models/userModel")

// Add item to cart or update quantity
const addToCart = async (req, res) => {

    const { menuName, price, quantity, mealTime, date, image } = req.body;
    const userEmail = req.user.email;;


    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userId = user._id;

        let cartItem = await Cart.findOne({ userId, menuName, date });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new Cart({ userId, menuName, price, quantity, mealTime, date, image });
        }

        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error });
    }
};

// Get cart items for a user
const getCartItems = async (req, res) => {
    const userEmail = req.user.email;
    const todayDate = new Date().toISOString().split('T')[0]; 

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        const cartItems = await Cart.find({ userId: user._id, date: todayDate });

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving cart", error });
    }
};


// Update item quantity
const updateCartQuantity = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { quantity } = req.body;
        const cartItem = await Cart.findById(req.params.id);

        if (!cartItem || cartItem.userId.toString() !== user._id.toString()) {
            return res.status(404).json({ message: "Item not found" });
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        res.status(200).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: "Error updating quantity", error });
    }
};


// Delete an item from the cart
const deleteCartItem = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        const cartItem = await Cart.findById(req.params.id);

        if (!cartItem || cartItem.userId.toString() !== user._id.toString()) {
            return res.status(404).json({ message: "Item not found" });
        }

        await cartItem.deleteOne();
        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error });
    }
};


// Delete all cart items for a user
const clearCart = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        await Cart.deleteMany({ userId: user._id });

        res.status(200).json({ message: "All items removed from cart" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error });
    }
};

module.exports = {
    addToCart,
    getCartItems,
    updateCartQuantity,
    deleteCartItem,
    clearCart
};

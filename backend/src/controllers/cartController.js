const Cart = require("../models/cartModel");
const User = require("../models/userModel");

// Add item to cart or update quantity
const addToCart = async (req, res) => {
    const {
        restaurantId,
        restaurantName,
        items = [],
    } = req.body;

    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        // Check if user has a cart for a different restaurant
        const existingCart = await Cart.findOne({ userId });
        if (existingCart && existingCart.restaurantId.toString() !== restaurantId) {
            return res.status(409).json({ message: "Cart contains items from another restaurant" });
        }

        // Find cart for this user and restaurant
        let cart = await Cart.findOne({ userId, restaurantId });
        if (!cart) {
            cart = new Cart({
                userId,
                restaurantId,
                restaurantName,
                items,
            });
        } else {
            // Merge new items with existing items
            for (const newItem of items) {
                const existingItemIndex = cart.items.findIndex(
                    item => item.itemId.toString() === newItem.itemId.toString()
                );
                
                if (existingItemIndex !== -1) {
                    // Update quantity if item already exists
                    cart.items[existingItemIndex].quantity += newItem.quantity;
                } else {
                    // Add new item if it doesn't exist
                    cart.items.push(newItem);
                }
            }
            cart.restaurantName = restaurantName;
        }

        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};

// Get all cart items for a user
const getCartItems = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        const carts = await Cart.find({ userId })
            .populate({
                path: 'restaurantId',
                select: 'serviceType' // Only select the serviceType field
            });

        // Transform the response to include serviceType
        const transformedCarts = carts.map(cart => ({
            ...cart.toObject(),
            serviceType: cart.restaurantId?.serviceType || null
        }));

        res.json(transformedCarts);
    } catch (error) {
        console.error('Error in getCartItems:', error);
        res.status(500).json({ message: "Error fetching cart items", error: error.message });
    }
};

// Update item quantity in cart
const updateCartQuantity = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        // Fetch cart by userId only
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // Use .find instead of findIndex
        const item = cart.items.find(item => {
            console.log(item.itemId.toString(), itemId, "item.itemId.toString()");
            return item.itemId.toString() == itemId;
        });
        if (!item) return res.status(404).json({ message: "Item not found in cart" });

        item.quantity = quantity;
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error in updateCartQuantity:', error);
        res.status(500).json({ message: "Error updating cart quantity", error: error.message });
    }
};

// Delete item from cart
const deleteCartItem = async (req, res) => {
    const { itemId } = req.params;
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        // Fetch cart by userId only
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // Filter items in JS
        const itemExists = cart.items.some(item => item.itemId.toString() === itemId);
        if (!itemExists) return res.status(404).json({ message: "Item not found in cart" });

        cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error in deleteCartItem:', error);
        res.status(500).json({ message: "Error deleting cart item", error: error.message });
    }
};

// Clear all cart items for a user
const clearCart = async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        await Cart.deleteMany({ userId });
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error('Error in clearCart:', error);
        res.status(500).json({ message: "Error clearing cart", error: error.message });
    }
};

module.exports = {
    addToCart,
    getCartItems,
    updateCartQuantity,
    deleteCartItem,
    clearCart
};

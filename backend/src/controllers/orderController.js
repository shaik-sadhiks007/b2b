const Order = require("../models/orderModel");
const User = require("../models/userModel"); 
const { sendOrderConfirmationEmail, sendStatusChangeEmail } = require('../utils/emailService');

exports.placeOrder = async (req, res) => {
    try {
        const { email } = req.user;  
        const { items, totalAmount, shippingDetails, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create new order
        const newOrder = new Order({
            userId: user._id, 
            items,
            shippingDetails,
            totalAmount,
            paymentMethod,
            status: 'Order Placed'
        });

        await newOrder.save();

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(email, {
                items,
                shippingDetails,
                totalAmount,
                paymentMethod
            });
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't throw error here, just log it
        }

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

exports.orderHistory = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "admin") {
            return res.status(403).json({ error: "Access denied. Only admins can view all orders." });
        }

        const orders = await Order.find().populate("userId", "name email");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order history" });
    }
}

exports.orderHistoryByUser = async (req, res) => {
    try {
        const { email } = req.user; 

        const user = await User.findOne({ email }); 
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const orders = await Order.find({ userId: user._id }); 

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: "No orders found." });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user order history" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status field
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Get the previous status
        const previousStatus = order.status;

        // Update order status
        order.status = status;
        await order.save();

        // Send status change email notification
        try {
            let email;
            if (order.userId) {
                // For logged-in users, get email from user model
                const user = await User.findById(order.userId);
                email = user.email;
            } else {
                // For guest users, use the email from shipping details
                email = order.shippingDetails.email;
            }

            if (email) {
                await sendStatusChangeEmail(email, {
                    orderId: order._id,
                    previousStatus,
                    newStatus: status,
                    items: order.items,
                    shippingDetails: order.shippingDetails,
                    totalAmount: order.totalAmount,
                    paymentMethod: order.paymentMethod
                });
            }
        } catch (emailError) {
            console.error('Error sending status change email:', emailError);
            // Don't throw error here, just log it
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order status" });
    }
};

exports.orderHistoryByPhone = async (req, res) => {
    try {
        const { phone } = req.params; 

        if (!phone) {
            return res.status(400).json({ error: "Phone number is required." });
        }

        // Find orders based on the shippingDetails.phone field
        const orders = await Order.find({ "shippingDetails.phone": phone });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: "No orders found for this phone number." });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order history by phone number" });
    }
};

exports.guestplaceOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingDetails, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        // Create new order for guest user
        const newOrder = new Order({
            items,
            shippingDetails,
            totalAmount,
            paymentMethod,
            status: 'Order Placed'
        });

        await newOrder.save();

        // Send confirmation email to guest user
        try {
            await sendOrderConfirmationEmail(shippingDetails.email, {
                items,
                shippingDetails,
                totalAmount,
                paymentMethod
            });
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't throw error here, just log it
        }

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error('Error placing guest order:', error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

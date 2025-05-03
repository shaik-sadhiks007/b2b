const Order = require("../models/orderModel");
const User = require("../models/userModel");
const MenuOfRestaurant = require("../models/menu");
const CustomerAddress = require("../models/customerAddress");
const { sendOrderConfirmationEmail, sendStatusChangeEmail } = require('../utils/emailService');

exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, orderType, deliveryTime, customerAddress, addressId } = req.body;
        const userId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        // Validate all items exist and get restaurant details
        const firstItem = await MenuOfRestaurant.findById(items[0].itemId);
        if (!firstItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        const restaurantId = firstItem.restaurantId;
        const restaurantName = firstItem.restaurantName;

        let customerAddressId;
        
        // If addressId is provided, use existing address
        if (addressId) {
            const existingAddress = await CustomerAddress.findById(addressId);
            if (!existingAddress) {
                return res.status(404).json({ error: "Address not found" });
            }
            customerAddressId = addressId;
        } 
        // If customerAddress is provided, create new address
        else if (customerAddress) {
            const newAddress = new CustomerAddress({
                userId,
                fullName: customerAddress.fullName,
                street: customerAddress.street,
                city: customerAddress.city,
                state: customerAddress.state,
                zip: customerAddress.zip,
                country: customerAddress.country,
                phone: customerAddress.phone,
                isDefault: false
            });
            await newAddress.save();
            customerAddressId = newAddress._id;
        } else {
            return res.status(400).json({ error: "Either addressId or customerAddress is required" });
        }

        // Create new order
        const newOrder = new Order({
            user: userId,
            items: items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                photos: item.photos || [],
                isVeg: item.isVeg
            })),
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "ORDER_PLACED",
            restaurantId,
            restaurantName,
            orderType,
            deliveryTime,
            customerAddress: customerAddressId
        });

        await newOrder.save();

        // Send confirmation email
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendOrderConfirmationEmail(user.email, newOrder);
            }
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
        }

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

exports.orderHistory = async (req, res) => {
    try {

        const orders = await Order.find({ restaurantId : req.restaurant._id })
            .populate("customerAddress")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order history" });
    }
};

exports.orderHistoryByUser = async (req, res) => {
    try {

        const orders = await Order.find({ user : req.user.id })
            .populate("customerAddress")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order history" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Send status change email notification
        try {
            const user = await User.findById(order.user);
            if (user && user.email) {
                await sendStatusChangeEmail(user.email, {
                    orderId: order._id,
                    previousStatus,
                    newStatus: status,
                    items: order.items,
                    totalAmount: order.totalAmount,
                    paymentMethod: order.paymentMethod
                });
            }
        } catch (emailError) {
            console.error('Error sending status change email:', emailError);
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order status" });
    }
};

exports.instoreOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, customerName, customerPhone } = req.body;
        const restaurantId = req.restaurant._id;
        const restaurantName = req.restaurant.name;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        // Create new instore order
        const newOrder = new Order({
            items: items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                photos: item.photos || [],
                isVeg: item.isVeg
            })),
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "INSTORE",
            restaurantId,
            restaurantName,
            orderType: "PICKUP",
            deliveryTime: 0,
            customerName,
            customerPhone
        });

        await newOrder.save();
        res.status(201).json({ message: "In-store order placed successfully", order: newOrder });
    } catch (error) {
        console.error('Error placing instore order:', error);
        res.status(500).json({ error: "Failed to place instore order" });
    }
};   


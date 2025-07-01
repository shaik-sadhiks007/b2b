const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Menu = require("../models/menuModel");
const CustomerAddress = require("../models/customerAddress");
const Restaurant = require("../models/businessModel");
const { sendOrderConfirmationEmail, sendStatusChangeEmail } = require('../utils/emailService');
const moment = require('moment-timezone');

exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, orderType, addressId, customerAddressData, restaurantId, restaurantName } = req.body;
        const userId = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        let totalOrders = [];

        // Check if all items are in stock
        for (const item of items) {
            // Direct query using businessId and _id
            const menuItem = await Menu.findOne({ 
                _id: item.itemId, 
                businessId: restaurantId 
            });

            if (!menuItem) {
                return res.status(404).json({ error: `Item ${item.name} not found` });
            }
            if (!menuItem.inStock) {
                return res.status(400).json({ error: `${item.name} is out of stock` });
            }
            if (menuItem.quantity < item.quantity) {
                return res.status(400).json({ error: `Only ${menuItem.quantity} quantity available for ${item.name}` });
            }

            totalOrders.push({
                menuItem,
                orderQuantity: item.quantity
            });
        }

        // Update quantities for ordered items
        for (const order of totalOrders) {
            const { menuItem, orderQuantity } = order;
            menuItem.quantity = Math.max(0, menuItem.quantity - orderQuantity);
            if (menuItem.quantity === 0) {
                menuItem.inStock = false;
            }
            await menuItem.save();
        }

        let customerAddressId;
        let customerName;
        let customerPhone;

        // Handle address logic based on orderType
        if (orderType === 'delivery') {
            // For delivery orders, address is required
            if (!addressId && !customerAddressData) {
                return res.status(400).json({ error: "Delivery address is required for delivery orders" });
            }

            if (addressId) {
                // If addressId is provided, use it
                const address = await CustomerAddress.findById(addressId);
                if (!address) {
                    return res.status(404).json({ error: "Address not found" });
                }
                customerAddressId = addressId;
                customerName = address.fullName;
                customerPhone = address.phone;
            } else if (customerAddressData) {
                // Check if this is the first address for the user
                const existingAddresses = await CustomerAddress.find({ userId });
                const isFirstAddress = existingAddresses.length === 0;

                // If no addressId but customerAddressData is provided, create new address
                const newAddress = new CustomerAddress({
                    userId,
                    fullName: customerAddressData.fullName,
                    street: customerAddressData.street,
                    city: customerAddressData.city,
                    state: customerAddressData.state,
                    zip: customerAddressData.zip,
                    country: customerAddressData.country,
                    phone: customerAddressData.phone,
                    isDefault: isFirstAddress // Set as default if it's the first address
                });
                await newAddress.save();
                customerAddressId = newAddress._id;
                customerName = newAddress.fullName;
                customerPhone = newAddress.phone;
            }
        } else if (orderType === 'pickup') {
            // For pickup orders, address is optional
            if (addressId) {
                const address = await CustomerAddress.findById(addressId);
                if (address) {
                    customerAddressId = addressId;
                    customerName = address.fullName;
                    customerPhone = address.phone;
                }
            } else if (customerAddressData) {
                // If customer provides address data for pickup, save it but don't require it
                const newAddress = new CustomerAddress({
                    userId,
                    fullName: customerAddressData.fullName,
                    street: customerAddressData.street,
                    city: customerAddressData.city,
                    state: customerAddressData.state,
                    zip: customerAddressData.zip,
                    country: customerAddressData.country,
                    phone: customerAddressData.phone,
                    isDefault: false
                });
                await newAddress.save();
                customerAddressId = newAddress._id;
                customerName = newAddress.fullName;
                customerPhone = newAddress.phone;
            }
        } else {
            console.error('[orderController.js][placeOrder-invalidOrderType]', { orderType });
            return res.status(400).json({ error: "Invalid order type. Must be either 'delivery' or 'pickup'" });
        }

        // Validate restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
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
                foodType: item.foodType || 'veg'
            })),
            totalAmount,
            paymentMethod: paymentMethod || "COD",
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "ORDER_PLACED",
            restaurantId,
            restaurantName,
            orderType: orderType || "delivery",
            customerAddress: customerAddressId,
            customerName,
            customerPhone
        });

        await newOrder.save();

        // Send confirmation email
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendOrderConfirmationEmail(user.email, newOrder);
            }
        } catch (emailError) {
            console.error('[orderController.js][placeOrder-email]', emailError);
        }

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error('[orderController.js][placeOrder]', error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

exports.orderHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        const filter = {
            restaurantId: req.restaurant._id,
            status: {
                $in: [
                    'ORDER_DELIVERED',
                    'ORDER_CANCELLED',
                    'ORDER_PICKED_UP',
                    'INSTORE_ORDER',
                    'CANCELLED'
                ]
            }
        };

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customerAddress")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            orders,
            pagination: {
                total: totalOrders,
                page,
                pageSize,
                totalPages: Math.ceil(totalOrders / pageSize)
            }
        });
    } catch (error) {
        console.error('[orderController.js][orderHistory]', error);
        res.status(500).json({ error: "Failed to fetch order history" });
    }
};

exports.orderHistoryByUser = async (req, res) => {
    try {

        const orders = await Order.find({ user: req.user.id })
            .populate("customerAddress")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error('[orderController.js][orderHistoryByUser]', error);
        res.status(500).json({ error: "Failed to fetch order history", message: error.message });
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
        console.error('[orderController.js][updateOrderStatus]', error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

exports.instoreOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, customerName, customerPhone } = req.body;
        const restaurantId = req.restaurant._id;
        const restaurantName = req.restaurant.restaurantName;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        // Create new instore order
        const newOrder = new Order({
            user: req.user.id,
            items: items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                photos: item.photos || [],
                foodType: item.foodType
            })),
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "INSTORE_ORDER",
            restaurantId,
            restaurantName,
            orderType: "pickup",
            deliveryTime: 0,
            customerName,
            customerPhone
        });

        await newOrder.save();
        res.status(201).json({ message: "In-store order placed successfully", order: newOrder });
    } catch (error) {
        console.error('[orderController.js][instoreOrder]', error);
        res.status(500).json({ error: "Failed to place instore order" });
    }
};

exports.orderSuccess = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order placed successfully", order });
    } catch (error) {
        console.error('[orderController.js][orderSuccess]', error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

exports.postRestaurantOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if the order belongs to the restaurant making the request
        if (order.restaurantId.toString() !== req.restaurant._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to update this order" });
        }

        order.status = status;
        if (!order.orderType) order.orderType = 'PICKUP';
        await order.save();

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error('[orderController.js][postRestaurantOrderStatus]', error);
        res.status(500).json({ error: "Failed to update order status", message: error.message });
    }
};

exports.getRestaurantOrderStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        const totalOrders = await Order.countDocuments({
            status,
            restaurantId: req.restaurant._id
        });

        const orders = await Order.find({
            status,
            restaurantId: req.restaurant._id
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            orders,
            pagination: {
                total: totalOrders,
                page,
                pageSize,
                totalPages: Math.ceil(totalOrders / pageSize)
            }
        });
    } catch (error) {
        console.error('[orderController.js][getRestaurantOrderStatus]', error);
        res.status(500).json({ error: "Failed to fetch order status", message: error.message });
    }
};

exports.getRestaurantOrderCounts = async (req, res) => {
    try {
        const statuses = ['ORDER_PLACED', 'ACCEPTED', 'ORDER_READY', 'ORDER_PICKED_UP'];
        const counts = await Promise.all(
            statuses.map(async (status) => {
                const count = await Order.countDocuments({
                    status,
                    restaurantId: req.restaurant._id
                });
                return { status, count };
            })
        );

        const countsObject = counts.reduce((acc, { status, count }) => {
            acc[status] = count;
            return acc;
        }, {});

        res.status(200).json(countsObject);
    } catch (error) {
        console.error('[orderController.js][getRestaurantOrderCounts]', error);
        res.status(500).json({ error: "Failed to fetch order counts", message: error.message });
    }
};

// Get total items to pack for ACCEPTED orders (for pie chart summary)
exports.getAcceptedItemsSummary = async (req, res) => {
    try {
        const orders = await Order.find({
            restaurantId: req.restaurant._id,
            status: 'ACCEPTED'
        });

        // Aggregate item quantities
        let totalItemsToPack = 0;
        const itemSummary = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSummary[item.name]) {
                    itemSummary[item.name] = 0;
                }
                itemSummary[item.name] += item.quantity;
                totalItemsToPack += item.quantity; // Accumulate total items
            });
        });

        // Convert to array for charting
        const summaryArray = Object.entries(itemSummary).map(([name, quantity]) => ({ name, quantity }));

        res.status(200).json({
            itemDetails: summaryArray,
            totalItems: totalItemsToPack
        });
    } catch (error) {
        console.error('[orderController.js][getAcceptedItemsSummary]', error);
        res.status(500).json({ error: "Failed to fetch accepted items summary" });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.id
        })
            .populate("customerAddress");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('[orderController.js][getOrderDetails]', error);
        res.status(500).json({ error: "Failed to fetch order details", message: error.message });
    }
};

exports.getPublicOrderStatus = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId })
            .populate("customerAddress")
            .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Return detailed order information but exclude sensitive user data
        const publicOrderInfo = {
            orderId: order._id,
            status: order.status,
            restaurantName: order.restaurantName,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            orderType: order.orderType,
            paymentMethod: order.paymentMethod,
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                isVeg: item.isVeg
            })),
            // customerAddress: order.customerAddress ? {
            //     fullName: order.customerAddress.fullName,
            //     street: order.customerAddress.street,
            //     city: order.customerAddress.city,
            //     state: order.customerAddress.state,
            //     zip: order.customerAddress.zip,
            //     country: order.customerAddress.country,
            //     phone: order.customerAddress.phone
            // } : null
        };

        res.status(200).json(publicOrderInfo);
    } catch (error) {
        console.error('[orderController.js][getPublicOrderStatus]', error);
        res.status(500).json({ error: "Failed to fetch order status", message: error.message });
    }
};

exports.getOrdersSummary = async (req, res) => {
    try {
        const restaurantId = req.restaurant._id;

        let { startDate, endDate, timeFrame } = req.query;

        let queryStartDate;
        let queryEndDate;

        // Set timezone to IST (Indian Standard Time)
        const timezone = 'Asia/Kolkata';

        if (timeFrame) {
            const now = moment().tz(timezone).startOf('day');

            if (timeFrame === '1D') {
                queryStartDate = now.toDate();
                queryEndDate = now.endOf('day').toDate();
            } else if (timeFrame === '1W') {
                // Get the first day of the current week (Monday)
                queryStartDate = now.startOf('week').toDate();
                queryEndDate = now.endOf('week').toDate();
            } else if (timeFrame === '1M') {
                queryStartDate = now.startOf('month').toDate();
                queryEndDate = now.endOf('month').toDate();
            } else if (timeFrame === '3M') {
                queryStartDate = now.subtract(2, 'months').startOf('month').toDate();
                queryEndDate = now.add(2, 'months').endOf('month').toDate();
            } else if (timeFrame === '6M') {
                queryStartDate = now.subtract(5, 'months').startOf('month').toDate();
                queryEndDate = now.add(5, 'months').endOf('month').toDate();
            }
        } else if (startDate && endDate) {
            queryStartDate = moment.tz(startDate, timezone).startOf('day').toDate();
            queryEndDate = moment.tz(endDate, timezone).endOf('day').toDate();
        } else {
            // Default to current month if no timeframe or explicit dates
            const now = moment().tz(timezone);
            queryStartDate = now.startOf('month').toDate();
            queryEndDate = now.endOf('month').toDate();
        }

        const matchQuery = {
            restaurantId: restaurantId,
            createdAt: {
                $gte: queryStartDate,
                $lte: queryEndDate
            }
        };

        const orders = await Order.find(matchQuery);

        let totalItemsSold = 0;
        let totalRevenue = 0;
        const totalOrdersCount = orders.length;

        orders.forEach(order => {
            order.items.forEach(item => {
                totalItemsSold += item.quantity;
            });
            totalRevenue += order.totalAmount; // Assuming 'totalAmount' field exists in Order schema
        });

        // Aggregate for popular items
        const popularItems = await Order.aggregate([
            {
                $match: matchQuery
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.item',
                    itemName: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 5 // Get top 5 popular items, can be adjusted
            }
        ]);

        // Aggregate for daily revenue data (for line chart)
        const dailyRevenue = await Order.aggregate([
            {
                $match: matchQuery // Use the same date and restaurant ID filter
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d", // Group by day
                            date: "$createdAt"
                        }
                    },
                    totalDailyRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { "_id": 1 } // Sort by date
            }
        ]);

        // Get recent orders (e.g., last 5 orders, sorted by creation date descending)
        const recentOrders = await Order.find(matchQuery)
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            totalOrdersCount,
            totalRevenue,
            totalItemsSold,
            popularItems,
            dailyRevenue,
            recentOrders, // Add recent orders data
            timeFrame: timeFrame || '1M' // Indicate the applied timeframe
        });

    } catch (error) {
        console.error('[orderController.js][getOrdersSummary]', error);
        res.status(500).json({ error: 'Failed to fetch order summary', message: error.message });
    }
};


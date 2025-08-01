const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Menu = require("../models/menuModel");
const CustomerAddress = require("../models/customerAddress");
const Restaurant = require("../models/businessModel");
const { sendOrderConfirmationEmail, sendStatusChangeEmail, sendOrderNotificationToRestaurant, sendStatusChangeToRestaurant } = require('../utils/emailService');
const { calculateDeliveryCharges, calculateGST, calculateDistance } = require('./settingsController');
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
                    pincode: customerAddressData.pincode,
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
                    pincode: customerAddressData.pincode,
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

        // Calculate delivery charges and GST
        let deliveryCharge = 0;
        let gstAmount = 0;
        let gstPercentage = 5;
        let subtotalAmount = totalAmount;

        if (orderType === 'delivery') {
            // Calculate distance if customer address has location
            let distance = 0;
            if (customerAddressId) {
                const address = await CustomerAddress.findById(customerAddressId);
                if (address && address.location && restaurant.location) {
                    distance = calculateDistance(address.location, restaurant.location);
                }
            }

            // Calculate total weight of items (assuming average weight per item)
            const totalWeight = items.reduce((weight, item) => weight + (item.quantity * 0.5), 0); // 0.5kg per item as default

            // Calculate delivery charges
            const deliveryResult = await calculateDeliveryCharges(totalAmount, distance, totalWeight);
            deliveryCharge = deliveryResult.deliveryCharge;
        }

        // Calculate GST based on restaurant category
        const category = restaurant.category || 'restaurant';
        const gstResult = await calculateGST(totalAmount, category);
        gstAmount = gstResult.gstAmount;
        gstPercentage = gstResult.gstPercentage;

        // Calculate final total
        const finalTotalAmount = subtotalAmount + deliveryCharge + gstAmount;

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
            subtotalAmount,
            deliveryCharge,
            gstAmount,
            gstPercentage,
            totalAmount: finalTotalAmount,
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
            let orderForEmail = newOrder.toObject();
            orderForEmail.orderType = orderType;
            if (orderType === 'delivery' && newOrder.customerAddress) {
                // Populate customerAddress for delivery
                const address = await CustomerAddress.findById(newOrder.customerAddress);
                if (address) {
                    orderForEmail.customerAddress = address.toObject();
                }
            }
            if (user && user.email) {
                sendOrderConfirmationEmail(user.email, orderForEmail)
                    .catch(err => console.error('[orderController.js][placeOrder-email]', err));
            }
            // Send email to restaurant as well
            if (restaurant && restaurant.contact && restaurant.contact.email) {
                sendOrderNotificationToRestaurant(restaurant.contact.email, orderForEmail)
                    .catch(err => console.error('[orderController.js][placeOrder-restaurant-email]', err));
            }
        } catch (emailError) {
            console.error('[orderController.js][placeOrder-email]', emailError);
        }

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error('[orderController.js][placeOrder]', error);
        console.trace('[orderController.js][placeOrder] Stack trace:');
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
            .populate("deliveryPartnerId", "name mobileNumber email")
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
        console.trace('[orderController.js][orderHistory] Stack trace:');
        res.status(500).json({ error: "Failed to fetch order history" });
    }
};

exports.orderHistoryByUser = async (req, res) => {
    try {

        const orders = await Order.find({ user: req.user.id })
            .populate("customerAddress")
            .populate("deliveryPartnerId", "name mobileNumber email")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error('[orderController.js][orderHistoryByUser]', error);
        console.trace('[orderController.js][orderHistoryByUser] Stack trace:');
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
            let orderForEmail = order.toObject();
            orderForEmail.previousStatus = previousStatus;
            orderForEmail.newStatus = status;
            orderForEmail.orderType = order.orderType;
            if (order.orderType === 'delivery' && order.customerAddress) {
                const address = await CustomerAddress.findById(order.customerAddress);
                if (address) {
                    orderForEmail.customerAddress = address.toObject();
                }
            }
            if (user && user.email) {
                sendStatusChangeEmail(user.email, orderForEmail)
                    .catch(err => console.error('Error sending status change email:', err));
            }
            // Send status change email to restaurant as well
            const restaurant = await Restaurant.findById(order.restaurantId);
            if (restaurant && restaurant.contact && restaurant.contact.email) {
                sendStatusChangeToRestaurant(restaurant.contact.email, orderForEmail)
                    .catch(err => console.error('Error sending status change email to restaurant:', err));
            }
        } catch (emailError) {
            console.error('Error sending status change email:', emailError);
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error('[orderController.js][updateOrderStatus]', error);
        console.trace('[orderController.js][updateOrderStatus] Stack trace:');
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
        console.trace('[orderController.js][instoreOrder] Stack trace:');
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
        console.trace('[orderController.js][orderSuccess] Stack trace:');
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

        const previousStatus = order.status;
        order.status = status;
        if (!order.orderType) order.orderType = 'PICKUP';
        await order.save();

        // Emit delivery ready order event if status is ORDER_DELIVERY_READY
        if (status === 'ORDER_DELIVERY_READY') {
            const io = req.app.get('io');
            if (io) {
                io.emit('deliveryReadyOrder', order);
            }
        }

        // Emit order status update event for all status changes
        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdate', order);
        }

        // Send status change email notification to customer
        try {
            const user = await User.findById(order.user);
            let orderForEmail = order.toObject();
            orderForEmail.previousStatus = previousStatus;
            orderForEmail.newStatus = status;
            orderForEmail.orderType = order.orderType;
            if (order.orderType === 'delivery' && order.customerAddress) {
                const address = await CustomerAddress.findById(order.customerAddress);
                if (address) {
                    orderForEmail.customerAddress = address.toObject();
                }
            }
            if (user && user.email) {
                sendStatusChangeEmail(user.email, orderForEmail)
                    .catch(err => console.error('[orderController.js][postRestaurantOrderStatus-customer-email]', err));
            }
        } catch (emailError) {
            console.error('[orderController.js][postRestaurantOrderStatus-customer-email]', emailError);
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error('[orderController.js][postRestaurantOrderStatus]', error);
        console.trace('[orderController.js][postRestaurantOrderStatus] Stack trace:');
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
            .populate('deliveryPartnerId', 'name mobileNumber email')
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
        console.trace('[orderController.js][getRestaurantOrderStatus] Stack trace:');
        res.status(500).json({ error: "Failed to fetch order status", message: error.message });
    }
};

exports.getRestaurantOrderCounts = async (req, res) => {
    try {
        const statuses = ['ORDER_PLACED', 'ACCEPTED', 'ORDER_DELIVERY_READY', 'ORDER_PICKUP_READY', 'ORDER_PICKED_UP'];
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
        console.trace('[orderController.js][getRestaurantOrderCounts] Stack trace:');
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
        console.trace('[orderController.js][getAcceptedItemsSummary] Stack trace:');
        res.status(500).json({ error: "Failed to fetch accepted items summary" });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.id
        })
            .populate("customerAddress")
            .populate("deliveryPartnerId", "name mobileNumber email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('[orderController.js][getOrderDetails]', error);
        console.trace('[orderController.js][getOrderDetails] Stack trace:');
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
            //     pincode: order.customerAddress.pincode,
            //     country: order.customerAddress.country,
            //     phone: order.customerAddress.phone
            // } : null
        };

        res.status(200).json(publicOrderInfo);
    } catch (error) {
        console.error('[orderController.js][getPublicOrderStatus]', error);
        console.trace('[orderController.js][getPublicOrderStatus] Stack trace:');
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
                // Last 30 days, not current calendar month
                queryStartDate = moment().tz(timezone).subtract(30, 'days').startOf('day').toDate();
                queryEndDate = moment().tz(timezone).endOf('day').toDate();
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
        console.trace('[orderController.js][getOrdersSummary] Stack trace:');
        res.status(500).json({ error: 'Failed to fetch order summary', message: error.message });
    }
};

// Admin: Get order summary for a business by ownerId
exports.getOrdersSummaryByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business; // for reuse of existing logic
        return exports.getOrdersSummary({ ...req, restaurant: business }, res);
    } catch (error) {
        console.error('[orderController.js][getOrdersSummaryByAdmin]', error);
        res.status(500).json({ error: 'Failed to get order summary', message: error.message });
    }
};

// Admin: Get order counts for a business by ownerId
exports.getOrderCountsByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        return exports.getRestaurantOrderCounts({ ...req, restaurant: business }, res);
    } catch (error) {
        console.error('[orderController.js][getOrderCountsByAdmin]', error);
        res.status(500).json({ error: 'Failed to get order counts', message: error.message });
    }
};

// Admin: Get order history for a business by ownerId
exports.getOrderHistoryByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        return exports.orderHistory({ ...req, restaurant: business }, res);
    } catch (error) {
        console.error('[orderController.js][getOrderHistoryByAdmin]', error);
        res.status(500).json({ error: 'Failed to get order history', message: error.message });
    }
};

// Admin: Get orders by status for a business by ownerId
exports.getRestaurantOrderStatusByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        const { status } = req.params;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        return exports.getRestaurantOrderStatus({ ...req, restaurant: business, params: { status } }, res);
    } catch (error) {
        console.error('[orderController.js][getRestaurantOrderStatusByAdmin]', error);
        res.status(500).json({ error: 'Failed to get orders by status', message: error.message });
    }
};

// Admin: Update order status for a business by ownerId
exports.postRestaurantOrderStatusByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        const { orderId } = req.params;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        return exports.postRestaurantOrderStatus({ ...req, restaurant: business, params: { orderId } }, res);
    } catch (error) {
        console.error('[orderController.js][postRestaurantOrderStatusByAdmin]', error);
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};

// Admin: Get accepted items summary for a business by ownerId
exports.getAcceptedItemsSummaryByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        return exports.getAcceptedItemsSummary({ ...req, restaurant: business }, res);
    } catch (error) {
        console.error('[orderController.js][getAcceptedItemsSummaryByAdmin]', error);
        res.status(500).json({ error: 'Failed to get accepted items summary', message: error.message });
    }
};

// Admin: Place in-store order for a business by ownerId
exports.postInstoreOrderByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        req.restaurant = business;
        // Reuse the existing instoreOrder logic
        return exports.instoreOrder({ ...req, restaurant: business }, res);
    } catch (error) {
        console.error('[orderController.js][postInstoreOrderByAdmin]', error);
        res.status(500).json({ error: 'Failed to place in-store order', message: error.message });
    }
};




// Delivery partner: Get orders
exports.getDeliveryPartnerOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const { timeFilter, businessFilter } = req.query;

        let filter = {
            deliveryPartnerId: req.deliveryPartner._id,
            status: { $in: ['ORDER_DELIVERY_READY', 'OUT_FOR_DELIVERY'] }
        };

        // Add time filter
        if (timeFilter) {
            const now = new Date();
            let timeRange;
            
            switch (timeFilter) {
                case '1h':
                    timeRange = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case '3h':
                    timeRange = new Date(now.getTime() - 3 * 60 * 60 * 1000);
                    break;
                case '6h':
                    timeRange = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                    break;
                case '12h':
                    timeRange = new Date(now.getTime() - 12 * 60 * 60 * 1000);
                    break;
                case '24h':
                    timeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                default:
                    timeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
            }
            filter.createdAt = { $gte: timeRange };
        }

        // Add business filter
        if (businessFilter) {
            filter.restaurantName = { $regex: businessFilter, $options: 'i' };
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerAddress')
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
        console.error('[orderController.js][getDeliveryPartnerOrders]', error);
        res.status(500).json({ error: 'Failed to get delivery partner orders', message: error.message });
    }
};

// Delivery partner: Update order status
exports.postDeliveryPartnerOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        res.status(200).json(order);
    } catch (error) {
        console.error('[orderController.js][postDeliveryPartnerOrderStatus]', error);
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};

// Delivery partner: Get available orders to accept
exports.getAvailableDeliveryOrders = async (req, res) => {
    try {
        // Check if delivery partner is online and active
        if (!req.deliveryPartner.online || req.deliveryPartner.status !== 'active') {
            return res.status(403).json({ 
                error: 'You must be online and have active status to view available orders' 
            });
        }

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const { timeFilter, businessFilter } = req.query;

        let filter = {
            status: 'ORDER_DELIVERY_READY',
            deliveryPartnerId: { $exists: false }
        };

        // Add time filter
        if (timeFilter) {
            const now = new Date();
            let timeRange;
            
            switch (timeFilter) {
                case '1h':
                    timeRange = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case '3h':
                    timeRange = new Date(now.getTime() - 3 * 60 * 60 * 1000);
                    break;
                case '6h':
                    timeRange = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                    break;
                case '12h':
                    timeRange = new Date(now.getTime() - 12 * 60 * 60 * 1000);
                    break;
                case '24h':
                    timeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                default:
                    timeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
            }
            filter.createdAt = { $gte: timeRange };
        }

        // Add business filter
        if (businessFilter) {
            filter.restaurantName = { $regex: businessFilter, $options: 'i' };
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerAddress')
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
        console.error('[orderController.js][getAvailableDeliveryOrders]', error);
        res.status(500).json({ error: 'Failed to get available delivery orders', message: error.message });
    }
};

// Delivery partner: Accept multiple orders at once
exports.acceptMultipleDeliveryOrders = async (req, res) => {
    try {
        // Check if delivery partner is online and active
        if (!req.deliveryPartner.online || req.deliveryPartner.status !== 'active') {
            return res.status(403).json({ 
                error: 'You must be online and have active status to accept orders' 
            });
        }

        const { orderIds } = req.body;
        
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'Order IDs array is required' });
        }

        // Check if all orders exist and are available
        const orders = await Order.find({
            _id: { $in: orderIds },
            status: 'ORDER_DELIVERY_READY',
            deliveryPartnerId: { $exists: false }
        });

        if (orders.length !== orderIds.length) {
            return res.status(400).json({ 
                error: 'Some orders are not available or already assigned' 
            });
        }

        // Update all orders with delivery partner ID
        const updatedOrders = await Promise.all(
            orders.map(async (order) => {
                order.deliveryPartnerId = req.deliveryPartner._id;
                return await order.save();
            })
        );

        // Emit order status updates to notify restaurant
        const io = req.app.get('io');
        if (io) {
            const populatedOrders = await Order.find({
                _id: { $in: orderIds }
            }).populate('deliveryPartnerId', 'name phone email');
            
            populatedOrders.forEach(order => {
                io.emit('orderStatusUpdate', order);
                io.emit('deliveryPartnerAssigned', order);
            });
        }

        res.status(200).json({
            message: `Successfully accepted ${updatedOrders.length} orders`,
            orders: updatedOrders
        });
    } catch (error) {
        console.error('[orderController.js][acceptMultipleDeliveryOrders]', error);
        res.status(500).json({ error: 'Failed to accept multiple delivery orders', message: error.message });
    }
};

// Delivery partner: Accept an order (assign deliveryPartnerId if not already set)
exports.acceptDeliveryOrder = async (req, res) => {
    try {
        // Check if delivery partner is online and active
        if (!req.deliveryPartner.online || req.deliveryPartner.status !== 'active') {
            return res.status(403).json({ 
                error: 'You must be online and have active status to accept orders' 
            });
        }

        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.deliveryPartnerId) {
            return res.status(400).json({ error: 'Order already assigned to a delivery partner' });
        }
        
        const previousStatus = order.status;
        order.deliveryPartnerId = req.deliveryPartner._id;
        await order.save();

        // Emit order status update to notify restaurant
        const io = req.app.get('io');
        if (io) {
            const updatedOrder = await Order.findById(orderId).populate('deliveryPartnerId', 'name phone email');
            io.emit('orderStatusUpdate', updatedOrder);
            io.emit('deliveryPartnerAssigned', updatedOrder);
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('[orderController.js][acceptDeliveryOrder]', error);
        res.status(500).json({ error: 'Failed to accept delivery order', message: error.message });
    }
};

// Delivery partner: Get completed orders
exports.getCompletedDeliveryPartnerOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        const filter = {
            deliveryPartnerId: req.deliveryPartner._id,
            status: 'ORDER_DELIVERED'
        };

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerAddress')
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
        console.error('[orderController.js][getCompletedDeliveryPartnerOrders]', error);
        res.status(500).json({ error: 'Failed to get completed orders', message: error.message });
    }
};

// Get all unique business names for filtering
exports.getAllBusinessNames = async (req, res) => {
    try {
        const businessNames = await Order.distinct('restaurantName', {
            status: 'ORDER_DELIVERY_READY',
            deliveryPartnerId: { $exists: false }
        });

        // Sort alphabetically
        const sortedBusinessNames = businessNames.sort();

        res.status(200).json({
            businessNames: sortedBusinessNames
        });
    } catch (error) {
        console.error('[orderController.js][getAllBusinessNames]', error);
        res.status(500).json({ error: 'Failed to get business names', message: error.message });
    }
};

// Get business names for delivery partner orders
exports.getDeliveryPartnerBusinessNames = async (req, res) => {
    try {
        const businessNames = await Order.distinct('restaurantName', {
            deliveryPartnerId: req.deliveryPartner._id,
            status: { $in: ['ORDER_DELIVERY_READY', 'OUT_FOR_DELIVERY'] }
        });
        const sortedBusinessNames = businessNames.sort();
        res.status(200).json({
            businessNames: sortedBusinessNames
        });
    } catch (error) {
        console.error('[orderController.js][getDeliveryPartnerBusinessNames]', error);
        res.status(500).json({ error: 'Failed to get business names', message: error.message });
    }
};

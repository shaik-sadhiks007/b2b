const Order = require("../models/orderModel");
const User = require("../models/userModel");
const MenuOfRestaurant = require("../models/Menu");
const CustomerAddress = require("../models/customerAddress");
const Restaurant = require("../models/Restaurant");
const { sendOrderConfirmationEmail, sendStatusChangeEmail } = require('../utils/emailService');

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
            // Find the menu item within categories and subcategories
            const menu = await MenuOfRestaurant.find({ restaurantId });
            if (!menu) {
                return res.status(404).json({ error: "Menu not found for this restaurant" });
            }

            let foundItem = null;
            let foundMenuDoc = null;
            let foundSubcategory = null;

            // Search through all menus
            for (const menuItem of menu) {
                // Search through subcategories of each menu
                for (const subcategory of menuItem.subcategories) {
                    const menuItemFound = subcategory.items.find(i => i._id.toString() === item.itemId);
                    if (menuItemFound) {
                        foundItem = menuItemFound;
                        foundMenuDoc = menuItem;
                        foundSubcategory = subcategory;
                        break;
                    }
                }
                if (foundItem) break; // Break out of menu loop if item is found
            }

            if (!foundItem) {
                return res.status(404).json({ error: `Item ${item.name} not found` });
            }
            if (!foundItem.inStock) {
                return res.status(400).json({ error: `${item.name} is out of stock` });
            }
            if (foundItem.quantity < item.quantity) {
                return res.status(400).json({ error: `Only ${foundItem.quantity} quantity available for ${item.name}` });
            }

            // Push details for later quantity update
            totalOrders.push({
                menuDoc: foundMenuDoc,
                subcategory: foundSubcategory,
                item: foundItem,
                orderQuantity: item.quantity
            });
        }

        // Reduce quantity for each ordered item
        for (const order of totalOrders) {
            // Find the menu document for this restaurant
            const menuDocs = await MenuOfRestaurant.find({ restaurantId });
            for (const menuDoc of menuDocs) {
                let updated = false;
                for (const subcategory of menuDoc.subcategories) {
                    const menuItem = subcategory.items.find(i => i._id.toString() === order.item._id.toString());
                    if (menuItem) {
                        // Reduce the quantity
                        menuItem.quantity = Math.max(0, menuItem.quantity - order.orderQuantity);
                        // Optionally, set inStock to false if quantity is 0
                        if (menuItem.quantity === 0) {
                            menuItem.inStock = false;
                        }
                        updated = true;
                        break;
                    }
                }
                if (updated) {
                    await menuDoc.save();
                    break; // Stop after updating the correct menuDoc
                }
            }
        }

        let customerAddressId;
        let customerName;
        let customerPhone;

        // Handle address logic based on orderType
        if (orderType === 'DELIVERY') {
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
        } else if (orderType === 'PICKUP') {
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
            return res.status(400).json({ error: "Invalid order type. Must be either 'DELIVERY' or 'PICKUP'" });
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
                basePrice: item.basePrice,
                packagingCharges: item.packagingCharges || 0,
                totalPrice: item.totalPrice,
                photos: item.photos || [],
                isVeg: item.isVeg || false
            })),
            totalAmount,
            paymentMethod: paymentMethod || "COD",
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "ORDER_PLACED",
            restaurantId,
            restaurantName,
            orderType: orderType || "DELIVERY",
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
                isVeg: item.isVeg
            })),
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
            status: "INSTORE_ORDER",
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

exports.orderSuccess = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {   
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order placed successfully", order });
    } catch (error) {
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
        res.status(500).json({ error: "Failed to fetch order status", message: error.message });
    }
};  

exports.getOrdersSummary = async (req, res) => {
    try {
        const restaurantId = req.restaurant._id;

        let { startDate, endDate, timeFrame } = req.query;

        let queryStartDate;
        let queryEndDate;

        if (timeFrame) {
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Normalize to start of day for accurate calculations

            if (timeFrame === '1D') {
                queryStartDate = new Date(now);
                queryEndDate = new Date(now);
                queryEndDate.setHours(23, 59, 59, 999);
            } else if (timeFrame === '1W') {
                // Get the first day of the current week (Monday)
                const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday being 0
                queryStartDate = new Date(now.setDate(diffToMonday));
                queryEndDate = new Date(queryStartDate);
                queryEndDate.setDate(queryEndDate.getDate() + 6);
                queryEndDate.setHours(23, 59, 59, 999);
            } else if (timeFrame === '1M') {
                queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            } else if (timeFrame === '3M') {
                queryStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            } else if (timeFrame === '6M') {
                queryStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            }
        } else if (startDate && endDate) {
            queryStartDate = new Date(startDate);
            queryEndDate = new Date(endDate);
            queryEndDate.setHours(23, 59, 59, 999); // Ensure end of day
        } else {
            // Default to current month if no timeframe or explicit dates
            const now = new Date();
            queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
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
        console.error('Error fetching order summary:', error);
        res.status(500).json({ error: 'Failed to fetch order summary', message: error.message });
    }
};  


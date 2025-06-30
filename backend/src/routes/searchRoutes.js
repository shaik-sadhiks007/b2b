const express = require('express');
const router = express.Router();
const Restaurant = require('../models/businessModel.js');
const Menu = require('../models/menuModel.js');
const moment = require('moment-timezone');
const geolib = require('geolib');

router.get('/', async (req, res) => {
    try {
        const { query, type, lat, lng } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        console.log('Search query:', query, 'Type:', type);

        // Get current day and time in IST
        const now = moment().tz('Asia/Kolkata');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.day()];
        const currentTime = now.format('HH:mm');

        if (type === 'products') {
            // First, let's check if there are any menu items at all
            const totalItems = await Menu.countDocuments();
            console.log('Total menu items in database:', totalItems);

            // Search for menu items with the new flat structure
            const menuItems = await Menu.aggregate([
                {
                    $match: {
                        $or: [
                            // Exact match with case insensitivity
                            { name: { $regex: query, $options: 'i' } },
                            { description: { $regex: query, $options: 'i' } },
                            { category: { $regex: query, $options: 'i' } },
                            { subcategory: { $regex: query, $options: 'i' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'businesses', // Changed from 'restaurants' to 'businesses'
                        localField: 'businessId',
                        foreignField: '_id',
                        as: 'restaurant'
                    }
                },
                {
                    $unwind: {
                        path: '$restaurant',
                        preserveNullAndEmptyArrays: true // Keep items even if restaurant lookup fails
                    }
                }
            ]);

            console.log('Found menu items:', menuItems.length);
            if (menuItems.length === 0) {
                console.log('No matches found for query:', query);
                // Let's log a sample menu item to see the structure
                const sampleItem = await Menu.findOne();
                console.log('Sample menu item:', sampleItem);
            }

            const formattedResults = menuItems.map(item => ({
                type: 'product',
                id: item._id,
                name: item.name,
                description: item.description,
                price: item.totalPrice,
                image: item.photos || null,
                foodType: item.foodType,
                category: item.category,
                subcategory: item.subcategory,
                inStock: item.inStock,
                quantity: item.quantity,
                restaurant: item.restaurant ? {
                    id: item.restaurant._id,
                    name: item.restaurant.restaurantName,
                    online: true, // Simplified for debugging
                    distance: null,
                    serviceType: item.restaurant.serviceType
                } : null
            }));

            return res.json({ results: formattedResults });
        } else {
            // Search for restaurants with fuzzy matching
            const restaurants = await Restaurant.aggregate([
                {
                    $match: {
                        $and: [
                            { status: 'published' },
                            {
                                $or: [
                                    // Exact match
                                    { restaurantName: { $regex: query, $options: 'i' } },
                                    { category: { $regex: query, $options: 'i' } },
                                    { 'address.locality': { $regex: query, $options: 'i' } },
                                    { 'address.city': { $regex: query, $options: 'i' } },
                                    { 'address.landmark': { $regex: query, $options: 'i' } },
                                    
                                    // Word boundary match
                                    { restaurantName: { $regex: `\\b${query}\\b`, $options: 'i' } },
                                    { category: { $regex: `\\b${query}\\b`, $options: 'i' } },
                                    { 'address.locality': { $regex: `\\b${query}\\b`, $options: 'i' } },
                                    { 'address.city': { $regex: `\\b${query}\\b`, $options: 'i' } },
                                    
                                    // Contains match
                                    { restaurantName: { $regex: query.split('').join('.*'), $options: 'i' } },
                                    { category: { $regex: query.split('').join('.*'), $options: 'i' } },
                                    { 'address.locality': { $regex: query.split('').join('.*'), $options: 'i' } },
                                    { 'address.city': { $regex: query.split('').join('.*'), $options: 'i' } }
                                ]
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        matchScore: {
                            $add: [
                                // Exact match gets highest score
                                { $cond: [{ $regexMatch: { input: '$restaurantName', regex: new RegExp(`^${query}$`, 'i') } }, 10, 0] },
                                { $cond: [{ $regexMatch: { input: '$category', regex: new RegExp(`^${query}$`, 'i') } }, 8, 0] },
                                { $cond: [{ $regexMatch: { input: '$address.locality', regex: new RegExp(`^${query}$`, 'i') } }, 7, 0] },
                                
                                // Word boundary match gets medium score
                                { $cond: [{ $regexMatch: { input: '$restaurantName', regex: new RegExp(`\\b${query}\\b`, 'i') } }, 6, 0] },
                                { $cond: [{ $regexMatch: { input: '$category', regex: new RegExp(`\\b${query}\\b`, 'i') } }, 4, 0] },
                                { $cond: [{ $regexMatch: { input: '$address.locality', regex: new RegExp(`\\b${query}\\b`, 'i') } }, 3, 0] },
                                
                                // Contains match gets lower score
                                { $cond: [{ $regexMatch: { input: '$restaurantName', regex: new RegExp(query, 'i') } }, 2, 0] },
                                { $cond: [{ $regexMatch: { input: '$category', regex: new RegExp(query, 'i') } }, 1, 0] }
                            ]
                        }
                    }
                },
                {
                    $sort: { matchScore: -1 }
                }
            ]);

            const formattedResults = restaurants.map(restaurant => {
                // Calculate distance if coordinates are available
                let distance = null;
                if (lat && lng && restaurant.location && restaurant.location.lat && restaurant.location.lng) {
                    const distanceInMeters = geolib.getDistance(
                        { latitude: parseFloat(lat), longitude: parseFloat(lng) },
                        { latitude: restaurant.location.lat, longitude: restaurant.location.lng }
                    );
                    distance = distanceInMeters / 1000; // Convert to kilometers
                }

                // Check if restaurant is currently open
                let isOnline = false;
                if (restaurant.operatingHours && restaurant.operatingHours.timeSlots) {
                    const todaySchedule = restaurant.operatingHours.timeSlots[currentDay];
                    if (todaySchedule && todaySchedule.isOpen) {
                        const openTime = todaySchedule.openTime;
                        const closeTime = todaySchedule.closeTime;
                        
                        const currentTimeMoment = moment(currentTime, 'HH:mm');
                        const openTimeMoment = moment(openTime, 'HH:mm');
                        const closeTimeMoment = moment(closeTime, 'HH:mm');

                        isOnline = currentTimeMoment.isBetween(openTimeMoment, closeTimeMoment, null, '[]');
                    }
                }

                return {
                    type: 'business',
                    id: restaurant._id,
                    name: restaurant.restaurantName,
                    category: restaurant.category,
                    serviceType: restaurant.serviceType,
                    address: {
                        fullAddress: restaurant.address.fullAddress,
                        locality: restaurant.address.locality,
                        city: restaurant.address.city,
                        landmark: restaurant.address.landmark
                    },
                    contact: {
                        phone: restaurant.contact.primaryPhone,
                        whatsapp: restaurant.contact.whatsappNumber,
                        email: restaurant.contact.email
                    },
                    operatingHours: {
                        openTime: restaurant.operatingHours.defaultOpenTime,
                        closeTime: restaurant.operatingHours.defaultCloseTime
                    },
                    image: restaurant.images.profileImage,
                    status: restaurant.status,
                    online: isOnline,
                    distance: distance !== null ? parseFloat(distance.toFixed(2)) : null
                };
            });

            // Filter and sort by distance if coordinates are provided
            if (lat && lng) {
                const filteredResults = formattedResults.filter(restaurant =>
                    restaurant.distance !== null && restaurant.distance <= 50
                );
                filteredResults.sort((a, b) => a.distance - b.distance);
                return res.json({ results: filteredResults });
            }

            return res.json({ results: formattedResults });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Error performing search', message: error.message });
    }
});

module.exports = router;

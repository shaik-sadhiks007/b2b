const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const Restaurant = require('../models/Restaurant.js');
const Menu = require('../models/menu.js');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { query, type } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        if (type === 'products') {
            // Search for menu items across all categories and subcategories
            const menuItems = await Menu.aggregate([
                {
                    $unwind: '$subcategories'
                },
                {
                    $unwind: '$subcategories.items'
                },
                {
                    $match: {
                        $or: [
                            // Exact match with case insensitivity
                            { 'subcategories.items.name': { $regex: query, $options: 'i' } },
                            { 'subcategories.items.description': { $regex: query, $options: 'i' } },
                            { 'subcategories.name': { $regex: query, $options: 'i' } },
                            { 'name': { $regex: query, $options: 'i' } },
                            
                            // Partial word match
                            { 'subcategories.items.name': { $regex: `\\b${query}\\b`, $options: 'i' } },
                            { 'subcategories.items.description': { $regex: `\\b${query}\\b`, $options: 'i' } },
                            
                            // Contains match (more flexible)
                            { 'subcategories.items.name': { $regex: query.split('').join('.*'), $options: 'i' } },
                            { 'subcategories.items.description': { $regex: query.split('').join('.*'), $options: 'i' } },
                            { 'subcategories.name': { $regex: query.split('').join('.*'), $options: 'i' } },
                            { 'name': { $regex: query.split('').join('.*'), $options: 'i' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurantId',
                        foreignField: '_id',
                        as: 'restaurant'
                    }
                },
                {
                    $unwind: '$restaurant'
                },
                {
                    $addFields: {
                        matchScore: {
                            $add: [
                                // Exact match gets highest score
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.name', regex: new RegExp(`^${query}$`, 'i') } }, 10, 0] },
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.description', regex: new RegExp(`^${query}$`, 'i') } }, 8, 0] },
                                
                                // Word boundary match gets medium score
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.name', regex: new RegExp(`\\b${query}\\b`, 'i') } }, 6, 0] },
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.description', regex: new RegExp(`\\b${query}\\b`, 'i') } }, 4, 0] },
                                
                                // Contains match gets lower score
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.name', regex: new RegExp(query, 'i') } }, 2, 0] },
                                { $cond: [{ $regexMatch: { input: '$subcategories.items.description', regex: new RegExp(query, 'i') } }, 1, 0] }
                            ]
                        }
                    }
                },
                {
                    $sort: { matchScore: -1 }
                }
            ]);

            const formattedResults = menuItems.map(item => ({
                type: 'product',
                id: item.subcategories.items._id,
                name: item.subcategories.items.name,
                description: item.subcategories.items.description,
                price: item.subcategories.items.totalPrice,
                image: item.subcategories.items.photos[0] || null,
                foodType: item.subcategories.items.foodType,
                isVeg: item.subcategories.items.isVeg,
                category: item.name,
                subcategory: item.subcategories.name,
                restaurant: {
                    id: item.restaurant._id,
                    name: item.restaurant.restaurantName
                }
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

            const formattedResults = restaurants.map(restaurant => ({
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
                status: restaurant.status
            }));

            return res.json({ results: formattedResults });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Error performing search', message: error.message });
    }
});

module.exports = router;

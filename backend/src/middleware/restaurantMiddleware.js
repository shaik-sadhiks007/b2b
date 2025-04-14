const Restaurant = require('../models/Restaurant');

const restaurantMiddleware = async (req, res, next) => {
    try {
        // Get the user ID from the authenticated user
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        // Find the restaurant using the user's ID as the owner
        const restaurant = await Restaurant.findOne({ owner: userId })
            .select('-__v') // Exclude version key
            .populate('owner', 'name email phone');

        if (!restaurant) {
            return res.status(404).json({ 
                success: false,
                message: 'Restaurant not found for this user' 
            });
        }

        // Check if restaurant is published
        if (restaurant.status !== 'published') {
            return res.status(403).json({ 
                success: false,
                message: 'Restaurant is not published yet' 
            });
        }

        // Attach the restaurant to the request object
        req.restaurant = restaurant;
        next();
    } catch (error) {
        console.error('Restaurant middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = restaurantMiddleware; 
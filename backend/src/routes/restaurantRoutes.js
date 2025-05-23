const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const Restaurant = require('../models/Restaurant');
const geolib = require('geolib');
const { uploadBase64ToCloudinary } = require('../config/cloudinary');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 10 * 1024 * 1024, // 10MB limit for field size
        fileSize: 5 * 1024 * 1024,   // 5MB limit for file size
        fields: 10                    // max number of fields
    }
});


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create new restaurant (Step 1)
router.post('/', auth, upload.single('profileImage'), async (req, res) => {
    try {
        // Parse the formData JSON string
        const formDataObj = JSON.parse(req.body.formData || '{}');

        // Extract data directly from the parsed formData without restructuring
        const {
            restaurantName,
            serviceType,
            ownerName,
            contact,
            address,
            location,
            sameAsOwnerPhone,
            whatsappUpdates,
            operatingHours
        } = formDataObj;

        // Upload profile image to Cloudinary if provided
        let profileImageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            profileImageUrl = result.secure_url;
        }

        // Create new restaurant with the exact structure from frontend
        const restaurant = new Restaurant({
            owner: req.user._id,
            restaurantName,
            serviceType,
            ownerName,

            contact: {
                primaryPhone: contact?.primaryPhone || '',
                whatsappNumber: contact?.whatsappNumber || '',
                email: contact?.email || '',
                website: contact?.website || ''
            },
            address,
            location,
            sameAsOwnerPhone,
            whatsappUpdates,
            images: {
                profileImage: profileImageUrl,
                panCardImage: '',
                gstImage: '',
                fssaiImage: ''
            },
            operatingHours: {
                defaultOpenTime: operatingHours?.defaultOpenTime || '',
                defaultCloseTime: operatingHours?.defaultCloseTime || '',
                timeSlots: {
                    monday: { isOpen: operatingHours?.timeSlots?.monday?.isOpen || false, openTime: operatingHours?.timeSlots?.monday?.openTime || '', closeTime: operatingHours?.timeSlots?.monday?.closeTime || '' },
                    tuesday: { isOpen: operatingHours?.timeSlots?.tuesday?.isOpen || false, openTime: operatingHours?.timeSlots?.tuesday?.openTime || '', closeTime: operatingHours?.timeSlots?.tuesday?.closeTime || '' },
                    wednesday: { isOpen: operatingHours?.timeSlots?.wednesday?.isOpen || false, openTime: operatingHours?.timeSlots?.wednesday?.openTime || '', closeTime: operatingHours?.timeSlots?.wednesday?.closeTime || '' },
                    thursday: { isOpen: operatingHours?.timeSlots?.thursday?.isOpen || false, openTime: operatingHours?.timeSlots?.thursday?.openTime || '', closeTime: operatingHours?.timeSlots?.thursday?.closeTime || '' },
                    friday: { isOpen: operatingHours?.timeSlots?.friday?.isOpen || false, openTime: operatingHours?.timeSlots?.friday?.openTime || '', closeTime: operatingHours?.timeSlots?.friday?.closeTime || '' },
                    saturday: { isOpen: operatingHours?.timeSlots?.saturday?.isOpen || false, openTime: operatingHours?.timeSlots?.saturday?.openTime || '', closeTime: operatingHours?.timeSlots?.saturday?.closeTime || '' },
                    sunday: { isOpen: operatingHours?.timeSlots?.sunday?.isOpen || false, openTime: operatingHours?.timeSlots?.sunday?.openTime || '', closeTime: operatingHours?.timeSlots?.sunday?.closeTime || '' }
                }
            },
            panDetails: {
                panNumber: '',
                name: '',
                dateOfBirth: '',
                address: ''
            },
            currentStep: 1,
            status: 'draft'
        });

        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ message: 'Error creating restaurant', error: error.message });
    }
});

// Update restaurant step
router.put('/:id/step/:step', auth, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    { name: 'fssaiImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const step = parseInt(req.params.step);

        // Parse the formData JSON string and use it directly without restructuring
        const formDataObj = JSON.parse(req.body.formData || '{}');
        const updateData = { ...formDataObj };

        // Special handling for contact information
        if (updateData.contact) {
            // Ensure contact object exists
            if (!updateData.contact) {
                updateData.contact = {};
            }

            // Set contact fields from direct properties if they exist
            if (updateData.ownerEmail && !updateData.contact.email) {
                updateData.contact.email = updateData.ownerEmail;
            }

            if (updateData.contact?.primaryPhone && !updateData.contact.primaryPhone) {
                updateData.contact.primaryPhone = updateData.contact?.primaryPhone;
            }

            if (updateData.contact?.whatsappNumber && !updateData.contact.whatsappNumber) {
                updateData.contact.whatsappNumber = updateData.contact?.whatsappNumber;
            }
        }

        // Handle file uploads for step 3
        if (step === 3) {
            // Initialize images object if it doesn't exist
            if (!updateData.images) {
                updateData.images = {};
            }

            // Handle profile image (required)
            if (req.files?.profileImage?.[0]) {
                try {
                    const result = await cloudinary.uploader.upload(req.files.profileImage[0].path);
                    updateData.images.profileImage = result.secure_url;
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (formDataObj.images?.profileImage) {
                try {
                    if (formDataObj.images.profileImage.startsWith('data:image')) {
                        const imageUrl = await uploadBase64ToCloudinary(formDataObj.images.profileImage);
                        if (imageUrl) {
                            updateData.images.profileImage = imageUrl;
                        }
                    } else if (formDataObj.images.profileImage.includes('cloudinary')) {
                        // If it's already a Cloudinary URL, use it directly
                        updateData.images.profileImage = formDataObj.images.profileImage;
                    }
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }

            // Handle optional images
            const optionalImages = ['panCardImage', 'gstImage', 'fssaiImage'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const result = await cloudinary.uploader.upload(req.files[imageType][0].path);
                        updateData.images[imageType] = result.secure_url;
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (formDataObj.images?.[imageType]) {
                    try {
                        if (formDataObj.images[imageType].startsWith('data:image')) {
                            const imageUrl = await uploadBase64ToCloudinary(formDataObj.images[imageType]);
                            if (imageUrl) {
                                updateData.images[imageType] = imageUrl;
                            }
                        } else if (formDataObj.images[imageType].includes('cloudinary')) {
                            // If it's already a Cloudinary URL, use it directly
                            updateData.images[imageType] = formDataObj.images[imageType];
                        }
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }

            // Validate required profile image
            if (!updateData.images.profileImage) {
                return res.status(400).json({ message: 'Profile image is required' });
            }
        }

        // Set the current step
        updateData.currentStep = step;

        // Handle step 4 - Terms and Conditions
        if (step === 4) {
            updateData.termsAccepted = true;
            updateData.status = 'review';
        }

        // Update restaurant with the exact structure from frontend
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(updatedRestaurant);
    } catch (error) {
        console.error('Error updating restaurant step:', error);
        res.status(500).json({ message: 'Error updating restaurant step', error: error.message });
    }
});

// Get all restaurants for the current user
router.get('/my-restaurants', auth, async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ owner: req.user._id });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
    }
});

// Get restaurant profile
router.get('/profile', authMiddleware, restaurantMiddleware, async (req, res) => {
    try {
        // Use the restaurant ID from the authenticated user

        console.log(req.restaurant, "req.restaurant");
        const restaurant = await Restaurant.findById(req.restaurant._id);


        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);

    } catch (error) {
        console.error('Error getting restaurant profile:', error);
        res.status(500).json({ message: 'Error getting restaurant profile', error: error.message });
    }
});

// Update restaurant profile
router.patch('/profile', auth, restaurantMiddleware, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    { name: 'fssaiImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle file uploads
        if (req.files) {
            // Initialize images object if it doesn't exist
            if (!updateData.images) {
                updateData.images = {};
            }

            // Handle profile image
            if (req.files.profileImage?.[0]) {
                try {
                    const result = await cloudinary.uploader.upload(req.files.profileImage[0].path);
                    updateData.images.profileImage = result.secure_url;
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (updateData.images?.profileImage && updateData.images.profileImage.startsWith('data:image')) {
                try {
                    const imageUrl = await uploadBase64ToCloudinary(updateData.images.profileImage);
                    if (imageUrl) {
                        updateData.images.profileImage = imageUrl;
                    }
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }

            // Handle optional images
            const optionalImages = ['panCardImage', 'gstImage', 'fssaiImage'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const result = await cloudinary.uploader.upload(req.files[imageType][0].path);
                        updateData.images[imageType] = result.secure_url;
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (updateData.images?.[imageType] && updateData.images[imageType].startsWith('data:image')) {
                    try {
                        const imageUrl = await uploadBase64ToCloudinary(updateData.images[imageType]);
                        if (imageUrl) {
                            updateData.images[imageType] = imageUrl;
                        }
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }
        }

        // Remove undefined and null values from updateData
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        });

        // Update only the provided fields
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.restaurant._id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                // Only return the updated fields
                select: Object.keys(updateData).join(' ')
            }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error('Error updating restaurant profile:', error);
        res.status(500).json({ message: 'Error updating restaurant profile', error: error.message });
    }
});

// Get all restaurants for a user
router.get('/', auth, async (req, res) => {
    try {
        const restaurants = await Restaurant.find({
            owner: req.user._id
        });

        // Ensure the contact structure is correct for each restaurant
        const formattedRestaurants = restaurants.map(restaurant => {
            const restaurantObj = restaurant.toObject();

            if (!restaurantObj.contact) {
                restaurantObj.contact = {
                    primaryPhone: restaurantObj.contact?.primaryPhone || '',
                    whatsappNumber: restaurantObj.contact?.whatsappNumber || '',
                    email: restaurantObj.contact?.email || '',
                    website: restaurantObj.contact?.website || ''
                };
            }

            return restaurantObj;
        });

        res.json(formattedRestaurants);
    } catch (error) {
        console.error('Error getting restaurants:', error);
        res.status(500).json({ message: 'Error getting restaurants', error: error.message });
    }
});

// Get a specific restaurant
router.get('/', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            // _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
    }
});

// Get restaurant by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure the contact structure is correct
        if (!restaurant.contact) {
            restaurant.contact = {
                primaryPhone: restaurant.contact?.primaryPhone || '',
                whatsappNumber: restaurant.contact?.whatsappNumber || '',
                email: restaurant.contact?.email || '',
                website: restaurant.contact?.website || ''
            };
        }

        res.json(restaurant);
    } catch (error) {
        console.error('Error getting restaurant:', error);
        res.status(500).json({ message: 'Error getting restaurant', error: error.message });
    }
});

// Delete a restaurant
router.delete('/:id', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
    }
});

// Get all restaurants (public route - no auth required)
router.get('/public/all', async (req, res) => {
    try {
        const { lat, lng, category } = req.query;

        // Build query based on filters
        let query = { status: 'published' };

        // Add category filter if provided and not "all"
        if (category && category !== "all") {
            // Search in both serviceType and category fields
            query.$or = [
                { serviceType: category },
                { category: category }
            ];
        }

        // Get all published restaurants
        const restaurants = await Restaurant.find(query)
            .select('restaurantName serviceType images.profileImage description rating location category operatingHours')
            .lean();

        // Get current day and time
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false }); // gets current time in 24h format

        // Format the response to include only necessary fields
        const formattedRestaurants = restaurants.map(restaurant => {
            let distance = null;
            if (lat && lng && restaurant.location && restaurant.location.lat && restaurant.location.lng) {
                // Calculate distance using geolib
                const distanceInMeters = geolib.getDistance(
                    { latitude: parseFloat(lat), longitude: parseFloat(lng) },
                    { latitude: restaurant.location.lat, longitude: restaurant.location.lng }
                );
                // Convert meters to kilometers
                distance = distanceInMeters / 1000;
            }

            // Check if restaurant is currently open
            let isOnline = false;
            if (restaurant.operatingHours && restaurant.operatingHours.timeSlots) {
                const todaySchedule = restaurant.operatingHours.timeSlots[currentDay];
                if (todaySchedule && todaySchedule.isOpen) {
                    const openTime = todaySchedule.openTime;
                    const closeTime = todaySchedule.closeTime;
                    
                    // Convert times to comparable format
                    const currentTimeNum = parseInt(currentTime.replace(':', ''));
                    const openTimeNum = parseInt(openTime.replace(':', ''));
                    const closeTimeNum = parseInt(closeTime.replace(':', ''));

                    isOnline = currentTimeNum >= openTimeNum && currentTimeNum <= closeTimeNum;
                }
            }

            return {
                _id: restaurant._id,
                name: restaurant.restaurantName,
                imageUrl: restaurant.images?.profileImage || null,
                description: restaurant.description || '',
                // rating: restaurant.rating || 5,
                distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
                location: restaurant.location || null,
                serviceType: restaurant.serviceType || '',
                category: restaurant.category || '',
                online: isOnline
            };
        });

        // If coordinates are provided, filter and sort by distance
        if (lat && lng) {
            // Filter restaurants within 50km range
            const filteredRestaurants = formattedRestaurants.filter(restaurant =>
                restaurant.distance !== null && restaurant.distance <= 50
            );

            // Sort by distance
            filteredRestaurants.sort((a, b) => a.distance - b.distance);

            res.json(filteredRestaurants);
        } else {
            res.json(formattedRestaurants);
        }
    } catch (error) {
        console.error('Error getting public restaurants:', error);
        res.status(500).json({ message: 'Error getting restaurants', error: error.message });
    }
});

// Get a specific restaurant's public details
router.get('/public/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            status: 'published'
        }).select('restaurantName images.profileImage description rating location menu operatingHours');

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        let distance = 0;
        // Calculate distance if coordinates are provided
        if (req.query.lat && req.query.lng && restaurant.location && restaurant.location.lat && restaurant.location.lng) {
            // Calculate distance using geolib
            const distanceInMeters = geolib.getDistance(
                { latitude: parseFloat(req.query.lat), longitude: parseFloat(req.query.lng) },
                { latitude: restaurant.location.lat, longitude: restaurant.location.lng }
            );
            // Convert meters to kilometers
            distance = distanceInMeters / 1000;
        }

        // Get current day and time
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false }); // gets current time in 24h format

        // Check if restaurant is currently open
        let isOnline = false;
        if (restaurant.operatingHours && restaurant.operatingHours.timeSlots) {
            const todaySchedule = restaurant.operatingHours.timeSlots[currentDay];
            if (todaySchedule && todaySchedule.isOpen) {
                const openTime = todaySchedule.openTime;
                const closeTime = todaySchedule.closeTime;
                
                // Convert times to comparable format
                const currentTimeNum = parseInt(currentTime.replace(':', ''));
                const openTimeNum = parseInt(openTime.replace(':', ''));
                const closeTimeNum = parseInt(closeTime.replace(':', ''));

                isOnline = currentTimeNum >= openTimeNum && currentTimeNum <= closeTimeNum;
            }
        }

        // Format the response
        const formattedRestaurant = {
            _id: restaurant._id,
            name: restaurant.restaurantName,
            imageUrl: restaurant.images?.profileImage || null,
            description: restaurant.description || '',
            rating: restaurant.rating || 0,
            distance: parseFloat(distance.toFixed(2)),
            location: restaurant.location || '',
            menu: restaurant.menu || [],
            online: isOnline
        };

        res.json(formattedRestaurant);
    } catch (error) {
        console.error('Error getting public restaurant:', error);
        res.status(500).json({ message: 'Error getting restaurant', error: error.message });
    }
});



module.exports = router; 
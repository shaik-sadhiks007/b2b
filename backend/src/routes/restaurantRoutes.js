const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
    { name: 'images.*', maxCount: 10 }
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

        // Handle file uploads
        if (req.files) {
            if (!updateData.images) updateData.images = {};
            
            for (const [key, files] of Object.entries(req.files)) {
                if (files && files.length > 0) {
                    const result = await cloudinary.uploader.upload(files[0].path);
                    if (key === 'profileImage') {
                        updateData.images.profileImage = result.secure_url;
                    } else if (key === 'panCardImage') {
                        updateData.images.panCardImage = result.secure_url;
                    } else if (key.startsWith('images.')) {
                        const imageKey = key.replace('images.', '');
                        updateData.images[imageKey] = result.secure_url;
                    }
                }
            }
        }

        // Handle image URLs passed directly
        if (req.body.imageUrls) {
            if (!updateData.images) updateData.images = {};
            
            Object.entries(req.body.imageUrls).forEach(([key, value]) => {
                updateData.images[key] = value;
            });
        }

        // Set the current step
        updateData.currentStep = step;

        // Handle step 4 - Terms and Conditions
        if (step === 4) {
            updateData.termsAccepted = true;
            updateData.status = 'published';
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
        const restaurants = await Restaurant.find({ status: 'published' })
            .select('restaurantName images.profileImage description rating distance location')
            .lean();

        // Format the response to include only necessary fields
        const formattedRestaurants = restaurants.map(restaurant => ({
            _id: restaurant._id,
            name: restaurant.restaurantName,
            imageUrl: restaurant.images?.profileImage || null,
            description: restaurant.description || '',
            rating: restaurant.rating || 0,
            distance: restaurant.distance || 0,
            location: restaurant.location || ''
        }));

        res.json(formattedRestaurants);
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
        }).select('restaurantName images.profileImage description rating distance location menu');

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Format the response
        const formattedRestaurant = {
            _id: restaurant._id,
            name: restaurant.restaurantName,
            imageUrl: restaurant.images?.profileImage || null,
            description: restaurant.description || '',
            rating: restaurant.rating || 0,
            distance: restaurant.distance || 0,
            location: restaurant.location || '',
            menu: restaurant.menu || []
        };

        res.json(formattedRestaurant);
    } catch (error) {
        console.error('Error getting public restaurant:', error);
        res.status(500).json({ message: 'Error getting restaurant', error: error.message });
    }
});

module.exports = router; 
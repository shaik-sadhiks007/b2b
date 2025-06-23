const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/authMiddleware');
const businessMiddleware = require('../middleware/restaurantMiddleware');
const {
    createBusiness,
    updateBusinessStep,
    getMyBusinesses,
    getBusinessProfile,
    updateBusinessProfile,
    getAllPublicBusinesses,
    getPublicBusinessById
} = require('../controllers/businessController');

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

// Create new business (Step 1)
router.post('/', authMiddleware, upload.single('profileImage'), createBusiness);

// Update business step
router.put('/:id/step/:step', authMiddleware, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    { name: 'fssaiImage', maxCount: 1 }
]), updateBusinessStep);

// Get all businesses for the current user
router.get('/', authMiddleware, getMyBusinesses);

// Get business profile
router.get('/profile', authMiddleware, businessMiddleware, getBusinessProfile);

// Update business profile
router.patch('/profile', authMiddleware, businessMiddleware, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'panCardImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    { name: 'fssaiImage', maxCount: 1 }
]), updateBusinessProfile);


// Get all businesses (public route - no auth required)
router.get('/public/all', getAllPublicBusinesses);

// Get a specific business's public details
router.get('/public/:id', getPublicBusinessById);

module.exports = router; 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload image to Cloudinary
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the type of image from the request body
        const { type } = req.body;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `restaurant/${type || 'misc'}`
        });

        // Return the Cloudinary URL
        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

module.exports = router; 
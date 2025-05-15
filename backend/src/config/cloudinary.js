const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hotel-app',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ],
        resource_type: 'auto'
    }
});

// Create multer upload instance with file size limit
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Helper function to upload base64 image to Cloudinary
const uploadBase64ToCloudinary = async (base64Image) => {
    try {
        // Remove the data:image/jpeg;base64, prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const result = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${base64Data}`,
            {
                folder: 'hotel-app',
                resource_type: 'auto',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }
        );
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error);
        return null;
    }
};

// Helper function to upload multiple base64 images
const uploadMultipleBase64Images = async (base64Images) => {
    if (!base64Images || !base64Images.length) return [];
    
    const uploadPromises = base64Images.map(uploadBase64ToCloudinary);
    return (await Promise.all(uploadPromises)).filter(url => url !== null);
};

module.exports = {
    cloudinary,
    upload,
    storage,
    uploadBase64ToCloudinary,
    uploadMultipleBase64Images
}; 
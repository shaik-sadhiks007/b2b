const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// // Initialize Firebase Admin if not already initialized
// if (!admin.apps.length) {
//     try {
//         const serviceAccount = require('../../serviceAccountKey.json');
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount)
//         });
//     } catch (error) {
//         console.error('Error initializing Firebase Admin:', error);
//         throw new Error('Firebase Admin initialization failed. Please check your service account credentials.');
//     }
// }

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
const register = async (req, res) => {
    try {
        const { username, email, firebaseUid } = req.body;

        // Verify Firebase user and check email verification
        const firebaseUser = await admin.auth().getUser(firebaseUid);
        
        if (!firebaseUser.emailVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify your email first.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            role: 'user',
            firebaseUid 
        });

        const token = generateToken(user);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, firebaseUid } = req.body;
        const user = await User.findOne({ email });

        if (user && user.firebaseUid === firebaseUid) {
            const token = generateToken(user);
            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Google login
const googleLogin = async (req, res) => {
    try {
        const { email, name, firebaseUid } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                username: name,
                email,
                role: 'user',
                firebaseUid
            });
        } else {
            // Update Firebase UID if user exists
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Guest login
const guestLogin = async (req, res) => {
    try {
        const { firebaseUid } = req.body;

        // Verify Firebase user exists
        // const firebaseUser = await admin.auth().getUser(firebaseUid);

        // Check if guest user already exists
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            // Create new guest user
            user = await User.create({
                username: `Guest_${firebaseUid.slice(0, 6)}`,
                email: `guest_${firebaseUid.slice(0, 6)}@gmail.com`,
                role: 'guest',
                firebaseUid
            }); 
        }

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isPhoneVerified) {
            return res.status(400).json({ message: 'Phone number already verified' });
        }

        if (user.phoneOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.phoneOtpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.isPhoneVerified = true;
        user.phoneOtp = undefined;
        user.phoneOtpExpiry = undefined;
        await user.save();

        const token = generateToken(user);
        res.json({ token, message: 'Phone number verified successfully' });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isPhoneVerified) {
            return res.status(400).json({ message: 'Phone number already verified' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.phoneOtp = otp;
        user.phoneOtpExpiry = otpExpiry;
        await user.save();

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        console.log(req.user,"uuser");
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = username || user.username;
            user.email = email || user.email;

            const updatedUser = await user.save();
            const token = generateToken(updatedUser);

            res.json({
                token,
                user: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handle image upload
const uploadImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const imageFile = req.files.image;
        const uploadDir = path.join(__dirname, '../../uploads');

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `${Date.now()}-${imageFile.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Move the file to uploads directory
        await imageFile.mv(filePath);

        // Update user's image URL
        const user = await User.findOne({ email: req.user.email });
        const imageUrl = `/uploads/${fileName}`;
        user.image = imageUrl;
        await user.save();

        res.json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    guestLogin,
    verifyOTP,
    resendOTP,
    getProfile,
    updateProfile,
    uploadImage
};

const express = require('express');
const { register, login, googleLogin, guestLogin, getProfile, updateProfile, logout, transferToken } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/guest-login', guestLogin);
router.post('/logout', logout);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/transfer-token', transferToken);

module.exports = router;

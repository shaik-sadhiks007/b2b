const express = require('express');
const { register, login, googleLogin, getProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;

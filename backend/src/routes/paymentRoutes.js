const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

// Razorpay Orders 
router.post('/order', auth, paymentCtrl.createOrder);

// Signature verify 
router.post('/verify', auth, paymentCtrl.verify);

// Payment 
router.post('/payment-link', auth, paymentCtrl.createPaymentLink);

module.exports = router;

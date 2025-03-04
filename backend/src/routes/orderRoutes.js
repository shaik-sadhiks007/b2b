const express = require('express');
const {
    placeOrder,
    orderHistory,
    orderHistoryByUser
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/place-order',authMiddleware, placeOrder);
router.get("/order-history",authMiddleware,adminMiddleware, orderHistory);
router.get('/order-history/user', authMiddleware, orderHistoryByUser); 

module.exports = router;

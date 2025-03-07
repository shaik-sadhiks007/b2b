const express = require('express');
const {
    placeOrder,
    orderHistory,
    orderHistoryByUser,
    updateOrderStatus,
    orderHistoryByPhone,
    guestplaceOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/place-order',authMiddleware, placeOrder);
router.post('/place-order/guest-login', guestplaceOrder);
router.get("/order-history",authMiddleware,adminMiddleware, orderHistory);
router.get('/order-history/user', authMiddleware, orderHistoryByUser); 
router.get('/phone/:phone', orderHistoryByPhone); 
router.patch('/:orderId', authMiddleware, updateOrderStatus); 


module.exports = router;

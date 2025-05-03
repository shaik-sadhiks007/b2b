const express = require('express');
const {
    placeOrder,
    orderHistory,
    orderHistoryByUser,
    updateOrderStatus,
    instoreOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const router = express.Router();

router.post('/place-order',authMiddleware, placeOrder);
router.get("/order-history/restaurant",authMiddleware,restaurantMiddleware, orderHistory);
router.get('/order-history', authMiddleware, orderHistoryByUser); 
router.patch('/:orderId', authMiddleware, updateOrderStatus); 
router.post('/instore-order', authMiddleware, restaurantMiddleware, instoreOrder);


module.exports = router;

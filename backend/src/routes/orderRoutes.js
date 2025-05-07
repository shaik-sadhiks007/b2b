const express = require('express');
const {
    placeOrder,
    orderHistory,
    orderHistoryByUser,
    updateOrderStatus,
    instoreOrder,
    orderSuccess,
    postRestaurantOrderStatus,
    getRestaurantOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const router = express.Router();

router.post('/place-order',authMiddleware, placeOrder);
router.get("/order-history/restaurant",authMiddleware,restaurantMiddleware, orderHistory);
router.patch('/status/:orderId', authMiddleware, restaurantMiddleware, postRestaurantOrderStatus);
router.get('/order-history', authMiddleware, orderHistoryByUser); 
router.patch('/:orderId', authMiddleware, updateOrderStatus); 
router.post('/instore-order', authMiddleware, restaurantMiddleware, instoreOrder);
router.get('/:orderId', authMiddleware, orderSuccess);
router.get('/status/:status', authMiddleware, restaurantMiddleware, getRestaurantOrderStatus);



module.exports = router;

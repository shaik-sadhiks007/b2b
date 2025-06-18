const express = require('express');
const {
    placeOrder,
    orderHistory,
    orderHistoryByUser,
    updateOrderStatus,
    instoreOrder,
    orderSuccess,
    postRestaurantOrderStatus,
    getRestaurantOrderStatus,
    getRestaurantOrderCounts,
    getAcceptedItemsSummary,
    getOrderDetails,
    getPublicOrderStatus,
    getOrdersSummary
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const router = express.Router();

router.get('/summary', authMiddleware, restaurantMiddleware, getOrdersSummary);
router.get('/accepted-items-summary', authMiddleware, restaurantMiddleware, getAcceptedItemsSummary);
router.get('/counts', authMiddleware, restaurantMiddleware, getRestaurantOrderCounts);
router.post('/place-order',authMiddleware, placeOrder);
router.get("/order-history/restaurant",authMiddleware,restaurantMiddleware, orderHistory);
router.patch('/status/:orderId', authMiddleware, restaurantMiddleware, postRestaurantOrderStatus);
router.get('/order-history', authMiddleware, orderHistoryByUser); 
router.get('/:orderId', authMiddleware, getOrderDetails);
router.patch('/:orderId', authMiddleware, updateOrderStatus); 
router.post('/instore-order', authMiddleware, restaurantMiddleware, instoreOrder);
router.get('/:orderId', authMiddleware, orderSuccess);
router.get('/status/:status', authMiddleware, restaurantMiddleware, getRestaurantOrderStatus);
router.get('/order-status/:orderId', getPublicOrderStatus);

module.exports = router;

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
const { testEmailConfiguration } = require('../utils/emailService');
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

// Test email route
router.post('/test-email', async (req, res) => {
    try {
        const { testEmail } = req.body;
        if (!testEmail) {
            return res.status(400).json({ error: 'Test email is required' });
        }
        
        const result = await testEmailConfiguration(testEmail);
        if (result.success) {
            res.status(200).json({ 
                message: 'Test email sent successfully', 
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send test email', 
                details: result.error 
            });
        }
    } catch (error) {
        console.error('Test email route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

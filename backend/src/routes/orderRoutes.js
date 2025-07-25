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
    getOrdersSummary,
    getOrdersSummaryByAdmin,
    getOrderCountsByAdmin,
    getOrderHistoryByAdmin,
    getRestaurantOrderStatusByAdmin,
    postRestaurantOrderStatusByAdmin,
    getAcceptedItemsSummaryByAdmin,
    postInstoreOrderByAdmin,
    getDeliveryPartnerOrders,
    postDeliveryPartnerOrderStatus,
    getAvailableDeliveryOrders,
    acceptDeliveryOrder,
    getCompletedDeliveryPartnerOrders
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { testEmailConfiguration } = require('../utils/emailService');
const deliveryPartnerMiddleware = require('../middleware/deliveryPartnerMiddleware');
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

// Admin order routes
router.get('/admin/summary', authMiddleware, adminMiddleware, getOrdersSummaryByAdmin);
router.get('/admin/counts', authMiddleware, adminMiddleware, getOrderCountsByAdmin);
router.get('/admin/order-history', authMiddleware, adminMiddleware, getOrderHistoryByAdmin);
// Admin: Get orders by status for a business by ownerId
router.get('/admin/status/:status', authMiddleware, adminMiddleware, getRestaurantOrderStatusByAdmin);
// Admin: Update order status for a business by ownerId
router.patch('/admin/status/:orderId', authMiddleware, adminMiddleware, postRestaurantOrderStatusByAdmin);
// Admin: Get accepted items summary for a business by ownerId
router.get('/admin/accepted-items-summary', authMiddleware, adminMiddleware, getAcceptedItemsSummaryByAdmin);
// Admin: Place in-store order for a business by ownerId
router.post('/admin/instore-order', authMiddleware, adminMiddleware, postInstoreOrderByAdmin);

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


// Delivery partner order routes
router.get('/delivery-partner/orders', authMiddleware, deliveryPartnerMiddleware, getDeliveryPartnerOrders);
router.patch('/delivery-partner/status/:orderId', authMiddleware, deliveryPartnerMiddleware, postDeliveryPartnerOrderStatus);
router.get('/delivery-partner/available-orders', authMiddleware, deliveryPartnerMiddleware, getAvailableDeliveryOrders);
router.patch('/delivery-partner/accept-order/:orderId', authMiddleware, deliveryPartnerMiddleware, acceptDeliveryOrder);
router.get('/delivery-partner/completed-orders', authMiddleware, deliveryPartnerMiddleware, getCompletedDeliveryPartnerOrders);


module.exports = router;

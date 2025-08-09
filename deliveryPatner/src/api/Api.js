import { api } from "./Interceptor";


/**
 * ---- Login and Register ----
 * Method to get all data from the API.
 * 
 * @param {string} url - The endpoint to fetch data from (e.g., "example").
 * @param {Object} [data] - Optional data to send with the request.
 * @returns {Promise<Object|Array|Error>} A single item, an array of items, or an error.
 */


// Login with credentials
export const loginApi = (data) => api.post("/api/auth/login", data);

// Google login
export const googleLoginApi = (data) => api.post("/api/auth/google-login", data);

// Guest login
export const guestLoginApi = (data) => api.post("/api/auth/guest-login", data);

// Logout
export const logoutApi = () => api.post("/api/auth/logout");

// Get profile
export const getProfileApi = () => api.get("/api/auth/profile");



// Get delivery partner profile
export const getDeliveryPartnerProfileApi = () => api.get("/api/delivery-partner/profile");

// Update delivery partner profile
export const updateDeliveryPartnerProfileApi = (data) => api.patch("/api/delivery-partner/profile", data);

// Register
export const registerApi = (data) => api.post("/api/auth/register", data);

// Delivery Partner Registration
export const registerDeliveryPartnerApi = (data) => api.post("/api/delivery-partner/register", data);

// Update Delivery Partner Step
export const updateDeliveryPartnerStepApi = (id, data) => api.patch(`/api/delivery-partner/${id}/step`, data);

// Toggle Delivery Partner Online Status
export const toggleDeliveryPartnerOnlineApi = (id, online) => api.patch(`/api/delivery-partner/online`, { online });

// Get delivery partner orders
export const getDeliveryPartnerOrdersApi = (params = {}) => api.get('/api/orders/delivery-partner/orders', { params });

// Update delivery partner order status
export const updateDeliveryPartnerOrderStatusApi = (orderId, status) => api.patch(`/api/orders/delivery-partner/status/${orderId}`, { status });

// Get available delivery orders for delivery partner
export const getAvailableDeliveryOrdersApi = (params = {}) => api.get('/api/orders/delivery-partner/available-orders', { params });

// Get all business names for filtering
export const getAllBusinessNamesApi = () => api.get('/api/orders/delivery-partner/business-names');

// Get business names for delivery partner orders
export const getDeliveryPartnerBusinessNamesApi = () => api.get('/api/orders/delivery-partner/my-business-names');

// Accept a delivery order (assign deliveryPartnerId)
export const acceptDeliveryOrderApi = (orderId) => api.patch(`/api/orders/delivery-partner/accept-order/${orderId}`);

// Accept multiple delivery orders at once
export const acceptMultipleDeliveryOrdersApi = (orderIds) => api.post('/api/orders/delivery-partner/accept-multiple-orders', { orderIds });

// Get completed orders for delivery partner
export const getCompletedDeliveryPartnerOrdersApi = (params = {}) => api.get('/api/orders/delivery-partner/completed-orders', { params });

// ===== ADMIN APIs =====
// Get all delivery partners (admin only)
export const getAllDeliveryPartnersApi = (params = {}) => api.get('/api/delivery-partner/admin/all', { params });

// Get delivery partner list (admin only, lightweight)
export const getDeliveryPartnerListApi = (params = {}) => api.get('/api/delivery-partner/admin/list', { params });

// Get delivery partner by ID (admin only)
export const getDeliveryPartnerByIdApi = (id) => api.get(`/api/delivery-partner/admin/${id}`);

// Update delivery partner status (admin only)
export const updateDeliveryPartnerStatusApi = (id, status) => api.patch(`/api/delivery-partner/admin/${id}/status`, { status });

// Get delivery partner statistics (admin only)
export const getDeliveryPartnerStatsApi = () => api.get('/api/delivery-partner/admin/stats');

// Admin: Update delivery partner data
export const updateDeliveryPartnerByAdminApi = (id, data) => api.patch(`/api/delivery-partner/admin/${id}`, data);

// Admin: Delivery partner specific order views
export const getOrdersByDeliveryPartnerAdminApi = (partnerId, params = {}) => api.get(`/api/orders/admin/delivery-partner/${partnerId}/orders`, { params });
export const getCompletedOrdersByDeliveryPartnerAdminApi = (partnerId, params = {}) => api.get(`/api/orders/admin/delivery-partner/${partnerId}/completed-orders`, { params });
export const updateOrderStatusByAdminForDPApi = (orderId, status) => api.patch(`/api/orders/admin/delivery-partner/order-status/${orderId}`, { status });
// Admin: Available orders
export const getAvailableOrdersByAdminApi = (params = {}) => api.get('/api/orders/admin/available-orders', { params });
export const assignOrdersByAdminApi = (payload) => api.post('/api/orders/admin/assign-orders', payload);
// Admin: Get all business names
export const getAllBusinessNamesApiForAdmin = () => api.get('/api/orders/admin/business-names');
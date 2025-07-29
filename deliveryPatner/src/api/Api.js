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
export const getDeliveryPartnerOrdersApi = () => api.get('/api/orders/delivery-partner/orders');

// Update delivery partner order status
export const updateDeliveryPartnerOrderStatusApi = (orderId, status) => api.patch(`/api/orders/delivery-partner/status/${orderId}`, { status });

// Get available delivery orders for delivery partner
export const getAvailableDeliveryOrdersApi = () => api.get('/api/orders/delivery-partner/available-orders');

// Accept a delivery order (assign deliveryPartnerId)
export const acceptDeliveryOrderApi = (orderId) => api.patch(`/api/orders/delivery-partner/accept-order/${orderId}`);

// Get completed orders for delivery partner
export const getCompletedDeliveryPartnerOrdersApi = () => api.get('/api/orders/delivery-partner/completed-orders');

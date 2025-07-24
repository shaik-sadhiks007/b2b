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

// Register
export const registerApi = (data) => api.post("/api/auth/register", data);

// Delivery Partner Registration
export const registerDeliveryPartnerApi = (data) => api.post("/api/delivery-partner/register", data);

// Update Delivery Partner Step
export const updateDeliveryPartnerStepApi = (id, data) => api.patch(`/api/delivery-partner/${id}/step`, data);

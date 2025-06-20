import axios from 'axios';
import { API_URL } from '../api/api';

// Configure axios to use cookies
axios.defaults.withCredentials = true;

const restaurantService = {
    // Create new restaurant (Step 1)
    saveRestaurantInfo: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/api/restaurants`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Save restaurant documents (Step 2)
    saveRestaurantDocuments: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/api/restaurants/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all restaurants for the current user
    getMyRestaurants: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/restaurants/my-restaurants`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a specific restaurant
    getRestaurant: async (restaurantId) => {
        try {
            const response = await axios.get(`${API_URL}/api/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a restaurant
    updateRestaurant: async (id, updateData) => {
        try {
            const response = await axios.put(`${API_URL}/api/restaurants/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update restaurant step
    updateStep: async (restaurantId, step, formData) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/restaurants/${restaurantId}/step/${step}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a restaurant
    deleteRestaurant: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/api/restaurants/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload image
    uploadImage: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default restaurantService; 
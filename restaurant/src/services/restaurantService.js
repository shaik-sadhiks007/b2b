import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

const restaurantService = {
    // Create new restaurant (Step 1)
    saveRestaurantInfo: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/restaurants`, formData, {
                headers: {
                    ...getAuthHeader(),
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
            const response = await axios.post(`${API_URL}/restaurants/documents`, formData, {
                headers: {
                    ...getAuthHeader(),
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
            const response = await axios.get(`${API_URL}/restaurants/my-restaurants`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a specific restaurant
    getRestaurant: async (restaurantId) => {
        try {
            const response = await axios.get(`${API_URL}/restaurants/${restaurantId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a restaurant
    updateRestaurant: async (id, updateData) => {
        try {
            const response = await axios.put(`${API_URL}/restaurants/${id}`, updateData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update restaurant step
    updateStep: async (restaurantId, step, formData) => {
        try {
            const response = await axios.put(
                `${API_URL}/restaurants/${restaurantId}/step/${step}`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
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
            const response = await axios.delete(`${API_URL}/restaurants/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload image
    uploadImage: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    ...getAuthHeader(),
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
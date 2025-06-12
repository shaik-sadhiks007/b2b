import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { toast } from 'react-toastify';

// Set axios defaults for all requests
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);

    // Memoize fetchUserData to prevent unnecessary re-renders
    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/auth/profile`);
            
            setUser(response.data);
            
            // Fetch restaurant data for the user
            await fetchRestaurantData();
            
            return true;
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response && error.response.status === 401) {
                setUser(null);
                setRestaurant(null);
            }
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to fetch restaurant data
    const fetchRestaurantData = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/restaurants`);
            
            if (response.data && response.data.length > 0) {
                setRestaurant(response.data[0]);
                return response.data[0];
            } else {
                setRestaurant(null);
                return null;
            }
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            setRestaurant(null);
            return null;
        }
    }, []);

    // Login function
    const login = useCallback(async () => {
        await fetchUserData();
    }, [fetchUserData]);

    // Function to handle restaurant registration click
    const handleRestaurantRegistration = useCallback(() => {
        if (!user) {
            // If no user is logged in, show service selection modal
            return { showServiceModal: true };
        }
        
        if (!restaurant) {
            // If no restaurant exists, show service selection modal
            return { showServiceModal: true };
        }
        
        if (restaurant.status === 'draft') {
            // If restaurant is in draft mode, navigate to add-restaurant
            return { navigate: '/add-restaurant' };
        }
        
        if (restaurant.status === 'published') {
            // If restaurant is published, navigate to dashboard
            return { navigate: '/dashboard' };
        }

        if (restaurant.status === 'review') {
            // If restaurant is published, navigate to dashboard
            return { navigate: '/review' };
        }
        
        // Default case: show service selection modal
        return { showServiceModal: true };
    }, [user, restaurant]);

    // Initial load
    useEffect(() => {
        const initializeAuth = async () => {
            await fetchUserData();
        };

        initializeAuth();
    }, [fetchUserData]);

    const handleLogout = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setUser(null);
            setRestaurant(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('Failed to logout');
        }
    }, []);

    const value = {
        user,
        loading,
        restaurant,
        handleLogout,
        fetchUserData,
        handleRestaurantRegistration,
        fetchRestaurantData,
        login
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
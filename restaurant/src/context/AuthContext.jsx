import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);

    // Memoize fetchUserData to prevent unnecessary re-renders
    const fetchUserData = useCallback(async (authToken) => {
        if (!authToken) {
            setLoading(false);
            return false;
        }
        
        try {
            setLoading(true);
            // console.log('Fetching user data with token:', authToken);
            
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // console.log('User data received:', response.data);
            setUser(response.data);
            
            // Fetch restaurant data for the user
            await fetchRestaurantData(authToken);
            
            return true;
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('transferToken');
                setToken(null);
                setUser(null);
                setRestaurant(null);
            }
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to fetch restaurant data
    const fetchRestaurantData = useCallback(async (authToken) => {
        if (!authToken) return null;
        
        try {
            const response = await axios.get(`${API_URL}/api/restaurants`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
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

    // Function to update token and fetch user data
    const updateToken = useCallback(async (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        await fetchUserData(newToken);
    }, [fetchUserData]);

    // Login function
    const login = useCallback(async (newToken) => {
        await updateToken(newToken);
    }, [updateToken]);

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
        
        // Default case: show service selection modal
        return { showServiceModal: true };
    }, [user, restaurant]);

    // Check for token changes
    useEffect(() => {
        const checkToken = async () => {
            const currentToken = localStorage.getItem('token');
            const transferToken = localStorage.getItem('transferToken');
            
            // If token has changed in localStorage, update our state
            if (currentToken !== token) {
                setToken(currentToken);
            }
            
            // If we have a transfer token, use it
            if (transferToken) {
                localStorage.setItem('token', transferToken);
                localStorage.removeItem('transferToken');
                setToken(transferToken);
                await fetchUserData(transferToken);
            } 
            // If we have a token but no user data, fetch it
            else if (currentToken && !user) {
                await fetchUserData(currentToken);
            }
            // If we have no token, ensure user is null
            else if (!currentToken && user) {
                setUser(null);
                setRestaurant(null);
            }
        };

        checkToken();
    }, [token, user, fetchUserData]);

    // Initial load
    useEffect(() => {
        const initializeAuth = async () => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                await fetchUserData(currentToken);
            } else {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [fetchUserData]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('transferToken');
        setToken(null);
        setUser(null);
        setRestaurant(null);
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
    }, []);

    const value = {
        user,
        loading,
        token,
        restaurant,
        handleLogout,
        fetchUserData,
        updateToken,
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
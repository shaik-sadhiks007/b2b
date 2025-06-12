import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/api";

export const HotelContext = createContext();

const HotelDataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Configure axios defaults
    axios.defaults.withCredentials = true;

    useEffect(() => {
        // Check if user is logged in by making a request to the profile endpoint
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/auth/profile`);
                setUser(response.data);
            } catch (error) {
                console.warn("Not authenticated");
                setUser(null);
            }
        };

        checkAuth();
    }, []);

    // Email/Password login
    const emailPasswordLogin = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email: userData.email,
                firebaseUid: userData.firebaseUid
            });
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Google login
    const googleLogin = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/google-login`, {
                email: userData.email,
                name: userData.name,
                firebaseUid: userData.firebaseUid
            });
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Guest login
    const guestLogin = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/guest-login`, {
                firebaseUid: userData.firebaseUid
            });
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setUser(null);
            navigate('/')
        } catch (error) {
            console.error("Logout error:", error);
            // Even if the API call fails, we should clear the user state
            setUser(null);
        }
    };

    return (
        <HotelContext.Provider value={{
            user,
            setUser,
            emailPasswordLogin,
            googleLogin,
            guestLogin,
            logout
        }}>
            {children}
        </HotelContext.Provider>
    );
};

export default HotelDataProvider;

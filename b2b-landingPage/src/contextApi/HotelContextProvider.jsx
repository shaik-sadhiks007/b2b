import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const HotelContext = createContext();

const HotelDataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { clearCartState } = useCart();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Math.floor(Date.now() / 1000);

                if (decodedToken.exp && decodedToken.exp > currentTime) {
                    setUser(decodedToken);
                } else {
                    console.warn("Token expired, logging out...");
                    logout();
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        clearCartState(); // Clear cart state when logging out
        setUser(null);
        navigate('/');
    };

    return (
        <HotelContext.Provider value={{ user, setUser, logout, login }}>
            {children}
        </HotelContext.Provider>
    );
};

export default HotelDataProvider;

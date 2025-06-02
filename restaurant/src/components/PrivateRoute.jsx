import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { token } = useContext(AuthContext);

    if (!token) {
        // Redirect to login if there's no token
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child components
    return children;
};

export default PrivateRoute; 
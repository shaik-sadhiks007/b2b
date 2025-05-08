import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginPopup from './LoginPopup';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    console.log(showLoginPopup, "showLoginPopup");

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleGuestContinue = () => {
        setShowLoginPopup(false);
        navigate('/guest-login');
        // You can add any guest-specific logic here
    };

    const handleClosePopup = () => {
        setShowLoginPopup(false);
        navigate('/');
    }

    // If not authenticated and popup is shown, display the popup
    if (!isAuthenticated && showLoginPopup) {
        return (
            <>
                {/* <Navigate to="/" replace /> */}
                <LoginPopup
                    isOpen={true}
                    onClose={handleClosePopup}
                    onGuestContinue={handleGuestContinue}
                />
            </>
        );
    }

    // If not authenticated and popup is closed, redirect to home
    // if (!isAuthenticated && !showLoginPopup) {
    //     return <Navigate to="/" replace />;
    // }

    // If authenticated, show the protected content
    return children;
};

export default ProtectedRoute; 
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPopup from './LoginPopup';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { HotelContext } from '../contextApi/HotelContextProvider';

const ProtectedRoute = ({ children }) => {
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isInitialized } = useContext(HotelContext);

    useEffect(() => {
        // Only show login popup if user context is initialized and user is not logged in
        if (isInitialized) {
            setIsLoading(false);
            if (!user) {
                setShowLoginPopup(true);
            }
        }
    }, [user, isInitialized]);

    const handleGuestContinue = () => {
        setShowLoginPopup(false);
        navigate('/guest-login');
    };

    const handleClosePopup = () => {
        setShowLoginPopup(false);
        navigate('/');
    }

    // Show loading state while checking authentication
    if (isLoading || !isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 mt-16">
                    <Skeleton height={32} width={200} className="mb-8" />
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <Skeleton height={24} width={300} className="mb-4" />
                        <div className="space-y-4">
                            <Skeleton height={100} count={3} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated and popup is shown, display the popup
    if (!user && showLoginPopup) {
        return (
            <>
                <LoginPopup
                    isOpen={true}
                    onClose={handleClosePopup}
                    onGuestContinue={handleGuestContinue}
                />
            </>
        );
    }

    // If authenticated, show the protected content
    return children;
};

export default ProtectedRoute; 
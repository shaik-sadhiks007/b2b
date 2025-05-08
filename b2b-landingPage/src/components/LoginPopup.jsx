import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const LoginPopup = ({ isOpen, onClose, onGuestContinue }) => {
    const navigate = useNavigate();

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleLoginClick = () => {
        onClose();
        navigate('/login');

        console.log("login clicked");
    };

    const handleRegisterClick = () => {
        onClose();
        navigate('/register');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleOutsideClick}
        >
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-center mb-8">Login Required</h2>

                <div className="space-y-4">
                    <button
                        onClick={handleLoginClick}
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Login
                    </button>

                    <button
                        onClick={handleRegisterClick}
                        className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Register
                    </button>

                    <button
                        onClick={onGuestContinue}
                        className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Continue as Guest
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/forgot-password"
                        onClick={onClose}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPopup; 
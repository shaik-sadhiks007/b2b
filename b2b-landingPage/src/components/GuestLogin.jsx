import { signInAnonymously } from "firebase/auth";
import { auth } from "../firebase/FIrebase";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';

const GuestLogin = () => {
    const navigate = useNavigate();
    const { guestLogin } = useContext(HotelContext);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGuestLogin = async () => {
        try {
            setLoading(true);
            setError("");
            // Sign in anonymously with Firebase
            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;

            // Create a guest user in your backend
            await guestLogin({
                firebaseUid: user.uid
            });
            
            toast.success("Guest login successful!");
            navigate('/');
        } catch (error) {
            console.error('Guest login error:', error);
            setError(error.message || "Guest login failed!");
            toast.error("Guest login failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-8">Continue as Guest</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                
                <div className="space-y-6">
                    <p className="text-gray-600 text-center">
                        Continue without creating an account. You can always sign up later.
                    </p>

                    <button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        ) : (
                            <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="Guest" className="w-6 h-6" />
                        )}
                        {loading ? "Continuing..." : "Continue as Guest"}
                    </button>

                    <div className="mt-6 flex items-center justify-between">
                        <Link to="/" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
                            Go to Home
                        </Link>
                        <Link to="/login" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestLogin;

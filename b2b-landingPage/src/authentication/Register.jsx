import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, createUserWithEmailAndPassword, sendEmailVerification } from "../firebase/FIrebase";

const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // First, create the user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Send email verification
            await sendEmailVerification(user);

            // Store user data temporarily
            localStorage.setItem('pendingUser', JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firebaseUid: user.uid
            }));

            setShowOtpVerification(true);
        } catch (error) {
            console.error("Registration failed:", error);
            setError(error.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user found");
            }

            // Check if email is verified
            await user.reload();
            if (!user.emailVerified) {
                throw new Error("Please verify your email first");
            }

            // Get the pending user data
            const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
            if (!pendingUser) {
                throw new Error("Registration data not found");
            }

            // Register the user in your backend
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                username: pendingUser.username,
                email: pendingUser.email,
                password: pendingUser.password,
                firebaseUid: pendingUser.firebaseUid
            });

            if (response.data.token) {
                // Clear pending user data
                localStorage.removeItem('pendingUser');
                alert("Registration Successful! Please log in.");
                navigate('/login');
            } else {
                throw new Error("Registration failed - no token received");
            }
        } catch (error) {
            console.error("Verification failed:", error);
            setError(error.response?.data?.message || error.message || "Verification failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user found");
            }
            await sendEmailVerification(user);
            alert("Verification email resent successfully!");
        } catch (error) {
            setError(error.message || "Failed to resend verification email");
        }
    };

    if (showOtpVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-center mb-8">Verify Email</h2>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                    <p className="text-center text-gray-700 mb-6">
                        Please check your email for verification link.
                        Click the link to verify your email.
                    </p>
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <button 
                            type="submit" 
                            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                        <button 
                            type="button" 
                            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleResendOtp}
                            disabled={loading}
                        >
                            Resend Verification Email
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-8">Register</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                            Username
                        </label>
                        <input 
                            type="text" 
                            name="username" 
                            id="username"
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                            Email
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                            Password
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                    <Link to="/" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
                        Go to Home
                    </Link>
                    <Link to="/login" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, createUserWithEmailAndPassword, sendEmailVerification } from "../firebase/FIrebase";
import { onAuthStateChanged, reload } from "firebase/auth";
import { API_URL } from "../api/api";
import { toast } from 'react-toastify'

const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [showVerification, setShowVerification] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && showVerification) {
                // Reload user to get latest email verification status
                await reload(user);
                if (user.emailVerified) {
                    try {
                        // Store user data in backend after email verification
                        const response = await axios.post(`${API_URL}/api/auth/register`, {
                            username: formData.username,
                            email: formData.email,
                            firebaseUid: user.uid
                        });

                        if (response.status === 201) {
                            toast.success("Registration Successful!");
                            navigate('/login');
                        } else {
                            throw new Error("Registration failed");
                        }
                    } catch (error) {
                        console.error("Registration failed:", error);
                        setError("user regsitered already please login!");
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [showVerification, formData, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Send email verification
            await sendEmailVerification(user);
            setVerificationSent(true);
            setShowVerification(true);

        } catch (error) {
            console.error("Registration failed:", error);
            setError(error.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setVerifying(true);
        setError("");
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user found. Please try logging in again.");
            }

            // Reload user to get latest email verification status
            await reload(user);

            if (user.emailVerified) {
                try {
                    // Store user data in backend after email verification
                    const response = await axios.post(`${API_URL}/api/auth/register`, {
                        username: formData.username,
                        email: formData.email,
                        firebaseUid: user.uid
                    });

                    if (response.status === 201) {
                        toast.success("Registration Successful!");
                        navigate('/login');
                    } else {
                        throw new Error("Registration failed");
                    }
                } catch (error) {
                    console.error("Registration failed:", error);
                    setError("user regsitered already please login!");
                }
            } else {
                setError("Email not verified yet. Please check your inbox and click the verification link.");
            }
        } catch (error) {
            console.error("Verification check failed:", error);
            setError(error.message || "Failed to verify email");
        } finally {
            setVerifying(false);
        }
    };

    const handleResendVerification = async () => {
        setResending(true);
        setError("");
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user found. Please try logging in again.");
            }

            await sendEmailVerification(user);
            alert("Verification email resent! Please check your inbox.");
        } catch (error) {
            console.error("Failed to resend verification email:", error);
            setError(error.message || "Failed to resend verification email");
        } finally {
            setResending(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-center mb-8">Verify Your Email</h2>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-4">
                            We've sent a verification email to {formData.email}. Please check your inbox and click the verification link.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleVerifyEmail}
                            disabled={verifying}
                            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {verifying ? "Verifying..." : "Verify Email"}
                        </button>
                        <button
                            onClick={handleResendVerification}
                            disabled={resending}
                            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {resending ? "Sending..." : "Resend Verification Email"}
                        </button>
                    </div>
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
                            Back to Login
                        </Link>
                    </div>
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
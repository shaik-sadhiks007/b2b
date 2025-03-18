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
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4 shadow" style={{ width: "350px", background: "white", border: "1px solid black" }}>
                    <h2 className="text-center mb-4" style={{ color: "black" }}>Verify Email</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <p className="text-center mb-3">
                        Please check your email for verification link.
                        Click the link to verify your email.
                    </p>
                    <form onSubmit={handleOtpSubmit}>
                        <button 
                            type="submit" 
                            className="btn btn-dark w-100 mb-2"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-outline-dark w-100"
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
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: "350px", background: "white", border: "1px solid black" }}>
                <h2 className="text-center mb-4" style={{ color: "black" }}>Register</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            className="form-control" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-control" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-control" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-dark w-100"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="d-flex justify-content-between mt-3">
                    <Link to='/' className='text-dark'>Go to Home</Link>
                    <Link to='/login' className='text-dark'>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

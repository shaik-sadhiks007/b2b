import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from "../firebase/FIrebase";

const Login = () => {
  const { login } = useContext(HotelContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sign in with Firebase
      
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Get user data from backend
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: user.email,
        firebaseUid: user.uid
      });

      if (response.data && response.data.token) {
        login(response.data.token);
        navigate('/');
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || "Login failed!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await axios.post("http://localhost:5000/api/auth/google-login", {
        email: user.email,
        name: user.displayName,
        firebaseUid: user.uid
      });

      if (response.data && response.data.token) {
        login(response.data.token);
        navigate('/');
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || "Google Login failed!");
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
      setError("");
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || "Failed to send password reset email");
      setSuccessMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </button>

          <Link
            to="/guest-login"
            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="Guest" className="w-6 h-6" />
            Continue as Guest
          </Link>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <Link to="/" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Go to Home
          </Link>
          <Link to="/register" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

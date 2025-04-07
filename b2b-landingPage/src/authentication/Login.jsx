import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { auth, googleProvider, signInWithPopup } from "../firebase/FIrebase";

const Login = () => {
  const { login } = useContext(HotelContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password
      });

      // Check if token exists and is a string
      if (response.data && response.data.token && typeof response.data.token === 'string') {
        login(response.data.token);
        navigate('/');
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || "Login failed!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await axios.post("http://localhost:5000/api/auth/google-login", {
        email: user.email,
        name: user.displayName,
      });

      // Check if token exists and is a string
      if (response.data && response.data.token && typeof response.data.token === 'string') {
        login(response.data.token);
        navigate('/');
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.response?.data?.message || error.message || "Google Login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
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

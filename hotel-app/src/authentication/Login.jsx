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
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "350px", background: "white", border: "1px solid black" }}>
        <h2 className="text-center mb-4" style={{ color: "black" }}>Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "black" }}>Email</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "black" }}>Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-dark w-100">Login</button>
        </form>
        
        {/* Google Sign-In Button */}
        <button onClick={handleGoogleLogin} className="btn btn-light w-100 mt-3 d-flex align-items-center justify-content-center">
          <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google Icon" width="20" className="me-2" />
          Sign in with Google
        </button>

        <div className="d-flex justify-content-between mt-3">
          <Link to='/' className='text-dark'>Go to Home</Link>
          <Link to='/register' className='text-dark'>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { HotelContext } from "../contextApi/HotelContextProvider";

const Login = () => {

  const { login } = useContext(HotelContext);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);

      login(response.data.token);

      navigate('/')

    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Login failed!");
    }

    setFormData({ email: "", password: "" })



  };


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "350px", background: "white", border: "1px solid black" }}>
        <h2 className="text-center mb-4" style={{ color: "black" }}>Login</h2>
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
        <div className="d-flex justify-content-between">
          <Link to='/' className='mt-2 text-end'> Go to Home</Link>
          <Link to='/register' className='mt-2 text-end'> Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
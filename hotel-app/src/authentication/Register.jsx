import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", formData);

            alert("Registration Successful! Please log in.");
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Registration failed!");
        }

        navigate('/login')

        setFormData({ username: "", email: "", password: "" })


    };


    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: "350px", background: "white", border: "1px solid black" }}>
                <h2 className="text-center mb-4" style={{ color: "black" }}>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Username</label>
                        <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Email</label>
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" style={{ color: "black" }}>Password</label>
                        <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Register</button>
                </form>

                <div className="d-flex justify-content-between">
                    <Link to='/' className='mt-2 text-end'> Go to Home</Link>
                    <Link to='/login' className='mt-2 text-end'> Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register

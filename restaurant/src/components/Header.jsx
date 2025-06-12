import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, loading, handleLogout, token } = useContext(AuthContext);
    // const [isScrolled, setIsScrolled] = useState(false);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (window.scrollY > 50) {
    //             setIsScrolled(false);
    //         } else {
    //             setIsScrolled(false);
    //         }
    //     };

    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, []);

    return (
        <nav
            className= "navbar navbar-expand-lg fixed-top bg-white shadow-sm"
            style={{ transition: 'all 0.3s ease-in-out' }}
        >
            <div className="container">
                <Link className= "navbar-brand fw-bold text-dark" to="/">
                    <img src="https://res.cloudinary.com/dcd6oz2pi/image/upload/f_auto,q_auto/v1/logo/xwdu2f0zjbsscuo0q2kq" alt="logo" width='40px'/>
                </Link>
                <div className="ms-auto">
                    {loading ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : user ? (
                        <div className="d-flex align-items-center gap-3">
                            <span className='text-dark'>
                                Welcome, {user.username || user.email}
                            </span>
                            <button
                                className= "btn btn-outline-danger"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <button className= "btn btn-outline-primary">
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
           
        </nav>
    );
};

export default Header; 
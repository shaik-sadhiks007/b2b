import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, loading, handleLogout, token } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}
            style={{ transition: 'all 0.3s ease-in-out' }}
        >
            <div className="container">
                <Link className={`navbar-brand fw-bold ${isScrolled ? 'text-dark' : 'text-white'}`} to="/">B2B</Link>
                <div className="ms-auto">
                    {loading ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : user ? (
                        <div className="d-flex align-items-center gap-3">
                            <span className={`${isScrolled ? 'text-dark' : 'text-white'}`}>
                                Welcome, {user.username || user.email}
                            </span>
                            <button 
                                className={`btn ${isScrolled ? 'btn-outline-danger' : 'btn-outline-light'}`}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <button className={`btn ${isScrolled ? 'btn-outline-primary' : 'btn-outline-light'}`}>
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
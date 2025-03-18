import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotelContext } from "../contextApi/HotelContextProvider";

function Navbar() {
    const { user, logout } = useContext(HotelContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
        logout();
        setShowDropdown(false);
    }

    const handleProfile = () => {
        navigate('/profile');
        setShowDropdown(false);
    }

    const handleNavigation = (path) => {
        navigate(path);
        setShowDropdown(false);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">Hotel Logo</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-3">
                        <li className="nav-item"><Link className="nav-link text-black" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/">About</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/">Contact</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/cart">Cart</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/order-history">Orders</Link></li>

                        {user?.role ? (
                            <li className="nav-item profile-dropdown position-relative">
                                <button
                                    className="btn d-flex align-items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDropdown(!showDropdown);
                                    }}
                                >
                                    <img 
                                        src={user?.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png'} 
                                        alt="Profile" 
                                        className="rounded-circle me-2"
                                        style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                                    />
                                    Profile
                                </button>
                                {showDropdown && (
                                    <div className="position-absolute top-100 end-0 mt-1 bg-white border rounded shadow-sm" style={{ minWidth: "200px", zIndex: 1000 }}>
                                        <button
                                            className="btn btn-link text-dark text-decoration-none d-block w-100 text-start px-3 py-2"
                                            onClick={handleProfile}
                                        >
                                            <i className="bi bi-person me-2"></i>Profile
                                        </button>
                                        
                                        {user.role === "admin" && (
                                            <>
                                                <hr className="my-1" />
                                                <div className="px-3 py-1">
                                                    <small className="text-muted">Admin Controls</small>
                                                </div>
                                                <button
                                                    className="btn btn-link text-dark text-decoration-none d-block w-100 text-start px-3 py-2"
                                                    onClick={() => handleNavigation('/admin')}
                                                >
                                                    <i className="bi bi-list-check me-2"></i>Menu Items
                                                </button>
                                                <button
                                                    className="btn btn-link text-dark text-decoration-none d-block w-100 text-start px-3 py-2"
                                                    onClick={() => handleNavigation('/address-management')}
                                                >
                                                    <i className="bi bi-geo-alt me-2"></i>Address
                                                </button>
                                                <button
                                                    className="btn btn-link text-dark text-decoration-none d-block w-100 text-start px-3 py-2"
                                                    onClick={() => handleNavigation('/menu-templates')}
                                                >
                                                    <i className="bi bi-card-list me-2"></i>Menu Templates
                                                </button>
                                            </>
                                        )}
                                        
                                        <hr className="my-1" />
                                        <button
                                            className="btn btn-link text-dark text-decoration-none d-block w-100 text-start px-3 py-2"
                                            onClick={handleLogout}
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>Logout
                                        </button>
                                    </div>
                                )}
                            </li>
                        ) : (
                            <li className="nav-item"><Link className="nav-link text-black" to="/login">Login</Link></li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

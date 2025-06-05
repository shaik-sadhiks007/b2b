import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileMenuContext } from '../context/MobileMenuContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const [isOnline, setIsOnline] = useState(false);
    const { user, handleLogout } = useContext(AuthContext);
    const { setIsMobileMenuOpen } = useContext(MobileMenuContext);
    const navigate = useNavigate();

    const onStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    return (
        <div className="row position-fixed top-0 w-100 bg-white shadow-sm" style={{ zIndex: 1030 }}>
            <div className="col-md-12 d-flex justify-content-between align-items-center py-2 px-4">
                <div className="d-flex align-items-center">
                    {/* Hamburger menu icon for mobile and tablet */}
                    <button
                        className="btn btn-link text-dark p-0 me-3 d-lg-none"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <div className="d-flex flex-column">
                       <Link  to ="/">
                       <img
                            src="https://res.cloudinary.com/dcd6oz2pi/image/upload/f_auto,q_auto/v1/logo/xwdu2f0zjbsscuo0q2kq"
                            alt="logo"
                            width="40px"
                        />
                        </Link>
                    </div>
                </div>

                {/* Right-aligned section */}
                <div className="d-flex align-items-center gap-4">
                    {/* About Us and Contact Us links - now moved to the right */}
                    <div className="d-none d-md-flex gap-4">
                        <Link className="text-decoration-none text-dark fw-medium" to="/aboutus">
                            About Us
                        </Link>
                        <Link className="text-decoration-none text-dark fw-medium" to="/contactus">
                            Contact Us
                        </Link>
                    </div>

                    {/* User dropdown */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="dropdown">
                            <button
                                className="btn btn-link text-dark p-0 d-flex align-items-center gap-2"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <span className="text-dark">{user?.username || 'User'}</span>
                                <i className="bi bi-person-circle fs-5"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end rounded-3 shadow-sm">
                                <li>
                                    <Link className="dropdown-item rounded-2" to="/profile">
                                        Profile
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-2"
                                        onClick={handleLogoutClick}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
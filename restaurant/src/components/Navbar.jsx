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
                        <span className="fw-bold">B2B</span>
                        {/* <small className="text-muted">restaurant partner</small> */}
                    </div>
                </div>
                <div className="d-flex align-items-center gap-4">
                    {/* <button className="btn btn-link text-dark p-0">
                        <i className="bi bi-bell fs-5"></i>
                    </button>
                    <button className="btn btn-link text-dark p-0">
                        <i className="bi bi-gear fs-5"></i>
                    </button> */}
                    <div className="d-flex align-items-center gap-2">
                        {/* <div className="dropdown">
                            <button
                                className="btn btn-sm dropdown-toggle d-flex align-items-center gap-1"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <span className={`badge rounded-pill ${isOnline ? 'bg-success' : 'bg-danger'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </button>
                            <ul className="dropdown-menu rounded-3 shadow-sm">
                                <li>
                                    <button
                                        className="dropdown-item rounded-2"
                                        onClick={() => onStatusChange('online')}
                                    >
                                        Online
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-2"
                                        onClick={() => onStatusChange('offline')}
                                    >
                                        Offline
                                    </button>
                                </li>
                            </ul>
                        </div> */}
                        <div className="dropdown">
                            <button className="btn btn-link text-dark p-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                <span className="text-dark">{user?.username || 'User'}</span>
                                <i className="bi bi-person-circle fs-5"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end rounded-3 shadow-sm">
                                <li><Link className="dropdown-item rounded-2" to="/profile">Profile</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item rounded-2" onClick={handleLogoutClick}>Logout</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar;

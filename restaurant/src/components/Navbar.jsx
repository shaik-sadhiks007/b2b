import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileMenuContext } from '../context/MobileMenuContext';
import { AuthContext } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../api/api';

const Navbar = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, handleLogout } = useContext(AuthContext);
    const { setIsMobileMenuOpen } = useContext(MobileMenuContext);
    const navigate = useNavigate();
    const socket = io(API_URL, { withCredentials: true });
    const [recentOrders, setRecentOrders] = useState([]);
     useEffect(() => {
        if (!user) return;

        // Listen for new orders
        socket.on('newOrder', (newOrder) => {
            if (newOrder.restaurantId === user.restaurantId) {
                setRecentOrders(prev => {
                    // Prevent duplicates
                    const exists = prev.some(order => order._id === newOrder._id);
                    if (!exists) {
                        // Keep only latest 10
                        return [newOrder, ...prev].slice(0, 10);
                    }
                    return prev;
                });
            }
        });
         // Listen for order status updates
        socket.on('orderStatusUpdate', (updatedOrder) => {
            if (updatedOrder.restaurantId === user.restaurantId) {
                setRecentOrders(prev => {
                    // Remove cancelled orders
                    if (updatedOrder.status === 'CANCELLED') {
                        return prev.filter(order => order._id !== updatedOrder._id);
                    }
                    // Update order if exists
                    return prev.map(order =>
                        order._id === updatedOrder._id ? updatedOrder : order
                    );
                });
            }
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off('newOrder');
            socket.off('orderStatusUpdate');
        };
    }, [user]);
    
    const onStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
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
                        <Link to="/">
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
                    <div className="d-none d-md-flex gap-4 align-items-center">
                        <Link className="text-decoration-none text-dark fw-medium" to="/aboutb2b">
                            About B2B
                        </Link>
                        <Link className="text-decoration-none text-dark fw-medium" to="/contactus">
                            Contact Us
                        </Link>
                        <Link className="text-decoration-none text-dark fw-medium" to="/feedback">
                            Feedback
                        </Link>
                        <div className="position-relative">
                            <button 
                                className="btn btn-link text-dark p-0 position-relative"
                                onClick={toggleNotifications}
                            >
                                <Bell size={20} />
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                    {recentOrders.length}
                                    <span className="visually-hidden">unread notifications</span>
                                </span>
                            </button>
                            
                            {/* Notifications dropdown */}
                            {showNotifications && (
                                <div className="position-absolute end-0 mt-2 bg-white rounded shadow-lg" style={{ width: '300px', zIndex: 1050 }}>
                                    <div className="p-3 border-bottom">
                                        <h6 className="mb-0 fw-bold">Recent Orders</h6>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {recentOrders.length > 0 ? (
                                            recentOrders.map(order => (
                                                <Link 
                                                    key={order._id} 
                                                    to = "/orders" 
                                                    className="d-block p-3 border-bottom text-decoration-none text-dark hover-bg-light"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    <div className="d-flex justify-content-between">
                                                        <span className="fw-medium">{order.product}</span>
                                                        <small className="text-muted">{order.date}</small>
                                                    </div>
                                                    <div className="text-muted small">Status: {order.status}</div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-muted">
                                                No recent orders
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-top text-center">
                                        <Link 
                                            to="/orders" 
                                            className="text-primary small text-decoration-none"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            View all orders
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
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
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileMenuContext } from '../context/MobileMenuContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useOutletContext } from 'react-router-dom';

const Navbar = () => {
    const outletContext = useOutletContext();
    const {business} = outletContext || {}
    const [isOnline, setIsOnline] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, handleLogout } = useContext(AuthContext);
    const { setIsMobileMenuOpen } = useContext(MobileMenuContext);
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const notificationsRef = useRef(null);
    const socketRef = useRef(null);
    
    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        // Initialize socket connection
        socketRef.current = io(API_URL, { withCredentials: true });

        // Connection logging
        socketRef.current.on('connect', () => {
            console.log('Navbar socket connected:', socketRef.current.id);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Navbar socket connection error:', error);
        });

        // Listen for new orders
        socketRef.current.on('newOrder', (newOrder) => {
            if (newOrder.restaurantId === user.restaurantId) {
                setRecentOrders(prev => {
                    const exists = prev.some(order => order._id === newOrder._id);
                    if (!exists) {
                        const orderWithTimestamp = {
                            ...newOrder,
                            notificationTime: new Date().toISOString()
                        };
                        return [orderWithTimestamp, ...prev].slice(0, 10);
                    }
                    return prev;
                });
                
                
                
                // toast.info(
                //     <div className="d-flex align-items-center">
                //         <Bell className="text-primary me-2" size={20} />
                //         <div>
                //             <strong>New Order Received</strong>
                //             <div className="small">#{newOrder._id.slice(-6)}</div>
                //         </div>
                //     </div>,
                //     {
                //         position: "top-right",
                //         autoClose: 5000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         className: 'border-start border-primary border-3'
                //     }
                // );
            }
        });

        // Listen for order status updates (including cancellations)
        socketRef.current.on('orderStatusUpdate', (updatedOrder) => {
            console.log('orderStatusUpdate event received:', updatedOrder);
            if (updatedOrder.restaurantId === user.restaurantId) {
                if (updatedOrder.status === 'CANCELLED') {
                    // Debug: log cancelledBy value
                    console.log('Order cancelledBy:', updatedOrder.cancelledBy);
                    // Only show cancelled notification if cancelled by customer (case-insensitive, fallback to 'customer')
                    if (((updatedOrder.cancelledBy || '').toLowerCase() === 'customer')) {
                         console.log("Customer cancelled the order: ", updatedOrder);
                        const cancelledOrderWithTime = {
                            ...updatedOrder,
                            cancelledAt: new Date().toISOString(),
                            cancelledBy: (updatedOrder.cancelledBy || 'customer')
                        };
                        setCancelledOrders(prev => [cancelledOrderWithTime, ...prev].slice(0, 5));
                        // Show prominent toast notification
                        toast.error(
                            <div className="d-flex align-items-center">
                                <XCircle className="text-danger me-2" size={20} />
                                <div>
                                    <strong>Order Cancelled</strong>
                                    <div className="small">
                                        #{updatedOrder._id.slice(-6)}
                                    </div>
                                </div>
                            </div>,
                            {
                                position: "top-right",
                                autoClose: 8000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                className: 'border-start border-danger border-3'
                            }
                        );
                    }
                    // Remove from recent orders
                    setRecentOrders(prev => prev.filter(order => order._id !== updatedOrder._id));
                    
                  //  playNotificationSound('cancelled');
                } else {
                    // Regular status update
                    setRecentOrders(prev => 
                        prev.map(order => 
                            order._id === updatedOrder._id ? {
                                ...updatedOrder,
                                notificationTime: new Date().toISOString()
                            } : order
                        )
                    );
                }
            }
        });

        // Cleanup listeners on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.off('newOrder');
                socketRef.current.off('orderStatusUpdate');
                socketRef.current.disconnect();
            }
        };
    }, [user]);
    
 
    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const clearAllNotifications = () => {
        setRecentOrders([]);
        setCancelledOrders([]);
        setShowNotifications(false);
    };

    return (
        <div className="row position-fixed top-0 w-100 bg-white shadow-sm" style={{ zIndex: 1030 }}>
            {/* Toast container for notifications */}
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <div className="col-md-12 d-flex justify-content-between align-items-center py-2 px-4">
                {/* Left side - logo and menu */}
                <div className="d-flex align-items-center">
                    {user && user.role !== 'admin' && (
                        <button
                            className="btn btn-link text-dark p-0 me-3 d-lg-none"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>
                    )}
                    {user && user.role === 'admin' && (
                        <button
                            className="btn btn-link text-dark p-0 me-3 d-lg-none"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>
                    )}
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
                        
                        {/* Notifications dropdown */}
                        <div className="position-relative" ref={notificationsRef}>
                            <button 
                                className="btn btn-link text-dark p-0 d-flex align-items-center gap-1 position-relative"
                                onClick={toggleNotifications}
                            >
                                <Bell size={20} />
                                <span className="ms-1">Notifications</span>
                                {(recentOrders.length > 0 || cancelledOrders.length > 0) && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                                        style={{ 
                                            fontSize: '0.65rem',
                                            padding: '0.25em 0.4em'
                                        }}>
                                        {recentOrders.length + cancelledOrders.length}
                                    </span>
                                )}
                            </button>
                            
                            {showNotifications && (
                                <div className="position-absolute end-0 mt-2 bg-white rounded shadow-lg" style={{ width: '350px', zIndex: 1050 }}>
                                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold">Recent Activity</h6>
                                        <button 
                                            className="btn btn-link text-danger p-0 small"
                                            onClick={clearAllNotifications}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {/* Recent Orders */}
                                        {recentOrders.length > 0 && (
                                            <div className="p-2 border-bottom">
                                                <h6 className="small fw-bold text-muted mb-2">NEW ORDERS</h6>
                                                {recentOrders.map(order => (
                                                    <Link 
                                                        key={order._id} 
                                                        to="/orders" 
                                                        className="d-block p-2 rounded-2 text-decoration-none text-dark hover-bg-light"
                                                        onClick={() => setShowNotifications(false)}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span className="fw-medium">Order #{order._id.slice(-6)}</span>
                                                                <div className="small text-muted">{getRelativeTime(order.notificationTime || order.createdAt)}</div>
                                                            </div>
                                                            <span className={`badge ${
                                                                order.status === 'ORDER_PLACED' ? 'bg-primary' :
                                                                order.status === 'ACCEPTED' ? 'bg-warning' :
                                                                order.status === 'ORDER_READY' ? 'bg-info' : 'bg-success'
                                                            }`}>
                                                                {order.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Cancelled Orders */}
                                        {cancelledOrders.length > 0 && (
                                            <div className="p-2">
                                                <h6 className="small fw-bold text-muted mb-2">CANCELLED ORDERS</h6>
                                                {cancelledOrders.map(order => (
                                                    <div 
                                                        key={order._id} 
                                                        className="d-block p-2 rounded-2 text-decoration-none hover-bg-light"
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span className="fw-medium text-danger">Order #{order._id.slice(-6)}</span>
                                                                <div className="small text-muted">
                                                                    Cancelled {getRelativeTime(order.cancelledAt)} by {order.cancelledBy === 'customer' ? 'customer' : 'you'}
                                                                </div>
                                                            </div>
                                                            <XCircle className="text-danger" size={18} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {recentOrders.length === 0 && cancelledOrders.length === 0 && (
                                            <div className="p-3 text-center text-muted">
                                                No recent activity
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

                    {/* Admin: Show restaurant name and category */}
                    {user && user.role === 'admin' && business && (
                        <div className="d-flex flex-column align-items-end me-3">
                            {business.restaurantName && (
                                <span className="fw-bold">{business.restaurantName}</span>
                            )}
                            {business.category && (
                                <span className="text-muted small text-capitalize">{business.category}</span>
                            )}
                        </div>
                    )}

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
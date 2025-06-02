import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { MobileMenuContext } from '../context/MobileMenuContext';

export const menuItems = [
    { icon: "bi-box", label: "Orders", path: "/orders", isNew: false },
    { icon: "bi-list", label: "Menu", path: "/menu", isNew: true },
    { icon: "bi-clock-history", label: "Order history", path: "/order-history" },
    { icon: "bi-cash-coin", label: "InStore billing", path: "/instore-orders" },
    // { icon: "bi-gift", label: "Offers", path: "/offers" },
    // { icon: "bi-wallet2", label: "Payout", path: "/payout" },
    // { icon: "bi-cart4", label: "Hyperpure", path: "/hyperpure" },
    // { icon: "bi-megaphone", label: "Ads", path: "/ads" },
    // { icon: "bi-shop", label: "Outlet info", path: "/outlet-info" },
    // { icon: "bi-exclamation-circle", label: "Customer complaints", path: "/complaints" },
    // { icon: "bi-star", label: "Reviews", path: "/reviews" },
    // { icon: "bi-question-circle", label: "Help centre", path: "/help" }
];

const Sidebar = () => {
    const location = useLocation();
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(MobileMenuContext);

    const handleClose = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Desktop sidebar (only visible on lg and up) */}
            <div className="col-lg-2 bg-white shadow-sm vh-100 position-fixed d-none d-lg-block" style={{ marginTop: '25px', zIndex: 1030 }}>
                <div className="d-flex flex-column h-100">
                    <div className="overflow-auto flex-grow-1 p-2">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="text-decoration-none text-dark"
                                >
                                    <div className={`p-3 d-flex align-items-center rounded-3 mb-1 ${
                                        isActive ? 'bg-blue-50' : ''
                                    }`}>
                                        <i className={`bi ${item.icon} me-3`}></i>
                                        <span className="text-nowrap">{item.label}</span>
                                        {item.isNew && (
                                            <span className="ms-2 badge bg-primary rounded-pill">NEW</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Offcanvas sidebar for mobile and tablet (below lg) */}
            {isMobileMenuOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={handleClose}
                ></div>
            )}
            <div
                className={`d-lg-none position-fixed bg-white shadow-sm ${isMobileMenuOpen ? 'start-0' : 'start-n100'} top-0`}
                style={{
                    zIndex: 1050,
                    width: '280px',
                    height: '100vh',
                    top: 0,
                    left: isMobileMenuOpen ? '0' : '-280px',
                    transition: 'left 0.3s cubic-bezier(.4,0,.2,1)',
                    borderTopRightRadius: '12px',
                    borderBottomRightRadius: '12px',
                }}
            >
                {/* Close button always visible at the top */}
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <span className="fw-bold">Menu</span>
                    <button className="btn btn-link text-dark p-0" onClick={handleClose}>
                        <i className="bi bi-x-lg fs-4"></i>
                    </button>
                </div>
                <div className="d-flex flex-column h-100">
                    <div className="overflow-auto flex-grow-1 p-2">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="text-decoration-none text-dark"
                                    onClick={handleClose}
                                >
                                    <div className={`p-3 d-flex align-items-center hover-bg-light rounded-3 mb-1 ${
                                        isActive ? 'bg-blue-50' : ''
                                    }`}>
                                        <i className={`bi ${item.icon} me-3`}></i>
                                        <span className="text-nowrap">{item.label}</span>
                                        {item.isNew && (
                                            <span className="ms-2 badge bg-primary rounded-pill">NEW</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

Sidebar.propTypes = {
    isOnline: PropTypes.bool,
    onStatusChange: PropTypes.func,
    user: PropTypes.object
};

Sidebar.defaultProps = {
    isOnline: false
};

export default Sidebar; 
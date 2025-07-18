import React, { useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MobileMenuContext } from '../context/MobileMenuContext';

const businessRoute = [
    { icon: 'bi-building', label: 'Business', path: '/business' },
    { icon: 'bi-check-circle-fill', label: 'Feedback', path: '/admin-feedback' }

];

const adminMenuItems = [
    { icon: "bi-person", label: "Profile", path: "profile" },
    {
        icon: "bi-box", label: "Orders", path: "orders",
        children: [
            { label: "Summary", path: "orders/item-summary" },
        ]
    },
    { icon: "bi-list", label: "Menu", path: "menu", isNew: true },
    { icon: "bi-bar-chart", label: "Dashboard", path: "summary" },
    { icon: "bi-cash-coin", label: "InStore billing", path: "instore-orders" },
    { icon: "bi-clock-history", label: "Order history", path: "order-history" },
];

const AdminSidebar = () => {
    const location = useLocation();
    const { ownerId } = useParams();
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(MobileMenuContext);

    // Helper to build admin dashboard route
    const buildPath = (subPath) => `/admin-business-dashboard/${ownerId}/${subPath}`;

    // Only show business route if not inside admin-business-dashboard/:ownerId
    const isInBusinessDashboard = location.pathname.startsWith('/admin-business-dashboard/') && ownerId;

    const renderMenuItem = (item, index) => {
        // Check if current path matches this menu or its children
        const isActive = location.pathname === buildPath(item.path);
        const isParentActive = item.children && (
            location.pathname === buildPath(item.path) ||
            item.children.some(child => location.pathname === buildPath(child.path))
        );

        if (item.children) {
            return (
                <div key={index} className="mb-1">
                    <Link to={buildPath(item.path)} className="text-decoration-none text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className={`p-3 d-flex align-items-center rounded-3 ${isParentActive ? 'fw-bold bg-blue-50' : ''}`}>
                            <i className={`bi ${item.icon} me-3`}></i>
                            <span className="text-nowrap">{item.label}</span>
                            <i className="bi bi-chevron-up ms-auto"></i>
                        </div>
                    </Link>
                    <div className="mt-1">
                        {item.children.map((child, childIndex) => (
                            <Link key={childIndex} to={buildPath(child.path)} className="text-decoration-none text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className={`py-2 d-flex align-items-center rounded-3 mb-1 ${location.pathname === buildPath(child.path) ? 'bg-blue-50' : ''}`} style={{ paddingLeft: '48px' }}>
                                    <span className="text-nowrap">{child.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <Link key={index} to={buildPath(item.path)} className="text-decoration-none text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`p-3 d-flex align-items-center rounded-3 mb-1 ${isActive ? 'bg-blue-50' : ''}`}>
                        <i className={`bi ${item.icon} me-3`}></i>
                        <span className="text-nowrap">{item.label}</span>
                        {item.isNew && (
                            <span className="ms-2 badge bg-primary rounded-pill">NEW</span>
                        )}
                    </div>
                </Link>
            );
        }
    };

    return (
        <>
            {/* Desktop sidebar */}
            <div className="col-lg-2 bg-white shadow-sm vh-100 position-fixed d-none d-lg-block" style={{ marginTop: '25px', zIndex: 1030 }}>
                <div className="d-flex flex-column h-100">
                    <div className="overflow-auto flex-grow-1 p-2">
                        {!isInBusinessDashboard && businessRoute.map((item, index) => (
                            <Link key={index} to={item.path} className="text-decoration-none text-dark">
                                <div className={`p-3 d-flex align-items-center rounded-3 mb-1 ${location.pathname === item.path ? 'bg-blue-50' : ''}`}>
                                    <i className={`bi ${item.icon} me-3`}></i>
                                    <span className="text-nowrap">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                        {isInBusinessDashboard && adminMenuItems.map((item, index) => renderMenuItem(item, index))}
                    </div>
                </div>
            </div>

            {/* Mobile sidebar (offcanvas) */}
            {isMobileMenuOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="bg-white shadow-sm position-absolute"
                        style={{
                            width: '280px',
                            height: '100vh',
                            left: 0,
                            top: 0,
                            zIndex: 1050,
                            borderTopRightRadius: '12px',
                            borderBottomRightRadius: '12px',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                            <span className="fw-bold">Menu</span>
                            <button className="btn btn-link text-dark p-0" onClick={() => setIsMobileMenuOpen(false)}>
                                <i className="bi bi-x-lg fs-4"></i>
                            </button>
                        </div>
                        <div className="overflow-auto flex-grow-1 p-2">
                            {!isInBusinessDashboard && businessRoute.map((item, index) => (
                                <Link key={index} to={item.path} className="text-decoration-none text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className={`p-3 d-flex align-items-center rounded-3 mb-1 ${location.pathname === item.path ? 'bg-blue-50' : ''}`}>
                                        <i className={`bi ${item.icon} me-3`}></i>
                                        <span className="text-nowrap">{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                            {isInBusinessDashboard && adminMenuItems.map((item, index) => renderMenuItem(item, index))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar; 
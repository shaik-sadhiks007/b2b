import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Sidebar = ({ menuItems, logo, subtitle, isOnline, onStatusChange, user }) => {
    return (
        <>
            {/* Top Header */}
            <div className="row position-fixed top-0 w-100 bg-white shadow-sm" style={{ zIndex: 1030 }}>
                <div className="col-md-12 d-flex justify-content-between align-items-center py-2 px-4">
                    <div className="d-flex flex-column">
                        <span className="fw-bold">{logo}</span>
                        <small className="text-muted">{subtitle}</small>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <button className="btn btn-link text-dark p-0">
                            <i className="bi bi-bell fs-5"></i>
                        </button>
                        <button className="btn btn-link text-dark p-0">
                            <i className="bi bi-gear fs-5"></i>
                        </button>
                        <Link to="/feedback" className="text-decoration-none">
                            <span className="text-dark">Share feedback</span>
                        </Link>
                        <div className="d-flex align-items-center gap-2">
                            <div className="dropdown">
                                <button
                                    className="btn btn-sm dropdown-toggle d-flex align-items-center gap-1"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => onStatusChange('online')}
                                        >
                                            Online
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => onStatusChange('offline')}
                                        >
                                            Offline
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="dropdown">
                                <button className="btn btn-link text-dark p-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                    <span className="text-dark">{user?.username || 'User'}</span>
                                    <i className="bi bi-person-circle fs-5"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><a className="dropdown-item" href="#">Profile</a></li>
                                    <li><a className="dropdown-item" href="#">Settings</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" href="#">Logout</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="col-md-2 bg-white shadow-sm vh-100 position-fixed" style={{ marginTop: '60px' }}>
                <div className="d-flex flex-column h-100">
                    <div className="overflow-auto flex-grow-1">
                        {menuItems.map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.path}
                                className="text-decoration-none text-dark"
                            >
                                <div className="p-3 d-flex align-items-center hover-bg-light">
                                    <i className={`bi ${item.icon} me-3`}></i>
                                    <span>{item.label}</span>
                                    {item.isNew && (
                                        <span className="ms-2 badge bg-primary">NEW</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

Sidebar.propTypes = {
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            path: PropTypes.string.isRequired,
            isNew: PropTypes.bool
        })
    ).isRequired,
    logo: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    isOnline: PropTypes.bool,
    onStatusChange: PropTypes.func,
    user: PropTypes.object
};

Sidebar.defaultProps = {
    logo: 'B2B',
    subtitle: 'restaurant partner',
    isOnline: false
};

export default Sidebar; 
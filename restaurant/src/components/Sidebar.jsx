import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Sidebar = ({ menuItems, logo, subtitle }) => {
    return (
        <div className="col-md-2 bg-white shadow-sm vh-100 position-fixed">
            <div className="d-flex flex-column h-100">
                <div className="p-3 border-bottom">
                    <h5 className="mb-0">{logo}</h5>
                    <small className="text-muted">{subtitle}</small>
                </div>
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
    subtitle: PropTypes.string.isRequired
};

Sidebar.defaultProps = {
    logo: 'B2B',
    subtitle: 'restaurant partner'
};

export default Sidebar; 
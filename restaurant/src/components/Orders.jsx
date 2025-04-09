import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Orders = () => {
    const [activeTab, setActiveTab] = useState('preparing');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [isOnline, setIsOnline] = useState(false);

    const handleStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    // Sidebar menu items - matching Dashboard's structure
    const menuItems = [
        { icon: "bi-box", label: "Orders", path: "/orders", isNew: false },
        { icon: "bi-list", label: "Menu", path: "/menu", isNew: true },
        { icon: "bi-clock-history", label: "Order history", path: "/order-history" },
        { icon: "bi-graph-up", label: "Reporting", path: "/reporting" },
        { icon: "bi-gift", label: "Offers", path: "/offers" },
        { icon: "bi-wallet2", label: "Payout", path: "/payout" },
        { icon: "bi-cart4", label: "Hyperpure", path: "/hyperpure" },
        { icon: "bi-megaphone", label: "Ads", path: "/ads" },
        { icon: "bi-shop", label: "Outlet info", path: "/outlet-info" },
        { icon: "bi-exclamation-circle", label: "Customer complaints", path: "/complaints" },
        { icon: "bi-star", label: "Reviews", path: "/reviews" },
        { icon: "bi-question-circle", label: "Help centre", path: "/help" }
    ];

    // Mock data for demonstration
    const orderStatuses = [
        { id: 'preparing', label: 'Preparing', count: 1 },
        { id: 'ready', label: 'Ready', count: 0 },
        { id: 'picked-up', label: 'Picked up', count: 0 }
    ];

    const mockOrder = {
        id: '3127',
        platform: 'ZOMATO - DELIVERY',
        items: [
            { name: 'Crispy Tawa Fried Litti', quantity: 4, price: 716.00, isVeg: true }
        ],
        customer: {
            name: 'Khatri Ravi',
            orderCount: '10th order',
            location: 'TC Paiya, KR Puram (1 km, 7 mins away)',
            placedTime: '47 mins ago'
        },
        totalBill: 644.40,
        isPaid: true,
        isVegOnly: true,
        deliveryAgent: {
            name: 'Chandan',
            otp: '9469',
            status: 'has arrived'
        }
    };

    const mockUser = {
        username: 'Restaurant Name',
        email: 'restaurant@email.com'
    };

    return (
        <div className="container-fluid">
            <Sidebar
                menuItems={menuItems}
                logo="B2B"
                subtitle="restaurant partner"
                isOnline={isOnline}
                onStatusChange={handleStatusChange}
                user={mockUser}
            />

            {/* Main Content */}
            <div className="col-md-10 ms-auto" style={{ marginTop: '60px' }}>
                {/* Top Bar with Status Tabs and Filters */}
                <div className="d-flex justify-content-between align-items-center p-4">
                    <div className="d-flex gap-2">
                        {orderStatuses.map(status => (
                            <button
                                key={status.id}
                                className={`btn ${activeTab === status.id 
                                    ? 'btn-primary text-white' 
                                    : 'btn-outline-secondary'}`}
                                onClick={() => setActiveTab(status.id)}
                            >
                                {status.label} {status.count > 0 && `(${status.count})`}
                            </button>
                        ))}
                    </div>
                    <div className="d-flex gap-3">
                        <select 
                            className="form-select"
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                        >
                            <option>Placed At</option>
                            <option>All Platforms</option>
                            <option>Zomato</option>
                            <option>Swiggy</option>
                        </select>
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by the 4 digit order ID"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Content */}
                <div className="p-4">
                    {/* Order Card */}
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <div className="row">
                                {/* Left Section */}
                                <div className="col-md-4 border-end">
                                    <div className="bg-light bg-opacity-50 text-primary px-3 py-2 mb-3">
                                        {mockOrder.platform}
                                    </div>
                                    <div className="d-flex gap-2 mb-2">
                                        <button className="btn btn-outline-secondary btn-sm">
                                            KOT
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            ORDER
                                        </button>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">ID: {mockOrder.id}</h6>
                                            <button className="btn btn-link text-primary p-0">
                                                Call
                                            </button>
                                        </div>
                                        <div>{mockOrder.customer.name}</div>
                                        <small className="text-muted d-block">{mockOrder.customer.orderCount}</small>
                                        <small className="text-muted d-block">{mockOrder.customer.location}</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>Placed: {mockOrder.customer.placedTime}</div>
                                        <button className="btn btn-link text-primary p-0">
                                            Timeline
                                        </button>
                                    </div>
                                </div>

                                {/* Middle Section */}
                                <div className="col-md-4 border-end">
                                    <div className="alert alert-danger py-2">
                                        <small>
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            Don't send cutlery, tissues and straws
                                        </small>
                                    </div>
                                    <div className="mb-3">
                                        {mockOrder.items.map((item, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <i className={`bi bi-circle-fill ${item.isVeg ? 'text-success' : 'text-danger'} me-2`} style={{ fontSize: '8px' }}></i>
                                                    {item.quantity} x {item.name}
                                                </div>
                                                <div>₹{item.price.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>Total Bill</div>
                                        <div className="d-flex align-items-center gap-2">
                                            ₹{mockOrder.totalBill.toFixed(2)}
                                            <span className="badge bg-success">PAID</span>
                                        </div>
                                    </div>
                                    {mockOrder.isVegOnly && (
                                        <div className="text-success">
                                            <i className="bi bi-circle-fill me-2"></i>
                                            VEG ONLY ORDER
                                        </div>
                                    )}
                                </div>

                                {/* Right Section */}
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="rounded-circle bg-secondary" style={{ width: '48px', height: '48px' }}></div>
                                        <div>
                                            <div>{mockOrder.deliveryAgent.name} {mockOrder.deliveryAgent.status}</div>
                                            <div className="d-flex gap-3">
                                                <button className="btn btn-link text-primary p-0">Call</button>
                                                <div>OTP: {mockOrder.deliveryAgent.otp}</div>
                                            </div>
                                            <button className="btn btn-link text-primary p-0">
                                                <i className="bi bi-geo-alt me-1"></i>
                                                Track location
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-outline-primary">
                                            Need more time
                                        </button>
                                        <button className="btn btn-danger">
                                            Order ready
                                        </button>
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                        <div className="d-flex gap-3">
                                            <button className="btn btn-link text-primary">
                                                <i className="bi bi-headset me-1"></i>
                                                Live order chat support
                                            </button>
                                            <button className="btn btn-link text-primary">
                                                <i className="bi bi-question-circle me-1"></i>
                                                Order help
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders; 
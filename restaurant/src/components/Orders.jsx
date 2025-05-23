import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';

const statusTabs = [
    { id: 'ORDER_PLACED', label: 'Accept' },
    { id: 'ACCEPTED', label: 'Preparing' },
    { id: 'ORDER_READY', label: 'Ready' },
    { id: 'ORDER_PICKED_UP', label: 'Picked up' }
];

const Orders = () => {
    const [activeTab, setActiveTab] = useState('ORDER_PLACED');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/orders/status/${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch orders');
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/orders/status/${orderId}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter(order => order.status === activeTab);

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            {/* Main Content */}
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                {/* Top Bar with Status Tabs */}
                <div className="d-flex justify-content-between align-items-center p-4">
                    <div className="d-flex gap-2">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id 
                                    ? 'btn-primary text-white' 
                                    : 'btn-outline-secondary'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Orders Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-5">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-5">No orders found</div>
                    ) : filteredOrders.map(order => (
                        <div key={order._id} className="card shadow-sm mb-3">
                            <div className="card-body">
                                <div className="row">
                                    {/* Left Section */}
                                    <div className="col-md-4 border-end">
                                        <div className="bg-light bg-opacity-50 text-primary px-3 py-2 mb-3">
                                            {order.platform || 'B2B - DELIVERY'}
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
                                                <h6 className="mb-0">ID: {order._id.slice(-6)}</h6>
                                                <button className="btn btn-link text-primary p-0">
                                                    Call
                                                </button>
                                            </div>
                                            <div>{order.customerName || 'Customer'}</div>
                                            <small className="text-muted d-block">{order.customerPhone || ''}</small>
                                            <small className="text-muted d-block">{order.customerAddress?.street || ''}</small>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
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
                                            {order.items.map((item, index) => (
                                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <i className={`bi bi-circle-fill ${item.isVeg ? 'text-success' : 'text-danger'} me-2`} style={{ fontSize: '8px' }}></i>
                                                        {item.quantity} x {item.name}
                                                    </div>
                                                    <div>₹{item.totalPrice.toFixed ? item.totalPrice.toFixed(2) : item.totalPrice}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>Total Bill</div>
                                            <div className="d-flex align-items-center gap-2">
                                                ₹{order.totalAmount.toFixed ? order.totalAmount.toFixed(2) : order.totalAmount}
                                                <span className="badge bg-success">{order.paymentStatus}</span>
                                            </div>
                                        </div>
                                        {order.items.every(item => item.isVeg) && (
                                            <div className="text-success">
                                                <i className="bi bi-circle-fill me-2"></i>
                                                VEG ONLY ORDER
                                            </div>
                                        )}
                                    </div>
                                    {/* Right Section */}
                                    <div className="col-md-4">
                                        {/* Action Buttons */}
                                        <div className="d-grid gap-2 mb-3">
                                            {activeTab === 'ORDER_PLACED' && (
                                                <>
                                                    <button className="btn btn-primary" onClick={() => handleStatusChange(order._id, 'ACCEPTED')}>Accept</button>
                                                    <button className="btn btn-danger" onClick={() => handleStatusChange(order._id, 'CANCELLED')}>Cancel</button>
                                                </>
                                            )}
                                            {activeTab === 'ACCEPTED' && (
                                                <>
                                                    <button className="btn btn-success" onClick={() => handleStatusChange(order._id, 'ORDER_READY')}>Order Ready</button>
                                                    <button className="btn btn-danger" onClick={() => handleStatusChange(order._id, 'CANCELLED')}>Cancel</button>
                                                </>
                                            )}
                                            {activeTab === 'ORDER_READY' && (
                                                <>
                                                    <button className="btn btn-success" onClick={() => handleStatusChange(order._id, 'ORDER_PICKED_UP')}>Order Completed</button>
                                                    <button className="btn btn-danger" onClick={() => handleStatusChange(order._id, 'CANCELLED')}>Cancel</button>
                                                </>
                                            )}
                                        </div>
                                        {/* No action buttons in Picked up tab */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders; 
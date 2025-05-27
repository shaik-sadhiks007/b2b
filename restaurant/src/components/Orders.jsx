import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';

const statusTabs = [
    { id: 'ORDER_PLACED', label: 'New Orders', icon: 'bi-bell' },
    { id: 'ACCEPTED', label: 'Preparing', icon: 'bi-clock' },
    { id: 'ORDER_READY', label: 'Ready', icon: 'bi-check-circle' },
    { id: 'ORDER_PICKED_UP', label: 'Completed', icon: 'bi-check2-all' }
];

const Orders = () => {
    const [activeTab, setActiveTab] = useState('ORDER_PLACED');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderCounts, setOrderCounts] = useState({});

    useEffect(() => {
        fetchOrders();
        fetchOrderCounts();
    }, [activeTab]);

    const fetchOrderCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/orders/counts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderCounts(response.data);
        } catch (error) {
            console.error('Failed to fetch order counts:', error);
        }
    };

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
            fetchOrderCounts();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }

        return formatDateTime(dateString);
    };

    const getStatusButton = (order) => {
        switch (activeTab) {
            case 'ORDER_PLACED':
                return (
                    <>
                        <button 
                            className="btn btn-success w-100 mb-2" 
                            onClick={() => handleStatusChange(order._id, 'ACCEPTED')}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Accept Order
                        </button>
                        <button 
                            className="btn btn-outline-danger w-100" 
                            onClick={() => handleStatusChange(order._id, 'CANCELLED')}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Order
                        </button>
                    </>
                );
            case 'ACCEPTED':
                return (
                    <>
                        <button 
                            className="btn btn-success w-100 mb-2" 
                            onClick={() => handleStatusChange(order._id, 'ORDER_READY')}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Mark as Ready
                        </button>
                        <button 
                            className="btn btn-outline-danger w-100" 
                            onClick={() => handleStatusChange(order._id, 'CANCELLED')}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Order
                        </button>
                    </>
                );
            case 'ORDER_READY':
                return (
                    <>
                        <button 
                            className="btn btn-success w-100 mb-2" 
                            onClick={() => handleStatusChange(order._id, 'ORDER_PICKED_UP')}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Mark as Completed
                        </button>
                        <button 
                            className="btn btn-outline-danger w-100" 
                            onClick={() => handleStatusChange(order._id, 'CANCELLED')}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Order
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="d-flex justify-content-between align-items-center p-4 bg-white shadow-sm">
                    <div className="d-flex gap-4">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id 
                                    ? 'btn-primary' 
                                    : 'btn-outline-primary'} position-relative d-flex align-items-center gap-2`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                                {orderCounts[tab.id] > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {orderCounts[tab.id]}
                                        <span className="visually-hidden">orders</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <p className="mt-3 text-muted">No orders found</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {orders.map(order => (
                                <div key={order._id} className="col-12">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="row g-4">
                                                <div className="col-md-4 border-end">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <span className="badge bg-primary">
                                                            {order.platform || 'B2B - DELIVERY'}
                                                        </span>
                                                        <div className="text-end">
                                                            <div className="text-muted small">{getRelativeTime(order.createdAt)}</div>
                                                            <div className="text-muted small">{formatDateTime(order.createdAt)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <h6 className="mb-1">Order #{order._id.slice(-6)}</h6>
                                                        <p className="mb-1">{order.customerName || 'Customer'}</p>
                                                        <p className="mb-1 text-muted">
                                                            <i className="bi bi-telephone me-2"></i>
                                                            {order.customerPhone || 'N/A'}
                                                        </p>
                                                        {order.customerAddress?.street && (
                                                            <p className="mb-0 text-muted">
                                                                <i className="bi bi-geo-alt me-2"></i>
                                                                {order.customerAddress.street}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-4 border-end">
                                                    <div className="mb-3">
                                                        {order.items.map((item, index) => (
                                                            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                                                <div>
                                                                    <i className={`bi bi-circle-fill ${item.isVeg ? 'text-success' : 'text-danger'} me-2`} style={{ fontSize: '8px' }}></i>
                                                                    {item.quantity} x {item.name}
                                                                </div>
                                                                <div>{formatCurrency(item.totalPrice)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h6 className="mb-0">Total Amount</h6>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <h6 className="mb-0">{formatCurrency(order.totalAmount)}</h6>
                                                            <span className={`badge ${order.paymentStatus === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {order.items.every(item => item.isVeg) && (
                                                        <div className="text-success mt-2">
                                                            <i className="bi bi-circle-fill me-2"></i>
                                                            VEG ONLY ORDER
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="d-grid gap-2">
                                                        {getStatusButton(order)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders; 
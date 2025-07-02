import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import ConfirmModal from '../reusable/ConfirmModal';

// Initialize socket connection
const socket = io(API_URL, { withCredentials: true });

// Add connection logging
socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
});

const statusTabs = [
    { id: 'ORDER_PLACED', label: 'New Orders', icon: 'bi-bell' },
    { id: 'ACCEPTED', label: 'Accepted', icon: 'bi-clock' },
    { id: 'ORDER_READY', label: 'Ready', icon: 'bi-check-circle' },
    { id: 'ORDER_PICKED_UP', label: 'Completed', icon: 'bi-check2-all' }
];

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('ORDER_PLACED');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderCounts, setOrderCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0
    });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchOrderCounts();

            // Listen for new orders
            socket.on('newOrder', (newOrder) => {
                // console.log('New order received:', newOrder);
                // console.log('Current user:', user);
                if (newOrder.restaurantId === user.restaurantId) {
                    if (activeTab === 'ORDER_PLACED') {
                        setOrders(prevOrders => {
                            // Check if order already exists
                            const exists = prevOrders.some(order => order._id === newOrder._id);
                            if (!exists) {
                                return [newOrder, ...prevOrders];
                            }
                            return prevOrders;
                        });
                    }
                    fetchOrderCounts();
                    toast.info('New order received!');
                }
            });

            // Listen for order status updates
            socket.on('orderStatusUpdate', (updatedOrder) => {
                console.log('Order status update received in Orders component:', updatedOrder);
                console.log('Current user restaurantId:', user?.restaurantId);
                
                // Ensure we have valid data
                if (!updatedOrder || !updatedOrder.restaurantId) {
                    console.error('Invalid order data received:', updatedOrder);
                    return;
                }

                if (updatedOrder.restaurantId === user?.restaurantId) {
                    console.log('Updating orders for restaurant:', user.restaurantId);
                    setOrders(prevOrders => {
                        // If the order is cancelled, remove it from all tabs
                        if (updatedOrder.status === 'CANCELLED') {
                            console.log('Removing cancelled order:', updatedOrder._id);
                            const filteredOrders = prevOrders.filter(order => order._id !== updatedOrder._id);
                            console.log('Orders after removal:', filteredOrders);
                            return filteredOrders;
                        }
                        // For other status updates, update the order if it exists in current tab
                        const updatedOrders = prevOrders.map(order => 
                            order._id === updatedOrder._id ? updatedOrder : order
                        );
                        const filteredOrders = updatedOrders.filter(order => order.status === activeTab);
                        console.log('Updated orders:', filteredOrders);
                        return filteredOrders;
                    });
                    fetchOrderCounts();
                } else {
                    console.log('Order update ignored - different restaurant. Received:', updatedOrder.restaurantId, 'Current:', user?.restaurantId);
                }
            });

            return () => {
                socket.off('newOrder');
                socket.off('orderStatusUpdate');
            };
        }
    }, [activeTab, user, currentPage, pageSize]);

    const fetchOrderCounts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/counts`);
            setOrderCounts(response.data);
        } catch (error) {
            console.error('Failed to fetch order counts:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/orders/status/${activeTab}`, {
                params: {
                    page: currentPage,
                    pageSize: pageSize
                }
            });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            const response = await axios.patch(`${API_URL}/api/orders/status/${orderId}`, { status });
            const updatedOrder = response.data.order;
            // console.log('Order status updated:', updatedOrder);
            
            // Emit the order status update
            socket.emit('orderStatusUpdate', updatedOrder, (error) => {
                if (error) {
                    console.error('Error emitting order status update:', error);
                } else {
                    // console.log('Order status update emitted successfully');
                }
            });

            toast.success('Order status updated');
            if (status !== activeTab) {
                setOrders(prevOrders => {
                    const newOrders = prevOrders.filter(order => order._id !== orderId);
                    // If the page is now empty and not the first page, go back one page
                    if (newOrders.length === 0) {
                        if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        } else {
                            // If on first page, just fetch orders again to refresh
                            fetchOrders();
                        }
                    }
                    return newOrders;
                });
            }
            fetchOrderCounts();
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleCancelClick = (orderId) => {
        setCancelOrderId(orderId);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = () => {
        if (cancelOrderId) {
            handleStatusChange(cancelOrderId, 'CANCELLED');
            setCancelOrderId(null);
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

    const renderActionButtons = (order) => {
        switch (order.status) {
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
                            onClick={() => handleCancelClick(order._id)}
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
                            onClick={() => handleCancelClick(order._id)}
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
                            onClick={() => handleStatusChange(order._id, order.orderType === 'delivery' ? 'ORDER_DELIVERED' : 'ORDER_PICKED_UP')}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Mark as {order.orderType === 'delivery' ? 'Delivered' : 'Picked Up'}
                        </button>
                        <button 
                            className="btn btn-outline-danger w-100" 
                            onClick={() => handleCancelClick(order._id)}
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

    const renderPagination = () => {
        const { totalPages, page } = pagination;
        // if (totalPages <= 1) return null;
        const pages = [];

        // Always show first page
        pages.push(
            <button
                key={1}
                className={`btn ${page === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setCurrentPage(1)}
                disabled={page === 1}
            >
                1
            </button>
        );

        // Show left ellipsis if needed
        if (page > 3) {
            pages.push(<span key="start-ellipsis" className="px-2">...</span>);
        }

        // Show pages around current page
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            if (i !== 1 && i !== totalPages) {
                pages.push(
                    <button
                        key={i}
                        className={`btn ${page === i ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </button>
                );
            }
        }

        // Show right ellipsis if needed
        if (page < totalPages - 2) {
            pages.push(<span key="end-ellipsis" className="px-2">...</span>);
        }

        // Always show last page if more than 1
        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    className={`btn ${page === totalPages ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={page === totalPages}
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                    <span className="me-2">Show:</span>
                    <select 
                        className="form-select" 
                        style={{ width: 'auto' }}
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 25, 50, 75].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="ms-2">entries</span>
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(page - 1)}
                        disabled={page === 1}
                    >
                        &lt; Previous
                    </button>
                    {pages}
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>
        );
    };

    if (!user) {
        return <div>Please login to view orders</div>;
    }

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="col-lg-10 ms-auto px-0" style={{ marginTop: '60px' }}>
                <div className="d-flex justify-content-between align-items-center p-4 bg-white shadow-sm">
                    <div className="d-flex gap-4 flex-wrap">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id 
                                    ? 'btn-primary' 
                                    : 'btn-outline-primary'} position-relative d-flex align-items-center gap-2`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`bi ${tab.icon} me-2`}></i>
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
                        <>
                            <div className="row g-4">
                                {orders.map(order => (
                                    <div key={order._id} className="col-12">
                                        <div className="card shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="row g-4">
                                                    <div className="col-12 col-md-4 border-end">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            
                                                            <span className="badge me-2 fs-6 fw-semibold" style={{
                                                                backgroundColor: order.orderType && order.orderType.toLowerCase() === 'delivery' ? '#e6ffe6' : '#fff3e0',
                                                                color: '#333333',
                                                                border: `1px solid ${order.orderType && order.orderType.toLowerCase() === 'delivery' ? '#66bb6a' : '#ffb74d'}`,
                                                                padding: '0.4em 0.8em',
                                                                borderRadius: '0.3rem'
                                                            }}>
                                                                {order.orderType || 'N/A'}
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

                                                    <div className="col-12 col-md-4 border-end">
                                                        <div className="mb-3">
                                                            {order.items.map((item, index) => (
                                                                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded border border-info" style={{ backgroundColor: '#e0f7fa' }}>
                                                                    <div>
                                                                        <i className={`bi bi-circle-fill ${item.foodType='veg' ? 'text-success' : 'text-danger'} me-2`} style={{ fontSize: '8px' }}></i>
                                                                        <span className="fw-medium">{item.quantity} x {item.name}</span>
                                                                    </div>
                                                                    <div className="fw-bold">{formatCurrency(item.totalPrice)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                                            <span>Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
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
                                                        {order.items.every(item => item.foodType='veg') && (
                                                            <div className="text-success mt-2">
                                                                <i className="bi bi-circle-fill me-2"></i>
                                                                VEG ONLY ORDER
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <div className="d-grid gap-2">
                                                            {renderActionButtons(order)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderPagination()}
                        </>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelOrder}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action cannot be undone."
            />
        </div>
    );
};

export default Orders; 
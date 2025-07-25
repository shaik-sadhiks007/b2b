import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin, HelpCircle } from 'lucide-react';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const OrderHistory = ({ adminMode = false }) => {
    const { user } = useContext(AuthContext);
    const { ownerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        pageSize: 10
    });
    const [showOrderHistoryHelp, setShowOrderHistoryHelp] = useState(false);

    useEffect(() => {
        if (user && (!adminMode || (adminMode && user.role === 'admin'))) {
            fetchOrders();
        }
    }, [user, currentPage, pageSize, adminMode, ownerId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/orders/order-history/restaurant`;
            let params = { page: currentPage, pageSize };
            if (adminMode && ownerId) {
                url = `${API_URL}/api/orders/admin/order-history`;
                params.ownerId = ownerId;
            }
            const response = await axios.get(url, { params });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch orders');
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            let url = `${API_URL}/api/orders/${orderId}`;
            let params = {};
            if (adminMode && ownerId) {
                url = `${API_URL}/api/orders/admin/status/${orderId}`;
                params.ownerId = ownerId;
            }
            await axios.patch(url, { status: 'CANCELLED' }, { params });
            toast.success('Order cancelled successfully');
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'ACCEPTED':
                return <Package className="h-5 w-5 text-green-500" />;
            case 'ORDER_DELIVERY_READY':
                return <Truck className="h-5 w-5 text-green-500" />;
            case 'ORDER_PICKUP_READY':
                return <Package className="h-5 w-5 text-warning-500" />;
            case 'ORDER_DELIVERED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'ORDER_PICKED_UP':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return 'bg-blue-100 text-blue-800';
            case 'ACCEPTED':
                return 'bg-green-100 text-green-800';
            case 'ORDER_DELIVERY_READY':
                return 'bg-green-100 text-green-800';
            case 'ORDER_PICKUP_READY':
                return 'bg-warning-100 text-warning-800';
            case 'ORDER_DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'ORDER_PICKED_UP':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'No address provided';
        return `${address.street}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
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
        return <div>Please login to view order history</div>;
    }

    return (
        <div className="container-fluid px-0">
            {
                (user && user?.role !== 'admin') && (
                    <div style={{ marginTop: "60px" }}>
                        <Navbar />
                        <Sidebar />
                    </div>
                )
            }

            <div
                className={`${user?.role === 'admin' ? 'col-lg-12' : 'col-lg-10'} ms-auto`}
                style={{ marginTop: user?.role === 'admin' ? '0px' : '60px' }}
            >
                <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                            <button
                                onClick={() => setShowOrderHistoryHelp(!showOrderHistoryHelp)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Order history help"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            {showOrderHistoryHelp && (
                                <div className="absolute z-10 mt-10 ml-[-8px] bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                                    <p className="text-sm text-gray-700">
                                        This section shows all your past and current orders. You can view order details,
                                        track order status, and cancel orders if they haven't been processed yet.
                                    </p>
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowOrderHistoryHelp(false)}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No orders found</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h2 className="text-xl font-semibold text-gray-900">
                                                            Order #{order._id.slice(-6)}
                                                        </h2>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(order.status)}
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Restaurant</p>
                                                            <p className="font-medium">{order.restaurantName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Order Type</p>
                                                            <p className="font-medium capitalize">{order.orderType}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Payment Method</p>
                                                            <p className="font-medium">{order.paymentMethod}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total Amount</p>
                                                            <p className="font-medium">₹{order.totalAmount}</p>
                                                        </div>
                                                    </div>

                                                    {order.customerAddress && (
                                                        <div className="mt-4 mb-4">
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                                                    <p className="text-sm font-medium">{order.customerAddress.fullName}</p>
                                                                    <p className="text-sm text-gray-600">{formatAddress(order.customerAddress)}</p>
                                                                    <p className="text-sm text-gray-600">Phone: {order.customerAddress.phone}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-4">
                                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                                                        <div className="space-y-2">
                                                            {order.items.map((item, index) => (
                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{item.name}</span>
                                                                        {item.isVeg && (
                                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                                Veg
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-gray-500">Qty: {item.quantity}</span>
                                                                        <span className="font-medium">₹{item.totalPrice * item.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {order.status === 'ORDER_PLACED' && (
                                                        <div className="mt-6 flex justify-end">
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        </div>
                                                    )}
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
            </div>
        </div>
    );
};

export default OrderHistory;
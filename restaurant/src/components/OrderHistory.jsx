import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin } from 'lucide-react';
import { API_URL } from '../api/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/orders/order-history/restaurant`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch orders');
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/orders/${orderId}`, 
                { status: 'CANCELLED' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
            case 'ORDER_READY':
                return <Truck className="h-5 w-5 text-green-500" />;
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
            case 'ORDER_READY':
                return 'bg-green-100 text-green-800';
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
        return `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No orders found</p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
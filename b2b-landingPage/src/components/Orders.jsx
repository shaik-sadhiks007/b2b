import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin, ChevronDown } from 'lucide-react';
import { API_URL } from '../api/api';
import { HotelContext } from '../contextApi/HotelContextProvider';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllOrders, setShowAllOrders] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(HotelContext);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/order-history`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch orders');
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.patch(`${API_URL}/api/orders/${orderId}`, 
                { status: 'CANCELLED' }
            );
            toast.success('Order cancelled successfully');
            fetchOrders();
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

    const displayedOrders = showAllOrders ? orders : orders.slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">Recent Orders</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No orders found</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {displayedOrders.map((order) => (
                                <div 
                                    key={order._id} 
                                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">
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
                                        <div className="mt-2 flex justify-between items-center">
                                            <p className="text-sm text-gray-600">{order.restaurantName}</p>
                                            <p className="font-medium">₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {orders.length > 4 && !showAllOrders && (
                            <button
                                onClick={() => setShowAllOrders(true)}
                                className="w-full mt-6 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 py-4 border-t border-b border-gray-200"
                            >
                                <ChevronDown className="h-5 w-5" />
                                View Full Order History ({orders.length - 4} more orders)
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;

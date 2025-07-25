import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin, ArrowLeft, ShoppingBag } from 'lucide-react';
import { API_URL } from '../api/api';

const OrderStatus = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/orders/order-status/${orderId}`);
                setOrder(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch order status');
                setLoading(false);
            }
        };

        fetchOrderStatus();
    }, [orderId]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <ShoppingBag className="h-5 w-5 text-blue-500" />;
            case 'ACCEPTED':
                return <Package className="h-5 w-5 text-green-500" />;
            case 'ORDER_DELIVERY_READY':
            case 'ORDER_PICKUP_READY':
                return <Truck className="h-5 w-5 text-green-500" />;
            case 'OUT_FOR_DELIVERY':
                return <Truck className="h-5 w-5 text-orange-500" />;
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
            case 'ORDER_PICKUP_READY':
                return 'bg-green-100 text-green-800';
            case 'OUT_FOR_DELIVERY':
                return 'bg-orange-100 text-orange-800';
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

    const getOrderStatuses = (orderType) => {
        if (!orderType) return [];
        if (orderType === 'delivery' || orderType === 'DELIVERY') {
            return [
                { status: 'ORDER_PLACED', label: 'Order Placed', icon: ShoppingBag },
                { status: 'ACCEPTED', label: 'Accepted', icon: Package },
                { status: 'ORDER_DELIVERY_READY', label: 'Delivery Ready', icon: Truck },
                { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
                { status: 'ORDER_DELIVERED', label: 'Delivered', icon: CheckCircle },
            ];
        } else {
            return [
                { status: 'ORDER_PLACED', label: 'Order Placed', icon: ShoppingBag },
                { status: 'ACCEPTED', label: 'Accepted', icon: Package },
                { status: 'ORDER_PICKUP_READY', label: 'Pickup Ready', icon: Truck },
                { status: 'ORDER_PICKED_UP', label: 'Picked Up', icon: CheckCircle },
            ];
        }
    };

    const getStatusIndex = (status) => {
        const statuses = getOrderStatuses(order?.orderType);
        return statuses.findIndex(s => s.status === status);
    };

    const isStatusCompleted = (status) => {
        const currentIndex = getStatusIndex(order?.status);
        const statusIndex = getStatusIndex(status);
        return statusIndex <= currentIndex;
    };

    const isStatusCancelled = () => {
        return order?.status === 'CANCELLED';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order status...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg">{error || 'Order not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 cursor-pointer"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        {/* Order Status Timeline */}
                        <div className="mb-8">
                            <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-[19px] left-0 w-full h-0.5 bg-gray-200">
                                    <div 
                                        className={`h-full bg-green-500 transition-all duration-500 ${
                                            isStatusCancelled() ? 'bg-red-500' : ''
                                        }`}
                                        style={{
                                            width: isStatusCancelled() 
                                                ? '100%' 
                                                : `${(getStatusIndex(order?.status) / (getOrderStatuses(order?.orderType).length - 1)) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Status Points */}
                                <div className="relative flex justify-between">
                                    {getOrderStatuses(order?.orderType).map((status, index) => {
                                        const Icon = status.icon;
                                        const isCompleted = isStatusCompleted(status.status);
                                        const isCurrent = order?.status === status.status;
                                        
                                        return (
                                            <div key={status.status} className="flex flex-col items-center">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center
                                                    ${isStatusCancelled() 
                                                        ? 'bg-red-100 text-red-500' 
                                                        : isCompleted 
                                                            ? 'bg-green-100 text-green-500' 
                                                            : 'bg-gray-100 text-gray-400'
                                                    }
                                                    ${isCurrent ? 'ring-4 ring-offset-2 ring-green-500' : ''}
                                                    transition-all duration-300
                                                `}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`
                                                    mt-2 text-sm font-medium
                                                    ${isStatusCancelled() 
                                                        ? 'text-red-500' 
                                                        : isCompleted 
                                                            ? 'text-green-500' 
                                                            : 'text-gray-400'
                                                    }
                                                `}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    Order #{order.orderId.slice(-6)}
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus; 
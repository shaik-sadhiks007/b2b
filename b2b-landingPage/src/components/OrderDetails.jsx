import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin, ArrowLeft, ShoppingBag, Share2 } from 'lucide-react';
import { API_URL } from '../api/api';
import { HotelContext } from '../contextApi/HotelContextProvider';
import io from 'socket.io-client';
import { showNotification } from '../utils/notify';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(HotelContext);

    useEffect(() => {
         // Request notification permission when component mounts
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    };

    requestNotificationPermission();
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();

        // Initialize socket connection
        const socket = io(API_URL, { withCredentials: true });

        // Listen for order status updates
        socket.on('orderStatusUpdate', (updatedOrder) => {
            // console.log('Order status update received in OrderDetails:', updatedOrder);
            if (updatedOrder._id === orderId) {
                // console.log('Updating order details for order:', orderId);
                setOrder(updatedOrder);
                // Show toast notification for status change
                toast.info(`Order status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`);
                showNotification("Order Update", {
            body: `Order status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`,
            
        });
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('Order Update', {
                    body: `Order status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`,
                    icon: '/path-to-your-logo.png', 
                    tag: 'order-update' 
                });
            } catch (error) {
                console.error('Error showing notification:', error);
                // Fallback to your existing showNotification function
                showNotification("Order Update", {
                    body: `Order status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`
                });
            }
        } else {
            // Fallback if notifications aren't supported or permission not granted
            showNotification("Order Update", {
                body: `Order status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`
            });
        }
            }
        });

        // Cleanup socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, [user, navigate, orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
            setOrder(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch order details');
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await axios.patch(`${API_URL}/api/orders/${orderId}`, 
                { status: 'CANCELLED' }
            );
            
            // Initialize socket connection
            const socket = io(API_URL, { withCredentials: true });
            
            // Wait for socket connection before emitting
            socket.on('connect', () => {
                console.log('Socket connected for order cancellation:', socket.id);
                // Ensure we're sending the order object, not the entire response
                const orderData = response.data.order || response.data;
                console.log('Emitting order data:', orderData);
                
                // Emit the order status update
                socket.emit('orderStatusUpdate', orderData, (error) => {
                    if (error) {
                        console.error('Error emitting order status update:', error);
                    } else {
                        console.log('Order status update emitted successfully');
                    }
                    // Disconnect after emitting
                    socket.disconnect();
                });
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            toast.success('Order cancelled successfully');
            fetchOrderDetails();
            setShowCancelConfirm(false);
        } catch (error) {
            console.error('Cancel order error:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleShare = (type) => {
        const orderStatusUrl = `${window.location.origin}/order-status/${order._id}`;
        
        if (type === 'whatsapp') {
            const message = `Check my order status: ${orderStatusUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else if (type === 'copy') {
            navigator.clipboard.writeText(orderStatusUrl);
            toast.success('Link copied to clipboard!');
        }
        setShowShareOptions(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <ShoppingBag className="h-5 w-5 text-blue-500" />;
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

    const getOrderStatuses = (orderType) => {
        const baseStatuses = [
            { status: 'ORDER_PLACED', label: 'Order Placed', icon: ShoppingBag },
            { status: 'ACCEPTED', label: 'Accepted', icon: Package },
            { status: 'ORDER_READY', label: 'Ready', icon: Truck }
        ];

        if (orderType === 'DELIVERY') {
            baseStatuses.push({ status: 'ORDER_DELIVERED', label: 'Delivered', icon: CheckCircle });
        } else {
            baseStatuses.push({ status: 'ORDER_PICKED_UP', label: 'Picked Up', icon: CheckCircle });
        }

        return baseStatuses;
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
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Order not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Orders
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        >
                            <Share2 className="h-5 w-5" />
                            Share
                        </button>
                        {showShareOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                                <button
                                    onClick={() => handleShare('whatsapp')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Share on WhatsApp
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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
                                    Order #{order._id.slice(-6)}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-3 py-1 rounded-full text-center text-sm font-medium ${getStatusColor(order.status)}`}>
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
                                <div className="mt-6 flex justify-end p-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                                    >
                                        Cancel Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Cancel Order
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails; 
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, Package, MapPin, ChevronDown, Share2 } from 'lucide-react';
import { API_URL } from '../api/api';
import { HotelContext } from '../contextApi/HotelContextProvider';
import io from 'socket.io-client';

const ShareButton = ({ orderId }) => {
    const [showShareOptions, setShowShareOptions] = useState(false);

    const handleShare = (type) => {
        const orderUrl = `${window.location.origin}/order-status/${orderId}`;
        
        if (type === 'whatsapp') {
            const whatsappText = `Check the status of your order!\n${orderUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
            window.open(whatsappUrl, '_blank');
        } else if (type === 'copy') {
            navigator.clipboard.writeText(orderUrl);
            toast.success('Order status link copied to clipboard!');
        }
        
        setShowShareOptions(false);
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowShareOptions(!showShareOptions);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Share Order Status"
            >
                <Share2 className="h-5 w-5" />
            </button>
            
            {showShareOptions && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border"
                    style={{ top: '100%', marginTop: '0.5rem' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Share on WhatsApp
                    </button>
                    <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy Link
                    </button>
                </div>
            )}
        </div>
    );
};

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

        // Initialize socket connection
        const socket = io(API_URL, { withCredentials: true });

        // Listen for order status updates
        socket.on('orderStatusUpdate', (updatedOrder) => {
            // console.log('Order status update received in Orders:', updatedOrder);
            setOrders(prevOrders => {
                return prevOrders.map(order => 
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            });
            // Show toast notification for status change
           // toast.info(`Order #${updatedOrder._id.slice(-6)} status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`);
        });

        // Cleanup socket connection on component unmount
        return () => {
            socket.disconnect();
        };
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatAddress = (address) => {
        if (!address) return 'No address provided';
        return `${address.street}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
    };

    const renderOrderItems = (items) => {
        return (
            <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">{item.quantity}x</span>
                            <span className="text-gray-800">{item.name}</span>
                        </div>
                        <span className="text-gray-600">₹{item.totalPrice}</span>
                    </div>
                ))}
            </div>
        );
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">Your Orders</h1>
                
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
                                    className="bg-white rounded-lg shadow-md overflow-visible cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    Order #{order._id.slice(-6).toUpperCase()}
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
                                                <ShareButton orderId={order._id} />
                                                {getStatusIcon(order.status)}
                                                <span className={`px-3 py-2 rounded-full text-sm text-center font-medium ${getStatusColor(order.status)} w-auto md:w-[160px]`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Restaurant</p>
                                                <p className="text-gray-900">{order.restaurantName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                <p className="font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        {renderOrderItems(order.items)}
                                        {order.deliveryAddress && (
                                            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{formatAddress(order.deliveryAddress)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {orders.length > 4 && !showAllOrders && (
                            <button
                                onClick={() => setShowAllOrders(true)}
                                className="w-full mt-6 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 py-4 border-t border-b border-gray-200 transition-colors duration-200"
                            >
                                <ChevronDown className="h-5 w-5" />
                                Show all orders ({orders.length - 4} more)
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;
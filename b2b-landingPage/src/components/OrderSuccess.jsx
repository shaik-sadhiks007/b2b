import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import { HotelContext } from '../contextApi/HotelContextProvider';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useContext(HotelContext);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

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

        fetchOrderDetails();
    }, [orderId, user, navigate]);

    console.log(order,"order")

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'ACCEPTED':
                return <Package className="h-5 w-5 text-green-500" />;
            case 'ORDER_READY':
                return <Truck className="h-5 w-5 text-green-500" />;
            case 'ORDER_DELIVERED':
            case 'ORDER_PICKED_UP':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return 'bg-blue-100 text-blue-800';
            case 'ACCEPTED':
            case 'ORDER_READY':
            case 'ORDER_DELIVERED':
            case 'ORDER_PICKED_UP':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Order Placed Successfully!</h1>
                
                {order && (
                    <div className="mt-8 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-6)}</h2>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>

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
                                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="text-sm font-medium">{order.customerAddress.fullName}</p>
                                            <p className="text-sm text-gray-600">{order.customerAddress.street}</p>
                                            <p className="text-sm text-gray-600">
                                                {order.customerAddress.city}, {order.customerAddress.state} {order.customerAddress.pincode}
                                            </p>
                                            <p className="text-sm text-gray-600">{order.customerAddress.country}</p>
                                            <p className="text-sm text-gray-600">Phone: {order.customerAddress.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
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
                )}

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        View All Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess; 
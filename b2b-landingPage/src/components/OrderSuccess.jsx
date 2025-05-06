import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(response.data.order);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to fetch order details');
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

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
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Order ID:</span> {order._id}</p>
                                <p><span className="font-medium">Customer Name:</span> {order.customerName}</p>
                                <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                                <p><span className="font-medium">Restaurant:</span> {order.restaurantName}</p>
                                <p><span className="font-medium">Order Type:</span> {order.orderType}</p>
                                <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
                                <p><span className="font-medium">Status:</span> {order.status}</p>
                                <p><span className="font-medium">Payment Status:</span> {order.paymentStatus}</p>
                                <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                                <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            {item.isVeg && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Veg
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium">₹{(item.totalPrice * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        View All Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess; 
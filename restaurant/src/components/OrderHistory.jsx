import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MapPin, Phone, Package, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/orders/order-history/restaurant', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch orders');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'ORDER_CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'ORDER_PICKED_UP':
                return 'bg-blue-100 text-blue-800';
            case 'INSTORE_ORDER':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_DELIVERED':
                return <CheckCircle className="w-5 h-5" />;
            case 'ORDER_CANCELLED':
                return <XCircle className="w-5 h-5" />;
            case 'ORDER_PICKED_UP':
                return <Package className="w-5 h-5" />;
            case 'INSTORE_ORDER':
                return <ShoppingBag className="w-5 h-5" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Order History</h1>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                                <p className="text-gray-600">
                                    {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="font-medium">{order.status.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <span>Order Type: {order.orderType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <span>Phone: {order.customerPhone}</span>
                                </div>
                                {order.customerAddress && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                                        <div>
                                            <p>Address:</p>
                                            <p className="text-gray-600">
                                                {order.customerAddress.street}, {order.customerAddress.city}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Items:</h3>
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">{item.quantity}x</span>
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-medium">₹{item.totalPrice}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
                                    <p className="text-gray-600">Payment Status: {order.paymentStatus}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold">Total: ₹{order.totalAmount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No orders found
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
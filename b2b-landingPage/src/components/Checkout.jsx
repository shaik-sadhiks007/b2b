import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';


const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orderType, setOrderType] = useState('DELIVERY');
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCart();
        fetchAddresses();
    }, [navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const cartData = response.data[0];
            setCart(cartData);
            
            // Set default order type based on service type
            if (cartData.serviceType === 'pickup') {
                setOrderType('PICKUP');
            } else if (cartData.serviceType === 'delivery') {
                setOrderType('DELIVERY');
            } else if (cartData.serviceType === 'both') {
                setOrderType('DELIVERY'); // Default to delivery if both options are available
            }
        } catch (err) {
            toast.error('Failed to fetch cart');
        }
    };

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/customer-address`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(response.data);
            // Auto-select the default address if available
            const defaultAddress = response.data.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
            }
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch addresses');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCompletePurchase = async () => {
        if (!selectedAddress && !showAddressForm) {
            toast.error('Please select or add an address');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                items: cart.items.map(item => ({
                    itemId: item.itemId,
                    name: item.name,
                    quantity: item.quantity,
                    basePrice: item.basePrice,
                    packagingCharges: item.packagingCharges || 0,
                    totalPrice: item.totalPrice,
                    photos: item.photos || [],
                    isVeg: item.isVeg || false
                })),
                totalAmount: calculateTotal(),
                paymentMethod: "COD",
                orderType,
                restaurantId: cart.restaurantId._id,
                restaurantName: cart.restaurantName
            };

            if (selectedAddress) {
                orderData.addressId = selectedAddress._id;
            } else if (showAddressForm) {
                orderData.customerAddressData = formData;
            }

            const response = await axios.post(`${API_URL}/api/orders/place-order`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                await axios.delete(`${API_URL}/api/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                navigate(`/ordersuccess/${response.data.order._id}`);
            }
        } catch (err) {
            console.error('Order placement error:', err);
            toast.error(err.response?.data?.error || 'Failed to place order');
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.totalPrice * item.quantity);
        }, 0);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
                    <p className="text-gray-600 mb-8">Please add some items to your cart before proceeding to checkout.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-lg font-semibold"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side - Cart Items */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>
                        <div className="space-y-4">
                            {cart?.items?.map((item) => (
                                <div key={item.itemId} className="flex items-center justify-between py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={item.photos?.[0] || 'https://via.placeholder.com/150?text=Food'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            <p className="text-sm text-gray-600">₹{item.totalPrice.toFixed(2)} each</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-800">₹{(item.totalPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                                <span className="text-xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Address Management */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Delivery Address</h2>
                            
                            {!showAddressForm ? (
                                <>
                                    {addresses.length > 0 ? (
                                        <div className="space-y-4">
                                            {addresses.map((address) => (
                                                <div
                                                    key={address._id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                                        selectedAddress?._id === address._id 
                                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                    onClick={() => setSelectedAddress(address)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-800">{address.fullName}</p>
                                                                {address.isDefault && (
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-600">{address.street}</p>
                                                            <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                                                            <p className="text-gray-600">{address.country}</p>
                                                            <p className="text-gray-600">Phone: {address.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 mb-4">No addresses found</p>
                                    )}
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Add New Address
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                            <input
                                                type="text"
                                                name="zip"
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Type Selection */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Type</h2>
                            <div className="flex gap-6">
                                {(cart.serviceType === 'DELIVERY' || cart.serviceType === 'BOTH') && (
                                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200 flex-1">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="DELIVERY"
                                            checked={orderType === 'DELIVERY'}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">Delivery</span>
                                            <p className="text-sm text-gray-500">Get your order delivered to your address</p>
                                        </div>
                                    </label>
                                )}
                                {(cart.serviceType === 'PICKUP' || cart.serviceType === 'BOTH') && (
                                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200 flex-1">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="PICKUP"
                                            checked={orderType === 'PICKUP'}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">Pickup</span>
                                            <p className="text-sm text-gray-500">Pick up your order from the store</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleCompletePurchase}
                            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-lg font-semibold"
                            disabled={!selectedAddress && !showAddressForm}
                        >
                            Complete Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 
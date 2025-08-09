import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useCart } from '../context/CartContext';
import { HotelContext } from '../contextApi/HotelContextProvider';
import io from 'socket.io-client';

// Initialize socket connection
const socket = io(API_URL, { withCredentials: true });

const CheckoutItemSkeleton = () => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
            <div className="w-20 h-20">
                <Skeleton height={80} />
            </div>
            <div>
                <Skeleton width={150} height={20} className="mb-2" />
                <Skeleton width={100} height={16} className="mb-1" />
                <Skeleton width={80} height={16} />
            </div>
        </div>
        <div className="text-right">
            <Skeleton width={80} height={20} />
        </div>
    </div>
);

const AddressSkeleton = () => (
    <div className="p-4 border rounded-lg">
        <div className="space-y-2">
            <Skeleton width={150} height={20} />
            <Skeleton width={200} height={16} />
            <Skeleton width={180} height={16} />
            <Skeleton width={160} height={16} />
            <Skeleton width={120} height={16} />
        </div>
    </div>
);

const CheckoutSkeleton = () => (
    <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
            <Skeleton height={40} width={200} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side - Cart Items */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <Skeleton height={28} width={200} className="mb-4" />
                    <div className="space-y-4">
                        <CheckoutItemSkeleton />
                        <CheckoutItemSkeleton />
                        <CheckoutItemSkeleton />
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <Skeleton width={150} height={24} />
                            <Skeleton width={100} height={24} />
                        </div>
                    </div>
                </div>

                {/* Right Side - Address Management */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <Skeleton height={28} width={200} className="mb-4" />
                        <div className="space-y-4">
                            <AddressSkeleton />
                            <AddressSkeleton />
                        </div>
                        <Skeleton height={40} className="mt-4" />
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <Skeleton height={28} width={200} className="mb-4" />
                        <div className="flex gap-6">
                            <Skeleton height={80} className="flex-1" />
                            <Skeleton height={80} className="flex-1" />
                        </div>
                    </div>

                    <Skeleton height={48} />
                </div>
            </div>
        </div>
    </div>
);

const Checkout = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orderType, setOrderType] = useState('delivery');
    const [isProcessing, setIsProcessing] = useState(false);
    const [calculatedCharges, setCalculatedCharges] = useState(null);
    const [chargesLoading, setChargesLoading] = useState(false);
    const navigate = useNavigate();
    const { carts, clearCart } = useCart();
    const { user } = useContext(HotelContext);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: ''
    });

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const initializeCheckout = async () => {
            try {
                if (!user) {
                    navigate('/login');
                    return;
                }

                // Check if cart data exists
                if (!carts || carts.length === 0 || !carts[0]?.items || carts[0].items.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch addresses
                const addressesResponse = await axios.get(`${API_URL}/api/customer-address`);

                const cartData = carts[0];

                // Set default order type based on service type
                if (cartData?.serviceType === 'pickup') {
                    setOrderType('pickup');
                } else if (cartData?.serviceType === 'delivery') {
                    setOrderType('delivery');
                } else if (cartData?.serviceType === 'both') {
                    setOrderType('delivery');
                }

                setAddresses(addressesResponse.data);
                // Auto-select the default address if available
                const defaultAddress = addressesResponse.data.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress);
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        initializeCheckout();
    }, [navigate, carts, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCompletePurchase = async () => {
        // Prevent double submission
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            // Only validate address for delivery orders
            if (orderType === 'delivery') {
                if (!selectedAddress && !showAddressForm) {
                    toast.error('Please select or add a delivery address to continue');
                    return;
                }

                // Validate form data if showing address form
                if (showAddressForm) {
                    const requiredFields = ['fullName', 'street', 'city', 'state', 'pincode', 'country', 'phone'];
                    const missingFields = requiredFields.filter(field => !formData[field]);

                    if (missingFields.length > 0) {
                        const missingFieldNames = missingFields.map(field => {
                            switch (field) {
                                case 'fullName': return 'Full Name';
                                case 'street': return 'Street Address';
                                case 'city': return 'City';
                                case 'state': return 'State';
                                case 'pincode': return 'Pincode';
                                case 'country': return 'Country';
                                case 'phone': return 'Phone Number';
                                default: return field;
                            }
                        });
                        toast.error(`Please fill in all required fields: ${missingFieldNames.join(', ')}`);
                        return;
                    }

                    // Validate phone number format
                    const phoneRegex = /^[0-9]{10}$/;
                    if (!phoneRegex.test(formData.phone)) {
                        toast.error('Please enter a valid 10-digit phone number');
                        return;
                    }
                }
            }

            const cartData = carts[0];
            const orderData = {
                items: cartData.items.map(item => {
                    // For loose items, convert quantity from grams to kg
                    const quantity = item.loose && item.quantityLabel 
                        ? parseFloat(item.quantityLabel) / 1000 
                        : item.quantity;

                    return {
                        itemId: item.itemId,
                        name: item.name,
                        quantity: quantity,
                        totalPrice: item.totalPrice,
                        photos: item.photos || [],
                        isVeg: item.isVeg || false,
                        loose: item.loose || false,
                        unit: item.unit || '',
                        unitValue: item.unitValue || 0,
                        quantityLabel: item.quantityLabel || '',
                        originalQuantity: item.quantity // Keep original quantity for reference
                    };
                }),
                totalAmount: calculatedCharges ? calculatedCharges.totalAmount : calculateTotal(),
                paymentMethod: "COD",
                orderType,
                restaurantId: cartData.restaurantId._id,
                restaurantName: cartData.restaurantName,
                quantity: cartData.quantity
            };

            // Only include address data for delivery orders
            if (orderType === 'delivery') {
                if (selectedAddress) {
                    orderData.addressId = selectedAddress._id;
                } else if (showAddressForm) {
                    orderData.customerAddressData = formData;
                }
            }

            const response = await axios.post(`${API_URL}/api/orders/place-order`, orderData);
            if (response.data) {
                // Emit new order event through socket
                socket.emit('newOrder', response.data.order);

                toast.success('Order placed successfully! Redirecting to order details...');

                // Navigate first, then clear cart
                navigate(`/ordersuccess/${response.data.order._id}`);
                await clearCart();
            }
        } catch (err) {
            if (err.response?.data?.error) {
                toast.error(err.response.data.error);
            } else if (err.response?.status === 401) {
                toast.error('Your session has expired. Please login again.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error('Failed to place order. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateTotal = () => {
        const cartData = carts[0];
        if (!cartData || !cartData.items) return 0;
        return cartData.items.reduce((total, item) => {
            return total + (item.totalPrice * item.quantity);
        }, 0);
    };

    // Calculate charges using settings API
    const calculateCharges = async () => {
        try {
            setChargesLoading(true);
            const subtotal = calculateTotal();

            if (subtotal <= 0) {
                setCalculatedCharges(null);
                return;
            }

            // Get restaurant category from cart data
            const cartData = carts[0];
            const category = cartData?.restaurant?.category || 'restaurant';

            // Calculate distance if delivery and address is selected
            let distance = 0;
            if (orderType === 'delivery' && selectedAddress && cartData?.restaurant?.location) {
                // Simple distance calculation (in a real app, you'd use a proper geolocation service)
                // For now, we'll use a placeholder distance
                distance = 5; // 5km as default
            }

            // Calculate total weight (assuming 0.5kg per item)
            const totalWeight = cartData?.items?.reduce((weight, item) => weight + (item.quantity * 0.5), 0) || 0;

            const response = await axios.post(`${API_URL}/api/settings/calculate-checkout`, {
                orderAmount: subtotal,
                distance: distance,
                weight: totalWeight,
                category: category,
                orderType: orderType
            });

            if (response.data.success) {
                setCalculatedCharges(response.data.data);
            }
        } catch (error) {
            console.error('Error calculating charges:', error);
            // Fallback to basic calculation
            const subtotal = calculateTotal();
            setCalculatedCharges({
                subtotalAmount: subtotal,
                deliveryCharge: orderType === 'delivery' ? 30 : 0,
                gstAmount: (subtotal * 5) / 100,
                gstPercentage: 5,
                totalAmount: subtotal + (orderType === 'delivery' ? 30 : 0) + ((subtotal * 5) / 100)
            });
        } finally {
            setChargesLoading(false);
        }
    };

    const renderQuantityLabel = (item) => {
        if (item.loose && item.quantityLabel) {
            return (
                <span className="text-xs text-gray-500 ml-1">
                    ({item.quantityLabel})
                </span>
            );
        } else if (item.unit && item.unitValue) {
            return (
                <span className="text-xs text-gray-500 ml-1">
                    ({item.unitValue} {item.unit})
                </span>
            );
        }
        return null;
    };

    const cartData = carts[0];
    const isDeliveryAvailable = cartData?.serviceType === 'delivery' || cartData?.serviceType === 'both';
    const isPickupAvailable = cartData?.serviceType === 'pickup' || cartData?.serviceType === 'both';

    // If only one option is available, automatically select it
    useEffect(() => {
        if (isDeliveryAvailable && !isPickupAvailable) {
            setOrderType('delivery');
        } else if (!isDeliveryAvailable && isPickupAvailable) {
            setOrderType('pickup');
        }
    }, [isDeliveryAvailable, isPickupAvailable]);

    // Recalculate charges when relevant data changes
    useEffect(() => {
        if (!loading && carts.length > 0) {
            calculateCharges();
        }
    }, [carts, orderType, selectedAddress, loading]);

    const handleAddAddress = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/api/customer-address`,
                formData
            );

            // Add the new address to the addresses list
            setAddresses(prev => [...prev, response.data]);

            // Select the newly added address
            setSelectedAddress(response.data);

            // Clear form and hide form
            setFormData({
                fullName: '',
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India',
                phone: ''
            });
            setShowAddressForm(false);

            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error(error.response?.data?.message || 'Failed to add address');
        }
    };

    const handleCancelAddress = () => {
        // Clear form data
        setFormData({
            fullName: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            phone: ''
        });
        setShowAddressForm(false);
    };

    if (loading) return <CheckoutSkeleton />;

    if (!loading && (!carts || carts.length === 0 || !carts[0]?.items || carts[0].items.length === 0)) {
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
                            {cartData?.items?.map((item) => (
                                <div key={item.itemId} className="flex items-center justify-between py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative">
                                            {item.photos?.length > 0 && item.photos[0] != null && item.photos[0] != '' ? (
                                                <img
                                                    src={item.photos[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                                    <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-800">{item.name}</h3>
                                                <span className={`w-3 h-3 border ${item.foodType === 'veg' ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                                                    <span className={`w-1.5 h-1.5 ${item.foodType === 'veg' ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Quantity: {item.quantity} {renderQuantityLabel(item)}
                                            </p>
                                            <p className="text-sm text-gray-600">₹{item.totalPrice.toFixed(2)} {item.loose }</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-800">₹{(item.totalPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            {chargesLoading ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Subtotal</span>
                                        <span className="text-sm text-gray-600">Calculating...</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Delivery Charge</span>
                                        <span className="text-sm text-gray-600">Calculating...</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">GST ({calculatedCharges?.gstPercentage || 5}%)</span>
                                        <span className="text-sm text-gray-600">Calculating...</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                                        <span className="text-lg font-semibold text-gray-800">Calculating...</span>
                                    </div>
                                </div>
                            ) : calculatedCharges ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Subtotal</span>
                                        <span className="text-sm text-gray-600">₹{calculatedCharges.subtotalAmount.toFixed(2)}</span>
                                    </div>
                                    {orderType === 'delivery' && calculatedCharges.deliveryCharge > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Delivery Charge</span>
                                            <span className="text-sm text-gray-600">₹{calculatedCharges.deliveryCharge.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">GST ({calculatedCharges.gstPercentage}%)</span>
                                        <span className="text-sm text-gray-600">₹{calculatedCharges.gstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                                        <span className="text-xl font-bold text-gray-900">₹{calculatedCharges.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                                    <span className="text-xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Settings Information */}
                        {/* {calculatedCharges && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Applied Settings</h3>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Delivery Type:</span>
                                        <span className="font-medium capitalize">{calculatedCharges.chargeType}</span>
                                    </div>
                                    {calculatedCharges.chargeType === 'flat' && (
                                        <div className="flex justify-between">
                                            <span>Flat Delivery Charge:</span>
                                            <span className="font-medium">₹30</span>
                                        </div>
                                    )}
                                    {calculatedCharges.chargeType === 'free' && (
                                        <div className="flex justify-between">
                                            <span>Free Delivery:</span>
                                            <span className="font-medium text-green-600">Yes (Above ₹500)</span>
                                        </div>
                                    )}
                                    {calculatedCharges.chargeType === 'distance' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Max Distance (km):</span>
                                                <span className="font-medium">10</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Additional Charge per Km:</span>
                                                <span className="font-medium">₹15</span>
                                            </div>
                                        </>
                                    )}
                                    {calculatedCharges.chargeType === 'weight' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Max Weight (kg):</span>
                                                <span className="font-medium">15</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Additional Charge per Kg:</span>
                                                <span className="font-medium">₹8</span>
                                            </div>
                                        </>
                                    )}
                                    {calculatedCharges.chargeType === 'distance-weight' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Max Distance (km):</span>
                                                <span className="font-medium">10</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Additional Charge per Km:</span>
                                                <span className="font-medium">₹15</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Max Weight (kg):</span>
                                                <span className="font-medium">15</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Additional Charge per Kg:</span>
                                                <span className="font-medium">₹8</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="pt-2 border-t border-gray-200">
                                        <div className="flex justify-between">
                                            <span>GST Category:</span>
                                            <span className="font-medium capitalize">{calculatedCharges.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>GST Percentage:</span>
                                            <span className="font-medium">{calculatedCharges.gstPercentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
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
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedAddress?._id === address._id
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
                                                            <p className="text-gray-600">{address.city}, {address.state} {address.pincode}</p>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pincode <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter 10-digit phone number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={handleAddAddress}
                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                        >
                                            Save Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelAddress}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Type Selection */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Type</h2>
                            <div className="flex gap-6">
                                {isDeliveryAvailable && (
                                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200 flex-1">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="delivery"
                                            checked={orderType === 'delivery'}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">Delivery</span>
                                            <p className="text-sm text-gray-500">Get your order delivered to your address</p>
                                        </div>
                                    </label>
                                )}
                                {isPickupAvailable && (
                                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200 flex-1">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="pickup"
                                            checked={orderType === 'pickup'}
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
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </div>
                            ) : 'Place order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
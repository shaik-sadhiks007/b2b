import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Header } from './Header';
import { useCart } from '../context/CartContext';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { carts, addToCart, isItemInCart, fetchCart, clearCart } = useCart();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [pendingAddItem, setPendingAddItem] = useState(null);

    // Debug expanded categories
    useEffect(() => {
        console.log('Expanded categories:', expandedCategories);
    }, [expandedCategories]);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                // Get location from localStorage if available
                const savedLocation = localStorage.getItem('userLocation');
                let url = `http://localhost:5000/api/restaurants/public/${id}`;
                
                if (savedLocation) {
                    const { coordinates } = JSON.parse(savedLocation);
                    url += `?lat=${coordinates.lat}&lng=${coordinates.lng}`;
                }

                const response = await axios.get(url, { headers });
                setRestaurant(response.data);
            } catch (err) {
                setError('Failed to fetch restaurant details');
                console.error(err);
            }
        };

        const fetchMenu = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`http://localhost:5000/api/menu/public/${id}`, { headers });
                setMenu(response.data);
                // Set first category as expanded by default
                if (response.data && response.data.length > 0) {
                    setExpandedCategories([response.data[0]._id]);
                }
            } catch (err) {
                setError('Failed to fetch menu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantDetails();
        fetchMenu();
    }, [id]);

    // Separate useEffect for cart fetching
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        }
    }, [fetchCart]); // Add fetchCart to dependencies

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prevCategories => {
            if (prevCategories.includes(categoryId)) {
                return prevCategories.filter(id => id !== categoryId);
            }
            return [...prevCategories, categoryId];
        });
    };

    const handleAddToCart = async (item) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        // Check if item is already in cart first
        if (isItemInCart(item._id)) {
            toast.info('Item already in cart');
            navigate('/cart');
            return;
        }

        // Find if cart for this restaurant exists
        const cartForRestaurant = carts.find(c => c.restaurantId === restaurant._id);
        let items = [];
        if (cartForRestaurant) {
            items = [...cartForRestaurant.items, {
                itemId: item._id,
                name: item.name,
                quantity: 1,
                basePrice: Number(item.basePrice),
                packagingCharges: Number(item.packagingCharges),
                totalPrice: Number(item.totalPrice),
                isVeg: item.isVeg
            }];
        } else {
            items = [{
                itemId: item._id,
                name: item.name,
                quantity: 1,
                basePrice: Number(item.basePrice),
                packagingCharges: Number(item.packagingCharges),
                totalPrice: Number(item.totalPrice),
                isVeg: item.isVeg
            }];
        }

        const result = await addToCart(
            restaurant._id,
            restaurant.name,
            items,
            restaurant.photos || []
        );

        if (!result.success) {
            if (result.error === 'Different restaurant') {
                setPendingAddItem(item);
                setShowRestaurantModal(true);
            } else {
                toast.error(result.error || 'Failed to add to cart');
            }
        } else {
            toast.success('Item added to cart successfully');
        }
    };

    const handleRestaurantModalResponse = async (resetCart) => {
        if (resetCart) {
            try {
                await clearCart();
                toast.success('Cart cleared successfully');
                setShowRestaurantModal(false);
                // Retry add to cart
                if (pendingAddItem) {
                    setTimeout(() => handleAddToCart(pendingAddItem), 100);
                }
            } catch (err) {
                toast.error('Failed to reset cart');
                setError('Failed to reset cart');
            }
        } else {
            setShowRestaurantModal(false);
            setPendingAddItem(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">{error}</div>;
    if (!restaurant) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

    return (
        <>
            {showRestaurantModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Items already in cart</h2>
                        <p className="text-gray-600 mb-6">
                            Your cart contains items from another restaurant. Would you like to reset your cart for adding items from this restaurant?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleRestaurantModalResponse(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRestaurantModalResponse(true)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-colors"
                            >
                                Yes, Reset Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-16">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full">
                        <div className="bg-white">
                            <img
                                src={restaurant.imageUrl || 'https://via.placeholder.com/800x400?text=Restaurant'}
                                alt={restaurant.restaurantName}
                                className={`w-full h-64 object-cover ${!restaurant.online ? 'grayscale' : ''}`}
                            />
                            <div className="p-6">
                                <h1 className="text-3xl font-bold mb-2">{restaurant.restaurantName}</h1>
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                                <div className="flex items-center gap-4">
                                    {/* <div className="flex items-center">
                                        <span className="text-yellow-500">★</span>
                                        <span className="ml-1">{restaurant.rating}</span>
                                    </div> */}
                                    <div className="text-gray-500">
                                        {restaurant.distance} km away
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${restaurant.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {restaurant.online ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Menu</h2>
                            {menu && menu.length > 0 ? (
                                <div className="space-y-4">
                                    {menu.map(category => (
                                        <div key={category._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleCategory(category._id)}
                                                className="w-full p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <h3 className="text-xl font-semibold">{category.name}</h3>
                                                <span className="text-xl font-bold">
                                                    {expandedCategories.includes(category._id) ? '−' : '+'}
                                                </span>
                                            </button>
                                            {expandedCategories.includes(category._id) && (
                                                <div className="p-4 border-t">
                                                    {category.subcategories.map(subcategory => (
                                                        <div key={subcategory._id} className="mb-6">
                                                            <h4 className="text-lg font-medium mb-3">{subcategory.name}</h4>
                                                            <div className="space-y-4">
                                                                {subcategory.items.map(item => (
                                                                    <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'
                                                                                    } flex items-center justify-center`}>
                                                                                    <span className={`w-1.5 h-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'
                                                                                        } rounded-full`}></span>
                                                                                </span>
                                                                                <h5 className="font-medium">{item.name}</h5>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                                {item.description}
                                                                            </p>
                                                                            <div className="mt-2">
                                                                                <span className="font-medium">₹{item.totalPrice}</span>
                                                                                <span className="text-xs text-gray-500 ml-2">
                                                                                    (₹{item.basePrice} + ₹{item.packagingCharges} packaging)
                                                                                </span>
                                                                            </div>
                                                                            {item.customisable && (
                                                                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                                                    Customizable
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                                                            <img
                                                                                src={item.photos?.[0] || 'https://via.placeholder.com/150?text=Food'}
                                                                                alt={item.name}
                                                                                className={`w-full h-full object-cover ${!restaurant.online ? 'grayscale' : ''}`}
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleAddToCart(item)}
                                                                            disabled={!restaurant.online}
                                                                            className={`self-center px-4 py-2 ${
                                                                                !restaurant.online 
                                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                                    : isItemInCart(item._id)
                                                                                        ? 'bg-green-600 text-white'
                                                                                        : 'border border-green-600 text-green-600 hover:bg-green-700 hover:text-white'
                                                                            } rounded transition-colors`}
                                                                        >
                                                                            {!restaurant.online ? 'CLOSED' : isItemInCart(item._id) ? 'GO TO CART' : 'ADD'}
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No menu items available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HotelDetails; 
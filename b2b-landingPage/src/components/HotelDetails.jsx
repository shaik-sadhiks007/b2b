import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Header } from './Header';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cart, clearCart } = useCart();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);
    const [itemToAdd, setItemToAdd] = useState(null);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/restaurants/public/${id}`);
                setRestaurant(response.data);
            } catch (err) {
                setError('Failed to fetch restaurant details');
                console.error(err);
            }
        };

        const fetchMenu = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/menu/public/${id}`);
                setMenu(response.data);
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

    const isItemInCart = (itemId) => {
        return cart.items?.some(item => item._id === itemId) || false;
    };

    const handleAddToCart = (item) => {
        if (isItemInCart(item._id)) {
            navigate('/cart');
            return;
        }

        const itemWithRestaurant = {
            ...item,
            restaurantId: restaurant._id,
            restaurantName: restaurant.name
        };

        const result = addToCart(itemWithRestaurant);

        if (!result.success) {
            setCurrentRestaurant(result.currentRestaurant);
            setItemToAdd(itemWithRestaurant);
            setShowRestaurantModal(true);
        }
    };

    const handleRestaurantModalResponse = (resetCart) => {
        if (resetCart) {
            clearCart();
            addToCart(itemToAdd);
        }
        setShowRestaurantModal(false);
        setItemToAdd(null);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">{error}</div>;
    if (!restaurant) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

    return (
        <>
            <Header />
            {showRestaurantModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Items already in cart</h2>
                        <p className="text-gray-600 mb-6">
                            Your cart contains items from other restaurant. Would you like to reset your cart for adding items from this restaurant?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleRestaurantModalResponse(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                NO
                            </button>
                            <button
                                onClick={() => handleRestaurantModalResponse(true)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                YES, START AFRESH
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
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-6">
                                <h1 className="text-3xl font-bold mb-2">{restaurant.restaurantName}</h1>
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500">★</span>
                                        <span className="ml-1">{restaurant.rating}</span>
                                    </div>
                                    <div className="text-gray-500">
                                        {restaurant.distance} km away
                                    </div>
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
                                                onClick={() => setExpandedCategory(
                                                    expandedCategory === category._id ? null : category._id
                                                )}
                                                className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                                            >
                                                <h3 className="text-xl font-semibold">{category.name}</h3>
                                                <span>{expandedCategory === category._id ? '−' : '+'}</span>
                                            </button>
                                            {expandedCategory === category._id && (
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
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleAddToCart(item)}
                                                                            className={`self-center px-4 py-2 ${isItemInCart(item._id)
                                                                                    ? 'bg-green-600 text-white'
                                                                                    : 'border border-green-600 text-green-600'
                                                                                } rounded hover:bg-green-700 hover:text-white transition-colors`}
                                                                        >
                                                                            {isItemInCart(item._id) ? 'GO TO CART' : 'ADD'}
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
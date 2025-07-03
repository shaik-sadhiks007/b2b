import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Header } from './Header';
import { useCart } from '../context/CartContext';
import { API_URL } from '../api/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { HotelContext } from '../contextApi/HotelContextProvider';
import { useRestaurantDetails } from '../hooks/useRestaurantDetails';
import HotelMenu from './HotelMenu';

const MenuItemSkeleton = () => (
    <div className="flex gap-4 p-4 border rounded-lg">
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <Skeleton width={12} height={12} circle />
                <Skeleton width={150} height={20} />
            </div>
            <Skeleton count={2} className="mt-1" />
            <div className="mt-2">
                <Skeleton width={80} height={20} />
                <Skeleton width={120} height={16} className="mt-1" />
            </div>
        </div>
        <div className="w-24 h-24">
            <Skeleton height={96} />
        </div>
        <div className="self-center">
            <Skeleton width={60} height={36} />
        </div>
    </div>
);

const CategorySkeleton = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full p-4 flex justify-between items-center">
            <Skeleton width={200} height={24} />
            <Skeleton width={24} height={24} circle />
        </div>
        <div className="p-4 border-t">
            <Skeleton width={150} height={20} className="mb-3" />
            <div className="space-y-4">
                <MenuItemSkeleton />
                <MenuItemSkeleton />
                <MenuItemSkeleton />
            </div>
        </div>
    </div>
);

const RestaurantDetailsSkeleton = () => (
    <div className="mt-16">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full">
                <div className="bg-white">
                    <Skeleton height={256} />
                    <div className="p-6">
                        <Skeleton height={36} width="70%" className="mb-2" />
                        <Skeleton count={2} className="mb-4" />
                        <div className="flex items-center gap-4">
                            <Skeleton width={100} height={20} />
                            <Skeleton width={80} height={24} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Skeleton height={32} width={100} className="mb-4" />
                    <div className="space-y-4">
                        <CategorySkeleton />
                        <CategorySkeleton />
                        <CategorySkeleton />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { carts, addToCart, isItemInCart, fetchCart, clearCart } = useCart();
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [pendingAddItem, setPendingAddItem] = useState(null);
    const { user } = useContext(HotelContext);
    const [expandedSubcategories, setExpandedSubcategories] = useState({});

    const { restaurant, menu, isLoading, error } = useRestaurantDetails(id);

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    // Set first category as expanded by default when menu data is loaded
    useEffect(() => {
        if (menu && menu.length > 0) {
            setExpandedCategories([menu[0]._id]);
        }
    }, [menu]);

    // Separate useEffect for cart fetching
    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [fetchCart, user]);


    const handleAddToCart = async (item) => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        // Check if item is out of stock
        if (!item.inStock) {
            toast.error('This item is out of stock');
            return;
        }

        // Check if item is already in cart first
        if (isItemInCart(item._id)) {
            navigate('/cart');
            return;
        }

        // Check if there are items from a different restaurant
        if (carts.length > 0 && carts[0].restaurantId._id !== restaurant._id) {
            setPendingAddItem(item);
            setShowRestaurantModal(true);
            return;
        }

        const items = [{
            itemId: item._id,
            name: item.name,
            quantity: 1,
            totalPrice: Number(item.totalPrice),
            foodType: item.foodType,
            photos: [item.photos] || []
        }];

        const result = await addToCart(
            restaurant._id,
            restaurant.name,
            items,
            restaurant.serviceType
        );

        if (!result.success) {
            if (result.error === 'Different restaurant') {
                setPendingAddItem(item);
                setShowRestaurantModal(true);
            } else {
                toast.error(result.error || 'Failed to add to cart');
            }
        }
    };

    const handleRestaurantModalResponse = async (resetCart) => {
        if (resetCart) {
            try {
                await clearCart();
                toast.success('Cart cleared successfully');
                setShowRestaurantModal(false);
                setPendingAddItem(null);

                // Wait for a moment to ensure cart state is updated
                await new Promise(resolve => setTimeout(resolve, 500));

                // Now add the item
                if (pendingAddItem) {
                    const item = pendingAddItem;
                    const items = [{
                        itemId: item._id,
                        name: item.name,
                        quantity: 1,
                        totalPrice: Number(item.totalPrice),
                        foodType: item.foodType,
                        photos: item.photos || []
                    }];

                    const result = await addToCart(
                        restaurant._id,
                        restaurant.name,
                        items,
                        restaurant.serviceType
                    );

                    if (!result.success) {
                        toast.error(result.error || 'Failed to add to cart');
                    }
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

    if (isLoading) return <RestaurantDetailsSkeleton />;
    if (error) return <div className="flex justify-center items-center h-screen">{error.message}</div>;
    if (!restaurant && !isLoading) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

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
            
            {/* Banner Image Section */}
            <div className="relative w-full h-full overflow-hidden mt-16">
                <img
                    src={restaurant?.imageUrl || 'https://via.placeholder.com/1920x600?text=Restaurant+Banner'}
                    alt={restaurant?.name || 'Restaurant'}
                    className={`w-full h-full object-cover ${!restaurant?.online ? 'grayscale' : ''}`}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                        {restaurant?.name || 'Restaurant'}
                    </h1>
                </div>
            </div>

            {/* Restaurant Info Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 -mt-16 relative z-10 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            {restaurant?.description && (
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4">
                                {restaurant?.distance !== null && restaurant?.distance !== "" && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        {restaurant.distance} km away
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 ${restaurant?.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        <span className={`w-2 h-2 rounded-full ${restaurant?.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        {restaurant?.online ? 'Open' : 'Closed'}
                                    </span>
                                    {restaurant?.operatingHours?.openTime && restaurant?.operatingHours?.closeTime && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {restaurant.operatingHours.openTime} - {restaurant.operatingHours.closeTime}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Section */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8">Menu</h2>
                    <HotelMenu
                        menu={menu}
                        onAddToCart={handleAddToCart}
                        isItemInCart={isItemInCart}
                        restaurantOnline={restaurant?.online}
                    />
                </div>
            </div>
        </>
    );
};

export default HotelDetails;
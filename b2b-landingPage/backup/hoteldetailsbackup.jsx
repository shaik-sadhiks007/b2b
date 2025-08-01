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
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantDetails } from './Home';
import { useLocationContext } from '../context/LocationContext';

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
    const { location } = useLocationContext();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['restaurantAndMenu', id, location],
        queryFn: fetchRestaurantDetails,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const restaurant = data?.restaurantData;
    const menu = data?.menuData;

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

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prevCategories => {
            if (prevCategories.includes(categoryId)) {
                return prevCategories.filter(id => id !== categoryId);
            }
            return [...prevCategories, categoryId];
        });
    };

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
            basePrice: Number(item.basePrice),
            packagingCharges: Number(item.packagingCharges),
            totalPrice: Number(item.totalPrice),
            isVeg: item.isVeg,
            photos: item.photos || []
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
                        basePrice: Number(item.basePrice),
                        packagingCharges: Number(item.packagingCharges),
                        totalPrice: Number(item.totalPrice),
                        isVeg: item.isVeg,
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
    if (isError) return <div className="flex justify-center items-center h-screen">{error.message}</div>;
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
            <div className="mt-16">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full">
                        <div className="bg-white">
                            <img
                                src={restaurant?.imageUrl || 'https://via.placeholder.com/800x400?text=Restaurant'}
                                alt={restaurant?.name || 'Restaurant'}
                                className={`w-full h-64 object-cover ${!restaurant?.online ? 'grayscale' : ''}`}
                            />
                            <div className="p-6">
                                <h1 className="text-3xl font-bold mb-2">{restaurant?.name || 'Restaurant'}</h1>
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
                                                                    <div key={item._id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                                                                        <div className="flex gap-4 flex-1">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                                                                                        <span className={`w-1.5 h-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
                                                                                    </span>
                                                                                    <h5 className="font-medium">{item.name}</h5>
                                                                                    {!item.inStock && (
                                                                                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                                                                            Out of Stock
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {item?.description && (
                                                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                                        {item.description}
                                                                                    </p>
                                                                                )}
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
                                                                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                                                                                {item?.photos?.length > 0 ? (
                                                                                    <img
                                                                                        src={item.photos[0]}
                                                                                        alt={item.name}
                                                                                        className={`w-full h-full object-cover ${(!restaurant?.online || !item.inStock) ? 'grayscale' : ''}`}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                                                                        <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleAddToCart(item)}
                                                                            disabled={!restaurant?.online || !item.inStock}
                                                                            className={`w-full md:w-[160px] md:self-center px-4 py-2 ${
                                                                                !restaurant?.online || !item.inStock
                                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                                    : isItemInCart(item._id)
                                                                                        ? 'bg-green-600 text-white'
                                                                                        : 'border border-green-600 text-green-600 hover:bg-green-700 hover:text-white'
                                                                            } rounded transition-colors`}
                                                                        >
                                                                            {!restaurant?.online ? 'CLOSED' : !item.inStock ? 'OUT OF STOCK' : isItemInCart(item._id) ? 'GO TO CART' : 'ADD'}
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
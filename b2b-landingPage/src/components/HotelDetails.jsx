import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const HotelDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotelData } = location.state || {};
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);

    // Menu data structure based on the provided data
    const menuCategories = [
        {
            id: 'desserts',
            name: 'Desserts',
            isExpanded: true,
            subcategories: [
                {
                    id: 'ice-cream',
                    name: 'Ice Cream',
                    items: [
                        { id: 1, name: 'Vanilla Ice Cream', customisable: true, basePrice: "99", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "100.00", packagingCharges: "1", inStock: true },
                        { id: 2, name: 'Chocolate Ice Cream', customisable: true, basePrice: "119", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "120.00", packagingCharges: "1", inStock: true },
                        { id: 3, name: 'Strawberry Ice Cream', customisable: true, basePrice: "109", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "110.00", packagingCharges: "1", inStock: true }
                    ]
                },
                {
                    id: 'ice-cream2',
                    name: 'Ice Cream2',
                    items: [
                        { id: 1, name: 'Vanilla Ice Cream2', customisable: true, basePrice: "99", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "100.00", packagingCharges: "1", inStock: true },
                        { id: 2, name: 'Chocolate Ice Cream2', customisable: true, basePrice: "119", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "120.00", packagingCharges: "1", inStock: true },
                        { id: 3, name: 'Strawberry Ice Cream2', customisable: true, basePrice: "109", description: "description", isVeg: true, photos: [], serviceType: "Delivery", totalPrice: "110.00", packagingCharges: "1", inStock: true }
                    ]
                }
            ]
        }
    ];

    if (!hotelData) {
        navigate('/');
        return null;
    }

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const toggleSubcategory = (subcategoryId) => {
        setExpandedSubcategory(expandedSubcategory === subcategoryId ? null : subcategoryId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2">
                            <li>
                                <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
                            </li>
                            <li><span className="text-gray-400 mx-2">/</span></li>
                            <li>
                                <Link to="/" className="text-gray-500 hover:text-blue-600">Hotels</Link>
                            </li>
                            <li><span className="text-gray-400 mx-2">/</span></li>
                            <li className="text-gray-900 font-medium">{hotelData.name}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Hotel Header */}
            <div className="relative h-96">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("https://images.unsplash.com/photo-1734489325458-2322c069e33e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fHZpbGxhZ2UlMjBob3RlbHxlbnwwfHwwfHx8MA%3D%3D")` }}
                >
                </div>
                <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
                    <div className="text-white">
                        <h1 className="text-4xl font-bold mb-2">{hotelData.name}</h1>
                        <p className="text-lg mb-4">{hotelData.description}</p>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {hotelData.rating}
                            </span>
                            <span>{hotelData.distance} mi away</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Categories Accordion */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {menuCategories.map((category) => (
                        <div key={category.id} className="mb-4">
                            {/* Category Header */}
                            <div 
                                className="flex justify-between items-center p-4 bg-white rounded-lg shadow cursor-pointer"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-semibold">{category.name}</h3>
                                    <span className="text-gray-500">
                                        ({category.subcategories.reduce((total, sub) => total + sub.items.length, 0)})
                                    </span>
                                </div>
                                <svg 
                                    className={`w-6 h-6 transition-transform ${expandedCategory === category.id ? 'transform rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Subcategories */}
                            {expandedCategory === category.id && (
                                <div className="mt-2 space-y-4">
                                    {category.subcategories.map((subcategory) => (
                                        <div key={subcategory.id} className="bg-white rounded-lg shadow">
                                            {/* Subcategory Header */}
                                            <div 
                                                className="flex justify-between items-center p-4 cursor-pointer border-b"
                                                onClick={() => toggleSubcategory(subcategory.id)}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium">{subcategory.name}</h4>
                                                    <span className="text-gray-500">({subcategory.items.length})</span>
                                                </div>
                                                <svg 
                                                    className={`w-5 h-5 transition-transform ${expandedSubcategory === subcategory.id ? 'transform rotate-180' : ''}`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>

                                            {/* Subcategory Items */}
                                            {expandedSubcategory === subcategory.id && (
                                                <div className="p-4 space-y-4">
                                                    {subcategory.items.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-start border-b last:border-b-0 pb-4 last:pb-0">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    {/* Veg/Non-veg indicator */}
                                                                    <div className={`w-4 h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                                                                        <div className={`w-2 h-2 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                                                                    </div>
                                                                    <h4 className="font-medium">{item.name}</h4>
                                                                </div>
                                                                <div className="text-sm text-gray-600 mb-2">₹{item.totalPrice}</div>
                                                                <div className="text-xs text-gray-500 mb-2">Base Price: ₹{item.basePrice} + Packaging: ₹{item.packagingCharges}</div>
                                                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                                            </div>
                                                            <div className="ml-4 flex flex-col items-end">
                                                                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mb-2">
                                                                    <img 
                                                                        src={item.photos[0] || 'https://via.placeholder.com/150?text=Ice+Cream'} 
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <button 
                                                                    className={`${item.inStock ? 'bg-white text-green-600 border border-green-600 hover:bg-green-50' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} px-6 py-1 rounded font-medium`}
                                                                    disabled={!item.inStock}
                                                                >
                                                                    {item.inStock ? 'ADD' : 'OUT OF STOCK'}
                                                                </button>
                                                                {item.customisable && (
                                                                    <div className="text-xs text-gray-500 mt-1">Customisable</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HotelDetails; 
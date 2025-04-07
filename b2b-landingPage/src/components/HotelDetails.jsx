import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const HotelDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotelData } = location.state || {};

    if (!hotelData) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2">
                            <li>
                                <Link to="/" className="text-gray-500 hover:text-blue-600">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400 mx-2">/</span>
                            </li>
                            <li>
                                <Link to="/" className="text-gray-500 hover:text-blue-600">
                                    Hotels
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400 mx-2">/</span>
                            </li>
                            <li className="text-gray-900 font-medium">
                                {hotelData.name}
                            </li>
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

            {/* Menu Items */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8">Menu Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotelData.menu.breakfast.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-48">
                                <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                <p className="text-gray-600 mb-4">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-blue-600">₹{item.price}</span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        Order Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HotelDetails; 
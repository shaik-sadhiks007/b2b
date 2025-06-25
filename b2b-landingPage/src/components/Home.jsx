import LocationModal from "./LocationModal"
import LocationSuggestions from "./LocationSuggestions"
import CategoryShortcuts from "./CategoryShortcuts"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { openWindowWithToken } from "../utils/windowUtils"
import axios from 'axios'
import { API_URL } from '../api/api'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLocationContext } from '../context/LocationContext'
import logo from '../assets/b2bupdate.png'
import { useRestaurantDetails } from '../hooks/useRestaurantDetails'
import { useAllBusinesses } from '../hooks/useAllBusinesses'


const categories = [
    { name: "All", value: "all", icon: "🌐", color: "bg-indigo-100" },
    { name: "Restaurant", value: "restaurant", icon: "🏨", color: "bg-red-100" },
    { name: "Grocery", value: "grocery", icon: "🛒", color: "bg-green-100" },
    { name: "Medical", value: "medical", icon: "💊", color: "bg-blue-100" },
    // { name: "Electronics", value: "electronics", icon: "📱", color: "bg-yellow-100" },
    // { name: "Fashion", value: "fashion", icon: "👔", color: "bg-purple-100" },
    // { name: "Books", value: "books", icon: "📚", color: "bg-orange-100" },
    // { name: "Furniture", value: "furniture", icon: "🪑", color: "bg-teal-100" },
    // { name: "Sports", value: "sports", icon: "⚽", color: "bg-indigo-100" },
    // { name: "Add", icon: "➕", color: "bg-gray-100" },
]

const RestaurantCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-10">
        <div className="relative h-48 w-full">
            <Skeleton height={192} />
        </div>
        <div className="p-4">
            <Skeleton height={24} width="70%" className="mb-2" />
            <Skeleton height={16} count={2} className="mb-2" />
            <div className="flex items-center justify-between">
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={60} />
            </div>
        </div>
    </div>
);

const ErrorCard = ({ message }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-10 p-4">
        <div className="text-center py-8">
            <p className="text-xl text-red-600 mb-2">Oops! Something went wrong</p>
            <p className="text-gray-500">{message}</p>
        </div>
    </div>
);

const Home = () => {
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filteredBusinesses, setFilteredBusinesses] = useState([])
    const [hoveredRestaurantId, setHoveredRestaurantId] = useState(null)
    const navigate = useNavigate()
    const { location, setLocation, onAllowLocation: contextAllowLocation } = useLocationContext()

    // Use the custom hooks
    const { restaurant: hoveredRestaurant, menu: hoveredMenu } = useRestaurantDetails(hoveredRestaurantId)
    const { data: allBusinesses, isLoading: isLoadingBusinesses, error: businessesError } = useAllBusinesses()

    // Add localStorage change listener
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userLocation' && e.newValue) {
                try {
                    const parsedData = JSON.parse(e.newValue);
                    if (parsedData && parsedData.location) {
                        setLocation(parsedData.location);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    console.error("Error parsing location data:", error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load saved location on initial render
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            try {
                const { location: savedLoc } = JSON.parse(savedLocation);
                if (savedLoc) {
                    setLocation(savedLoc);
                }
            } catch (error) {
                console.error("Error parsing saved location:", error);
            }
        }
    }, []);

    useEffect(() => {
        // Check if user location exists in localStorage
        const savedLocation = localStorage.getItem('userLocation');
        if (!savedLocation) {
            // Show modal after 5 seconds
            const timer = setTimeout(() => {
                setShowLocationModal(true);
            }, 5000);

            // Cleanup timer if component unmounts
            return () => clearTimeout(timer);
        }
    }, []);

    // Function to fetch location suggestions
    const fetchLocationSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=5&addressdetails=1`
            )
            const data = await response.json()

            const formattedSuggestions = data.map(item => ({
                name: item.display_name.split(',')[0],
                address: item.display_name,
                lat: item.lat,
                lng: item.lon,
                fullDetails: item
            }))

            setSuggestions(formattedSuggestions)
        } catch (error) {
            console.error("Error fetching suggestions:", error)
            setSuggestions([])
        }
    }

    // Debounce the location input
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLocationSuggestions(location)
        }, 300)

        return () => clearTimeout(timer)
    }, [location])

    const handleAllowLocation = async () => {
        setIsLoading(true);
        try {
            await contextAllowLocation();
            setShowLocationModal(false);
        } catch (error) {
            console.error("Error getting location:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualAddress = () => {
        setShowLocationModal(false);
    };

    const handleLocationSelect = (suggestion) => {
        const locationData = {
            location: suggestion.address,
            coordinates: {
                lat: parseFloat(suggestion.lat),
                lng: parseFloat(suggestion.lng)
            }
        }
        localStorage.setItem('userLocation', JSON.stringify(locationData))
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new Event('locationUpdated'))
        setLocation(suggestion.address)
        setSuggestions([])
        setShowSuggestions(false)
    }

    // Add event listener for custom location update event
    useEffect(() => {
        const handleLocationUpdate = () => {
            const savedLocation = localStorage.getItem('userLocation')
            if (savedLocation) {
                const { location: savedLoc } = JSON.parse(savedLocation)
                setLocation(savedLoc)
                setShowSuggestions(false)
            }
        }

        window.addEventListener('locationUpdated', handleLocationUpdate)
        return () => window.removeEventListener('locationUpdated', handleLocationUpdate)
    }, [])

    const handleRestaurantClick = (restaurant) => {
        // Get the category from the restaurant or default to 'restaurant'
        const category = restaurant.category?.toLowerCase() || 'restaurant';
        navigate(`/${category}/${restaurant._id}`, { state: { restaurant } });
    };

    // Filter businesses when category changes
    useEffect(() => {
        if (allBusinesses) {
            if (selectedCategory === 'all') {
                setFilteredBusinesses(allBusinesses);
            } else {
                const filtered = allBusinesses.filter(business =>
                    business.category?.toLowerCase() === selectedCategory.toLowerCase()
                );
                setFilteredBusinesses(filtered);
            }
        }
    }, [selectedCategory, allBusinesses]);

    const renderRestaurants = () => {
        if (isLoadingBusinesses) {
            return Array(6).fill(0).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
            ));
        }

        if (businessesError) {
            return <ErrorCard message={businessesError.message} />;
        }

        if (filteredBusinesses.length === 0) {
            return (
                <div className="text-center py-8 col-span-full mt-5">
                    <p className="text-xl text-gray-600 mb-2">Sorry, we are not in your location yet 😔</p>
                    <p className="text-gray-500">Please try searching in a different area</p>
                </div>
            );
        }

        return filteredBusinesses.map((restaurant) => (
            <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow mt-10"
                onClick={() => handleRestaurantClick(restaurant)}
                onMouseEnter={() => setHoveredRestaurantId(restaurant._id)}
                onMouseLeave={() => setHoveredRestaurantId(null)}
                onTouchStart={() => setHoveredRestaurantId(restaurant._id)}
                onTouchEnd={() => setHoveredRestaurantId(null)}
            >
                <div className="relative h-48 w-full">
                    <img
                        src={restaurant.imageUrl || 'https://via.placeholder.com/300x200'}
                        loading="lazy"
                        alt={restaurant.name}
                        className={`w-full h-full object-cover ${!restaurant.online ? 'grayscale' : ''}`}
                    />
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {restaurant.serviceType === 'both' ? 'PICKUP & DELIVERY' : restaurant.serviceType}
                    </span>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
                    {/* <p className="text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p> */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            {restaurant.distance !== null && (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{restaurant.distance} km away</span>
                                </div>
                            )}
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${restaurant.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${restaurant.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                {restaurant.online ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        {restaurant.operatingHours?.openTime && restaurant.operatingHours?.closeTime ? (
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{restaurant.operatingHours.openTime} - {restaurant.operatingHours.closeTime}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Business opens on next day</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div>
            <Navbar
                location={location}
                setLocation={setLocation}
                suggestions={suggestions}
                onLocationSelect={handleLocationSelect}
                onAllowLocation={handleAllowLocation}
                onLoginClick={() => navigate('/login')}
            />

            <main className="container mx-auto pt-5 pb-20 flex flex-col items-center justify-center flex-grow">
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 mt-16">
                    {/* Logo */}
                    {/* <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">
                        B2B
                    </h1> */}

                    <img
                        src={logo}
                        loading="lazy"
                        alt="logo"
                        style={{
                            maxWidth: '100%',
                            width: '300px',
                            height: '300px',
                            objectFit: 'contain'
                        }}
                    />

                    {/* Search and Location Inputs Row */}
                    <div className="w-full flex flex-col md:flex-row gap-4 px-4 md:px-0">
                        {/* Location Input */}
                        <div className="relative flex-1">
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 150)
                                }}
                                placeholder="Enter your location"
                                className="w-full pl-10 pr-4 py-3 rounded-full border-2 focus:border-blue-500 text-lg outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

                            {/* Location suggestions */}
                            {showSuggestions && location && (
                                <LocationSuggestions
                                    suggestions={suggestions}
                                    onSelect={(suggestion) => {
                                        handleLocationSelect(suggestion)
                                        setShowSuggestions(false)
                                    }}
                                    onAllowLocation={() => {
                                        handleAllowLocation()
                                        setShowSuggestions(false)
                                    }}
                                />
                            )}
                        </div>

                        {/* Search Input */}
                        <div
                            className="flex-1 flex items-center gap-2 bg-white rounded-full border-2 px-4 py-3 cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => navigate('/search')}
                        >
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for Products..."
                                className="w-full outline-none text-gray-600"
                                readOnly
                            />
                        </div>
                    </div>

                </div>

                {/* Additional content to enable scrolling */}
                <div className="mt-8 w-full">
                    <div className="w-full max-w-4xl mx-auto">
                        {/* Category shortcuts */}
                        <CategoryShortcuts
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategorySelect={(category) => setSelectedCategory(category.value)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                            {renderRestaurants()}
                        </div>
                    </div>
                </div>
            </main>

            {/* Location modal */}
            <LocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onAllow={handleAllowLocation}
                onManualAddress={handleManualAddress}
                isLoading={isLoading}
            />

            {/* Footer */}

        </div>
    )
}

export default Home

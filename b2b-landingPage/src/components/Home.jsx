import LocationModal from "./LocationModal"
import LocationSuggestions from "./LocationSuggestions"
import CategoryShortcuts from "./CategoryShortcuts"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { openWindowWithToken } from "../utils/windowUtils"
import Footer from "./Footer"
import axios from 'axios'


const categories = [
    { name: "Hotel", icon: "🏨", color: "bg-red-100" },
    { name: "Grocery", icon: "🛒", color: "bg-green-100" },
    { name: "Medical", icon: "💊", color: "bg-blue-100" },
    { name: "Electronics", icon: "📱", color: "bg-yellow-100" },
    { name: "Fashion", icon: "👔", color: "bg-purple-100" },
    { name: "Books", icon: "📚", color: "bg-orange-100" },
    { name: "Furniture", icon: "🪑", color: "bg-teal-100" },
    { name: "Sports", icon: "⚽", color: "bg-indigo-100" },
    // { name: "Add", icon: "➕", color: "bg-gray-100" },
]



const Home = () => {
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [location, setLocation] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

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

    useEffect(() => {
        // Check if it's the first visit
        const hasVisited = localStorage.getItem("hasVisited")
        if (!hasVisited) {
            // Show modal after 5 seconds
            const timer = setTimeout(() => {
                setShowLocationModal(true)
                localStorage.setItem("hasVisited", "true")
            }, 5000)

            // Cleanup timer if component unmounts
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAllowLocation = () => {
        setIsLoading(true)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Get location name using reverse geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`
                        )
                        const data = await response.json()

                        // Format the address
                        const address = data.address
                        const locationString = [
                            address.city || address.town || address.village,
                            address.state,
                            address.country
                        ]
                            .filter(Boolean)
                            .join(", ")

                        setLocation(locationString)
                        setShowLocationModal(false)
                    } catch (error) {
                        console.error("Error getting location:", error)
                        // Don't set error message in location field
                        setShowLocationModal(false)
                    } finally {
                        setIsLoading(false)
                    }
                },
                (error) => {
                    console.error("Error getting location:", error)
                    // Don't set error message in location field
                    setIsLoading(false)
                    setShowLocationModal(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            )
        } else {
            // Don't set error message in location field
            setIsLoading(false)
            setShowLocationModal(false)
        }
    }

    const handleManualAddress = () => {
        setShowLocationModal(false)
    }

    const handleLocationSelect = (suggestion) => {
        const locationData = {
            location: suggestion.address,
            coordinates: {
                lat: parseFloat(suggestion.lat),
                lng: parseFloat(suggestion.lng)
            }
        }
        localStorage.setItem('userLocation', JSON.stringify(locationData))
        setLocation(suggestion.address)
        setSuggestions([])
        setShowSuggestions(false)
    }

    const handleServiceProviderClick = (provider) => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(provider.link, {
                state: {
                    hotelData: provider,
                    token
                }
            });
        } else {
            navigate('/login');
        }
    };

    const handleRestaurantClick = (restaurant) => {
        navigate(`/hotel/${restaurant._id}`, { state: { restaurant } });
    };

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/restaurants/public/all');
                setRestaurants(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch restaurants');
                setLoading(false);
                console.error('Error fetching restaurants:', err);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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

            <main className="container mx-auto pt-16 pb-20 flex flex-col items-center justify-center flex-grow">
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 mt-16">
                    {/* Logo */}
                    <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">
                        B2B
                    </h1>

                    {/* Search bar with suggestions */}
                    <div className="relative w-full">
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 150)
                            }}
                            placeholder="Enter delivery location"
                            className="w-full pl-10 pr-20 py-6 rounded-full border-2 focus:border-blue-500 text-lg outline-none"
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

                    {/* Category shortcuts */}
                    <CategoryShortcuts categories={categories} />
                </div>

                {/* Additional content to enable scrolling */}
                <div className="mt-32 w-full">
                    <div className="w-full max-w-4xl mx-auto">
                        {/* Tabs */}
                        <div className="grid grid-cols-4 mb-8">
                            {["all", "popular", "nearby", "offers"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-4 text-center transition-colors ${activeTab === tab
                                        ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "all" ? "Services" : ""}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        {activeTab === "all" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {restaurants.map((restaurant) => (
                                    <div
                                        key={restaurant._id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleRestaurantClick(restaurant)}
                                    >
                                        <div className="h-48 w-full">
                                            <img
                                                src={restaurant.imageUrl || 'https://via.placeholder.com/300x200'}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
                                            <p className="text-gray-600 mb-2">{restaurant.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-yellow-500">★ {restaurant.rating}</span>
                                                <span className="text-gray-500">{restaurant.distance} mi away</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "popular" && <div className="text-center py-8">Popular services will appear here</div>}
                        {activeTab === "nearby" && <div className="text-center py-8">Nearby services will appear here</div>}
                        {activeTab === "offers" && <div className="text-center py-8">Special offers will appear here</div>}
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
            <Footer />
        </div>
    )
}

export default Home

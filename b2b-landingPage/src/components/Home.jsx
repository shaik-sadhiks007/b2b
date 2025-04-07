import LocationModal from "./LocationModal"
import LocationSuggestions from "./LocationSuggestions"
import CategoryShortcuts from "./CategoryShortcuts"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { openWindowWithToken } from "../utils/windowUtils"
import Footer from "./Footer"


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

// Service providers data
const serviceProviders = [
    {
        name: "Panthulu Gaari mess",
        category: "Hotel",
        rating: 4.8,
        distance: 2.5,
        description: "Experience luxury and authentic Indian cuisine at Panthulu Gaari mess. Enjoy our premium dining service with a wide variety of options.",
        imageUrl: "data:image/jpeg;base64,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",
        link: "/hotel/taj-palace",
        menu: {

            "breakfast": [
                {
                    "name": "Idly & Vada Combo",
                    "description": "Soft Idlies served with crispy Vada, Sambar, and Chutney",
                    "price": 199,
                    "image": "https://images.unsplash.com/photo-1599785209707-81d6b98d2569?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                    "name": "Upma with Coconut Chutney",
                    "description": "Healthy and light Upma served with coconut chutney",
                    "price": 179,
                    "image": "https://upload.wikimedia.org/wikipedia/commons/9/9a/South_Indian_Upma.JPG"
                },
                {
                    "name": "Poori with Aloo Sabzi",
                    "description": "Fluffy Pooris served with delicious Aloo Sabzi",
                    "price": 229,
                    "image": "https://images.unsplash.com/photo-1673271202659-e430e4286bc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                    "name": "Crispy Masala Dosa",
                    "description": "Golden crispy Masala Dosa stuffed with spiced potato filling",
                    "price": 249,
                    "image": "https://images.unsplash.com/photo-1592361618773-32e4ee15a235?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
            ]
        }


    },
    {
        name: "Grand Hyatt Mumbai",
        category: "Business Hotel",
        rating: 4.6,
        distance: 3.1,
        description: "Modern business hotel with exceptional Indian cuisine and meeting facilities.",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        link: "/hotel/grand-hyatt",
        menu: {
            breakfast: [
                {
                    name: "Hyderabadi Biryani",
                    description: "Fragrant basmati rice with tender meat, aromatic spices, and raita",
                    price: 399,
                    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                    name: "Kebab Platter",
                    description: "Assorted kebabs with naan, mint chutney, and salad",
                    price: 449,
                    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
            ]
        }
    },
    {
        name: "Oberoi Udaivilas",
        category: "Heritage Hotel",
        rating: 4.9,
        distance: 5.2,
        description: "Luxury heritage hotel with royal Indian cuisine and stunning lake views.",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        link: "/hotel/oberoi",
        menu: {
            breakfast: [
                {
                    name: "Royal Thali",
                    description: "Dal Makhani, Paneer Butter Masala, Naan, and Raita",
                    price: 599,
                    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                    name: "Tandoori Platter",
                    description: "Mixed tandoori items with mint chutney and salad",
                    price: 699,
                    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
            ]
        }
    },
    {
        id: 4,
        name: "Mountain View Lodge",
        category: "Hotel",
        rating: 4.6,
        distance: 1.5,
        description: "Cozy mountain hotel with hearty breakfast",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
        link: "/hotel/mountain-view",
        menu: {
            breakfast: [
                { name: "Mountain Breakfast", price: 27, description: "Hearty breakfast for mountain activities" },
                { name: "Hiker's Breakfast", price: 25, description: "High-energy breakfast for outdoor activities" },
                { name: "Lodge Breakfast", price: 29, description: "Traditional lodge breakfast with local ingredients" }
            ]
        }
    },
    {
        id: 5,
        name: "City Center Hotel",
        category: "Hotel",
        rating: 4.7,
        distance: 0.9,
        description: "Modern hotel in the heart of the city",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
        link: "/hotel/city-center",
        menu: {
            breakfast: [
                { name: "Urban Breakfast", price: 26, description: "Modern city-style breakfast" },
                { name: "Express Breakfast", price: 22, description: "Quick breakfast for city commuters" },
                { name: "Luxury Breakfast", price: 34, description: "Premium breakfast with city views" }
            ]
        }
    },
    {
        id: 6,
        name: "Global Office Solutions",
        category: "Furniture",
        rating: 4.8,
        distance: 1.2,
        description: "Complete office furniture and workspace solutions",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Furniture",
        link: "https://www.google.com"
    },
    {
        id: 7,
        name: "MediSupply Pro",
        category: "Medical",
        rating: 4.9,
        distance: 0.5,
        description: "Professional medical supplies and equipment",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Medical",
        link: "https://www.google.com"
    },
    {
        id: 8,
        name: "Tech Hardware Hub",
        category: "Electronics",
        rating: 4.6,
        distance: 1.5,
        description: "B2B technology hardware and components",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Tech",
        link: "https://www.google.com"
    },
    {
        id: 9,
        name: "Wholesale Grocers",
        category: "Grocery",
        rating: 4.7,
        distance: 0.9,
        description: "Bulk grocery supplies for businesses",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Grocery",
        link: "https://www.google.com"
    },
    {
        id: 10,
        name: "Fashion Bulk",
        category: "Fashion",
        rating: 4.4,
        distance: 1.1,
        description: "Wholesale clothing and fashion accessories",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Fashion",
        link: "https://www.google.com"
    },
    {
        id: 11,
        name: "Sports Equipment Pro",
        category: "Sports",
        rating: 4.8,
        distance: 0.7,
        description: "Professional sports and fitness equipment supplier",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Sports",
        link: "https://www.google.com"
    },
    {
        id: 12,
        name: "Book Warehouse",
        category: "Books",
        rating: 4.6,
        distance: 1.3,
        description: "Wholesale books and educational materials",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Books",
        link: "https://www.google.com"
    },
    {
        id: 13,
        name: "Hotel Supplies Co",
        category: "Hotel",
        rating: 4.7,
        distance: 0.6,
        description: "Complete hotel and hospitality supplies",
        imageUrl: "https://placehold.co/400x300/e2e8f0/475569?text=Hotel",
        link: "https://www.google.com"
    }
]


const Home = () => {

    const [showLocationModal, setShowLocationModal] = useState(false)
    const [location, setLocation] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
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

    const handleRestaurantClick = (e) => {
        e.preventDefault(); // Prevent default navigation

        // Get the token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login');
            return;
        }

        // Use the utility function to open window and transfer token
        const targetWindow = openWindowWithToken("http://localhost:5175", "http://localhost:5175");

        if (!targetWindow) {
            // Handle case where window couldn't be opened or no token was found
            navigate('/login');
        }
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
                                {serviceProviders.map((provider) => (
                                    <a
                                        href={provider.link}
                                        onClick={(e) => handleServiceProviderClick(provider)}
                                        key={provider.name}
                                        className="block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div
                                            className="h-40 bg-gray-200 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${provider.imageUrl})` }}
                                        ></div>
                                        <div className="p-4">
                                            <h3 className="font-semibold">{provider.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {provider.category} • {provider.rating} ★ • {provider.distance} mi
                                            </p>
                                            <p className="text-sm mt-2">{provider.description}</p>
                                        </div>
                                    </a>
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

import { useState, useEffect, useCallback } from 'react'
import { Search, Star, MapPin, Clock, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLocationContext } from '../context/LocationContext'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../api/api';

const cuisines = [
  { name: 'Rice', img: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Ice Cream', img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWNlY3JlYW18ZW58MHx8MHx8fDA%3D' },
  { name: 'Idly', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWRsaXxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Dosa', img: 'https://images.unsplash.com/photo-1694849789325-914b71ab4075?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9zYXxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Biryani', img: 'https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D' },
  { name: 'Pizzas', img: 'https://img.freepik.com/free-photo/top-view-pepperoni-pizza-with-mushroom-sausages-bell-pepper-olive-corn-black-wooden_141793-2158.jpg' },
  // { name: 'Rolls', img: 'https://img.freepik.com/free-photo/close-up-chicken-wrap-with-vegetables_23-2148763775.jpg' },
  // { name: 'Burger', img: 'https://img.freepik.com/free-photo/fresh-tasty-burger_144627-27483.jpg' },
  // { name: 'Tea', img: 'https://img.freepik.com/free-photo/cup-tea-with-honey-lemon_23-2147877557.jpg' },
  // { name: 'Chinese', img: 'https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg' },
  // { name: 'Cake', img: 'https://img.freepik.com/free-photo/sweet-pastry-assortment_23-2147802380.jpg' },
]

function SearchPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('products')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRestaurantModal, setShowRestaurantModal] = useState(false)
  const [pendingAddItem, setPendingAddItem] = useState(null)
  const {
    carts,
    isItemInCart,
    addToCart,
    clearCart
  } = useCart();
  const {
    location,
    setLocation,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    fetchLocationSuggestions,
    onLocationSelect,
    onAllowLocation
  } = useLocationContext();

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Find if cart for this restaurant exists
    const cartForRestaurant = carts.find(c => c.restaurantId === item.restaurant.id)
    let items = []
    if (cartForRestaurant) {
      // If item exists, update quantity, else add
      const existingItem = cartForRestaurant.items.find(i => i.itemId === item.id)
      if (existingItem) {
        // Already in cart, navigate to cart page
        navigate('/cart')
        return
      } else {
        items = [...cartForRestaurant.items, {
          itemId: item.id,
          name: item.name,
          quantity: 1,
          basePrice: Number(item.price),
          packagingCharges: 0,
          totalPrice: Number(item.price),
          isVeg: item.isVeg
        }]
      }
    } else {
      items = [{
        itemId: item.id,
        name: item.name,
        quantity: 1,
        basePrice: Number(item.price),
        packagingCharges: 0,
        totalPrice: Number(item.price),
        isVeg: item.isVeg
      }]
    }

    const result = await addToCart(
      item.restaurant.id,
      item.restaurant.name,
      items,
      item.restaurant.photos || []
    )

    if (result.success) {
      toast.success('Item added to cart')
    } else if (result.error === 'Different restaurant') {
      setPendingAddItem(item)
      setShowRestaurantModal(true)
    } else {
      toast.error('Failed to add to cart')
    }
  }

  const handleRestaurantModalResponse = async (resetCart) => {
    if (resetCart) {
      try {
        await clearCart()
        setShowRestaurantModal(false)
        // Retry add to cart
        if (pendingAddItem) {
          setTimeout(() => handleAddToCart(pendingAddItem), 100)
        }
      } catch (err) {
        toast.error('Failed to reset cart')
      }
    } else {
      setShowRestaurantModal(false)
      setPendingAddItem(null)
    }
  }

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      // Get location from localStorage
      const savedLocation = localStorage.getItem('userLocation')
      let params = {
        query: query,
        type: searchType
      }

      // Add coordinates if available
      if (savedLocation) {
        const { coordinates } = JSON.parse(savedLocation)
        params.lat = coordinates.lat
        params.lng = coordinates.lng
      }

      const response = await axios.get(`${API_URL}/api/search`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setSearchResults(response.data.results)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to perform search')
    } finally {
      setIsLoading(false)
    }
  }

  // Create a debounced version of the search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      performSearch(query)
    }, 500),
    [searchType]
  )

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, searchType])

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No results found
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {result.type === 'business' ? (
              // Business Card
              <div 
                className="p-4 cursor-pointer"
                onClick={() => {
                  const category = result.category?.toLowerCase() || 'restaurant';
                  navigate(`/${category}/${result.id}`);
                }}
              >
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.name}
                      className={`w-full h-48 object-cover rounded-lg ${!result.online ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold text-center px-4">{result.name}</span>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{result.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{result.address.locality}, {result.address.city}</span>
                  {result.distance && <span className="text-sm text-gray-500">({result.distance} km)</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={16} />
                  <span>{result.operatingHours.openTime} - {result.operatingHours.closeTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${result.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {result.online ? 'Open' : 'Closed'}
                  </span>
                  <span className="text-sm">{result.serviceType}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {result.category}
                  </span>
                </div>
              </div>
            ) : (
              // Product Card
              <div className="p-4">
                <div 
                  className="aspect-w-16 aspect-h-9 mb-4 cursor-pointer"
                  onClick={() => {
                    const category = result.restaurant.category?.toLowerCase() || 'restaurant';
                    navigate(`/${category}/${result.restaurant.id}`);
                  }}
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.name}
                      className={`w-full h-48 object-cover rounded-lg ${!result.restaurant.online ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold text-center px-4">{result.name}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{result.name}</h3>
                  {result.isVeg && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Veg
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{result.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium">{result.category}</span>
                  {result.subcategory && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">Subcategory:</span>
                      <span className="text-sm font-medium">{result.subcategory}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">₹{result.price}</span>
                    <span className="text-sm text-gray-500">({result.foodType})</span>
                  </div>
                  <div 
                    className="flex flex-col items-end cursor-pointer"
                    onClick={() => {
                      const category = result.restaurant.category?.toLowerCase() || 'restaurant';
                      navigate(`/${category}/${result.restaurant.id}`);
                    }}
                  >
                    <span className="text-sm text-gray-500">{result.restaurant.name}</span>
                    {result.restaurant.distance && (
                      <span className="text-xs text-gray-400">{result.restaurant.distance} km away</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => isItemInCart(result.id) ? navigate('/cart') : handleAddToCart(result)}
                  disabled={!result.restaurant.online}
                  className={`w-full mt-4 px-4 py-2 ${
                    !result.restaurant.online
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isItemInCart(result.id)
                      ? 'bg-green-600 text-white'
                      : 'border border-green-600 text-green-600'
                  } rounded hover:bg-green-700 hover:text-white transition-colors`}
                >
                  {!result.restaurant.online 
                    ? 'RESTAURANT CLOSED' 
                    : isItemInCart(result.id) 
                    ? 'GO TO CART' 
                    : 'ADD TO CART'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar alwaysVisible />
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestaurantModalResponse(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes, Reset Cart
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 pt-24">
        <form onSubmit={handleSearch} className="mb-12 flex flex-col items-center gap-4">
          <div className="relative w-full max-w-3xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for businesses or products"
              className="w-full pl-12 pr-12 py-5 rounded-lg border border-gray-300 focus:border-black outline-none text-xl font-medium placeholder-gray-400 shadow-sm"
            />
            <button 
              type="button" 
              onClick={searchQuery ? handleClearSearch : handleSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {searchQuery ? <X size={28} /> : <Search size={28} />}
            </button>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSearchType('products')}
              className={`px-4 py-2 rounded-lg ${
                searchType === 'products'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setSearchType('business')}
              className={`px-4 py-2 rounded-lg ${
                searchType === 'business'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Businesses
            </button>
          </div>
        </form>

        {searchQuery ? (
          renderSearchResults()
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 ml-2">Popular Products</h2>
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {cuisines.map((cuisine) => (
                <div 
                  key={cuisine.name} 
                  className="flex flex-col items-center min-w-[90px] cursor-pointer"
                  onClick={() => {
                    setSearchQuery(cuisine.name);
                    performSearch(cuisine.name);
                  }}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm mb-2 hover:border-green-500 transition-colors">
                    <img
                      src={cuisine.img}
                      alt={cuisine.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-base font-medium text-gray-800 whitespace-nowrap">{cuisine.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default SearchPage 
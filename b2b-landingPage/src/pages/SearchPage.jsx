import { useState, useEffect, useCallback } from 'react'
import { Search, Star, MapPin, Clock, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLocationContext } from '../context/LocationContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import { useNavigate } from 'react-router-dom'

const cuisines = [
  { name: 'Biryani', img: 'https://img.freepik.com/free-photo/chicken-biryani-with-yogurt-dip_140725-1624.jpg' },
  { name: 'Pizzas', img: 'https://img.freepik.com/free-photo/top-view-pepperoni-pizza-with-mushroom-sausages-bell-pepper-olive-corn-black-wooden_141793-2158.jpg' },
  { name: 'Rolls', img: 'https://img.freepik.com/free-photo/close-up-chicken-wrap-with-vegetables_23-2148763775.jpg' },
  { name: 'Burger', img: 'https://img.freepik.com/free-photo/fresh-tasty-burger_144627-27483.jpg' },
  { name: 'Tea', img: 'https://img.freepik.com/free-photo/cup-tea-with-honey-lemon_23-2147877557.jpg' },
  { name: 'Chinese', img: 'https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg' },
  { name: 'Cake', img: 'https://img.freepik.com/free-photo/sweet-pastry-assortment_23-2147802380.jpg' },
  { name: 'Dessert', img: 'https://img.freepik.com/free-photo/assortment-ice-cream-balls_23-2148884485.jpg' },
  { name: 'North Indian', img: 'https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg' },
  { name: 'South Indian', img: 'https://img.freepik.com/free-photo/delicious-south-indian-food-idli-sambar-vada_23-2148884485.jpg' },
  { name: 'Sandwich', img: 'https://img.freepik.com/free-photo/fresh-tasty-sandwich_144627-27483.jpg' },
  { name: 'Ice cream', img: 'https://img.freepik.com/free-photo/colorful-ice-cream-balls-cone_23-2148884485.jpg' },
]

function SearchPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('products')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [cart, setCart] = useState([])
  const [showRestaurantModal, setShowRestaurantModal] = useState(false)
  const [pendingAddItem, setPendingAddItem] = useState(null)
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

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setCart([])
        return
      }
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
    } catch (err) {
      setCart([])
    }
  }

  const isItemInCart = (itemId) => {
    return cart.some(cartDoc => 
      cartDoc.items?.some(item => item.itemId === itemId)
    )
  }

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    console.log('Adding item to cart:', item)

    // Find if cart for this restaurant exists
    const cartForRestaurant = cart.find(c => c.restaurantId === item.restaurant.id)
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

    try {
      await axios.post('http://localhost:5000/api/cart', {
        restaurantId: item.restaurant.id,
        restaurantName: item.restaurant.name,
        items,
        photos: item.restaurant.photos || []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Refresh cart
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
      toast.success('Item added to cart')
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setPendingAddItem(item)
        setShowRestaurantModal(true)
      } else {
        toast.error('Failed to add to cart')
      }
    }
  }

  const handleRestaurantModalResponse = async (resetCart) => {
    if (resetCart) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCart([])
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
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: {
          query: query,
          type: searchType
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log('Search Results:', response.data.results)
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
              <div className="p-4">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={result.image || 'https://via.placeholder.com/400x225'}
                    alt={result.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{result.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{result.address.locality}, {result.address.city}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={16} />
                  <span>{result.operatingHours.openTime} - {result.operatingHours.closeTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
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
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={result.image || 'https://via.placeholder.com/400x225'}
                    alt={result.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
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
                  <span className="text-sm text-gray-500">{result.restaurant.name}</span>
                </div>
                <button
                  onClick={() => isItemInCart(result.id) ? navigate('/cart') : handleAddToCart(result)}
                  className={`w-full mt-4 px-4 py-2 ${
                    isItemInCart(result.id)
                      ? 'bg-green-600 text-white'
                      : 'border border-green-600 text-green-600'
                  } rounded hover:bg-green-700 hover:text-white transition-colors`}
                >
                  {isItemInCart(result.id) ? 'GO TO CART' : 'ADD TO CART'}
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
            <h2 className="text-2xl font-bold mb-6 ml-2">Popular Cuisines</h2>
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {cuisines.map((cuisine) => (
                <div key={cuisine.name} className="flex flex-col items-center min-w-[90px]">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm mb-2">
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
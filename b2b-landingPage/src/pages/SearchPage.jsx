import { useState, useEffect, useCallback, useContext, useRef} from 'react';
import { Search, Star, MapPin, Clock, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { HotelContext } from '../contextApi/HotelContextProvider';
import axios from 'axios';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';

function SearchPage() {
  const navigate = useNavigate();
  const { user } = useContext(HotelContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [searchResults, setSearchResults] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [pendingAddItem, setPendingAddItem] = useState(null);

  const {
    carts,
    isItemInCart,
    addToCart,
    clearCart,
  } = useCart();

  const hasFetched = useRef(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPopularItems();
    hasFetched.current = true;
  }, []);

  const getRandomItems = (items, count) => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const fetchPopularItems = async () => {
    try {
      setPopularLoading(true);
      const savedLocation = localStorage.getItem('userLocation');
      let params = {
        query: 'a',
        type: 'products',
      };

      if (savedLocation) {
        const { coordinates } = JSON.parse(savedLocation);
        params.lat = coordinates.lat;
        params.lng = coordinates.lng;
      }

      const response = await axios.get(`${API_URL}/api/search`, { params });
      const allItems = response.data.results || [];
      const products = allItems.filter(item => item.type !== 'business');
      setPopularItems(getRandomItems(products, 8));
    } catch (error) {
      console.error('Failed to fetch popular items:', error);
      toast.error('Unable to load popular items');
    } finally {
      setPopularLoading(false);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const savedLocation = localStorage.getItem('userLocation');
      let params = {
        query,
        type: searchType,
      };

      if (savedLocation) {
        const { coordinates } = JSON.parse(savedLocation);
        params.lat = coordinates.lat;
        params.lng = coordinates.lng;
      }

      const response = await axios.get(`${API_URL}/api/search`, { params });
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      performSearch(query);
    }, 500),
    [searchType]
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, searchType]);

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const cartForRestaurant = carts.find(c => c.restaurantId === item.restaurant?.id);
    let items = [];

    if (cartForRestaurant) {
      const existingItem = cartForRestaurant.items.find(i => i.itemId === item.id);
      if (existingItem) {
        navigate('/cart');
        return;
      } else {
        items = [...cartForRestaurant.items, {
          itemId: item.id,
          name: item.name,
          quantity: 1,
          totalPrice: Number(item.price),
          foodType: item.foodType,
        }];
      }
    } else {
      items = [{
        itemId: item.id,
        name: item.name,
        quantity: 1,
        totalPrice: Number(item.price),
        foodType: item.foodType,
      }];
    }

    const result = await addToCart(
      item.restaurant.id,
      item.restaurant.name,
      items,
      item.restaurant.serviceType
    );

    if (result.success) {
      toast.success('Item added to cart');
    } else if (result.error === 'Different restaurant') {
      setPendingAddItem(item);
      setShowRestaurantModal(true);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleRestaurantModalResponse = async (resetCart) => {
    if (resetCart) {
      try {
        await clearCart();
        setShowRestaurantModal(false);
        if (pendingAddItem) {
          setTimeout(() => handleAddToCart(pendingAddItem), 100);
        }
      } catch (err) {
        toast.error('Failed to reset cart');
      }
    } else {
      setShowRestaurantModal(false);
      setPendingAddItem(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No results found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold">{result.name}</h3>
              {result.price && (
                <p className="text-sm text-gray-600">₹{result.price}</p>
              )}
              <button
                onClick={() => handleAddToCart(result)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
              className={`px-4 py-2 rounded-lg ${searchType === 'products'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setSearchType('business')}
              className={`px-4 py-2 rounded-lg ${searchType === 'business'
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
            {popularLoading ? (
              <div className="text-gray-500">Loading popular items...</div>
            ) : (
              <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                {popularItems.map((item) =>
                  item && item.name ? (
                    <div
                      key={item.id}
                      className="flex flex-col items-center min-w-[90px] cursor-pointer"
                      onClick={() => {
                        setSearchQuery(item.name);
                        performSearch(item.name);
                      }}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm mb-2 hover:border-green-500 transition-colors">
                        {item.image || item.img ? (
                          <img
                            src={item.image || item.img}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <span className="text-base font-medium text-gray-800 whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default SearchPage;

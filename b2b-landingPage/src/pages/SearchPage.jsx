import { useState, useEffect, useCallback, useContext, useRef} from 'react';
import { Search, Star, MapPin, Clock, X, Tag, ChevronDown } from 'lucide-react';
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
  const [updatingItems, setUpdatingItems] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isResettingCart, setIsResettingCart] = useState(false);

  const {
    carts,
    isItemInCart,
    addToCart,
    clearCart,
    updateCartItem,
    removeCartItem,
  } = useCart();

  // Quantity options for loose items (same as HotelDetails.jsx)
  const quantityOptions = [
    { value: 100, label: '100' },
    { value: 150, label: '150' },
    { value: 250, label: '250' },
    { value: 300, label: '300' },
    { value: 500, label: '500' },
    { value: 750, label: '750' },
    { value: 1000, label: '1000' },
  ];

  const calculatePrice = (basePrice, quantity, unit) => {
    if (unit === 'liter') {
      // Convert liter price to ml (divide by 1000)
      return (basePrice * quantity / 1000).toFixed(2);
    }
    return (basePrice * quantity / 1000).toFixed(2);
  };

  const getQuantityLabel = (value, unit) => {
    if (unit === 'ltr') {
      return `${value} ml`; // Show milliliters for liquid items
    }
    return `${value} g`; // Show grams for solid items
  };

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

  // Reset selectedQuantities when new search results come in
  useEffect(() => {
    if (searchResults.length > 0) {
      const newSelectedQuantities = {};
      searchResults.forEach(item => {
        if (item.loose) {
          newSelectedQuantities[item.id] = 100; // Default to 100g/100ml
        }
      });
      console.log('Setting default quantities for search results:', newSelectedQuantities);
      setSelectedQuantities(prev => ({
        ...prev,
        ...newSelectedQuantities
      }));
    }
  }, [searchResults.length]);

  // Initialize selectedQuantities for popular items
  useEffect(() => {
    if (popularItems.length > 0) {
      const newSelectedQuantities = {};
      popularItems.forEach(item => {
        if (item.loose) {
          newSelectedQuantities[item.id] = 100; // Default to 100g/100ml
        }
      });
      console.log('Setting default quantities for popular items:', newSelectedQuantities);
      setSelectedQuantities(prev => ({
        ...prev,
        ...newSelectedQuantities
      }));
    }
  }, [popularItems.length]);

  const getCartItem = (itemId) => {
    return carts[0]?.items?.find(item =>
      item.itemId === itemId || item.itemId === itemId.toString()
    );
  };

  const handleQuantitySelect = (itemId, quantity) => {
    console.log('Setting quantity for item', itemId, 'to', quantity);
    setSelectedQuantities(prev => {
      const newState = {
        ...prev,
        [itemId]: quantity
      };
      console.log('New selectedQuantities state:', newState);
      return newState;
    });
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (!item.inStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (isItemInCart(item.id)) {
      return;
    }

    // Don't show modal if we're in the middle of resetting cart
    if (!isResettingCart && carts.length > 0 && carts[0].restaurantId._id !== item.restaurant?.id) {
      setPendingAddItem(item);
      setShowRestaurantModal(true);
      return;
    }

    const selectedQuantity = item.loose ? (selectedQuantities[item.id] || 100) : 1;
    console.log('Adding to cart - item:', item.id, 'selectedQuantity:', selectedQuantity, 'selectedQuantities state:', selectedQuantities);
    const quantityLabel = item.loose
      ? getQuantityLabel(selectedQuantity, item.unit)
      : `${item.unitValue || 1} ${item.unit || 'unit'}`;
    const calculatedPrice = item.loose
      ? calculatePrice(item.price, selectedQuantity, item.unit)
      : item.price;

    const items = [{
      itemId: item.id,
      name: item.name,
      quantity: 1,
      quantityValue: selectedQuantity,
      quantityLabel: quantityLabel,
      totalPrice: Number(calculatedPrice),
      foodType: item.foodType,
      photos: item.image ? [item.image] : [],
      unit: item.unit || 'unit',
      unitValue: item.unitValue || 1,
      loose: item.loose || false,
      category: item.restaurant?.category || 'Restaurant'
    }];

    const result = await addToCart(
      item.restaurant.id,
      item.restaurant.name,
      items,
      item.restaurant.serviceType
    );

    if (!result.success) {
      toast.error(result.error || "Failed to add to cart");
    } else {
      toast.success('Item added to cart');
      // Reset the flag after successful addition
      setIsResettingCart(false);
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    if (!carts.length || !carts[0]) {
      toast.error("Cart not loaded yet");
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      const item = getCartItem(itemId);
      if (!item) {
        toast.error("Item not in cart");
        return;
      }

      const newQuantity = item.quantity + change;
      if (newQuantity < 1) {
        toast.error("Minimum quantity is 1");
        return;
      }

      const result = await updateCartItem(itemId, newQuantity);
      if (!result.success) {
        toast.error(result.error || 'Failed to update quantity');
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      const result = await removeCartItem(itemId);
      if (result.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRestaurantModalResponse = async (resetCart) => {
    if (resetCart) {
      try {
        // Set flag to prevent modal from appearing again
        setIsResettingCart(true);
        
        // Close modal first
        setShowRestaurantModal(false);
        setPendingAddItem(null);
        
        // Clear cart
        await clearCart();
        
        // Add item to cart after cart is cleared
        if (pendingAddItem) {
          handleAddToCart(pendingAddItem);
        }
      } catch (err) {
        toast.error('Failed to reset cart');
        // Reset flag and reopen modal if there's an error
        setIsResettingCart(false);
        setShowRestaurantModal(true);
        setPendingAddItem(pendingAddItem);
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

  const handleRestaurantClick = (restaurant) => {
    // Check if restaurant has a subdomain
    if (restaurant.subdomain) {
      const currentHost = window.location.hostname;
      console.log('Current hostname:', currentHost);
      console.log('Restaurant subdomain:', restaurant.subdomain);
      console.log('Restaurant data:', restaurant);

      let targetUrl;
      
      if (currentHost === 'localhost' || currentHost.includes('localhost')) {
        // For localhost, navigate to /category/id
        const category = restaurant.category?.toLowerCase() || 'restaurant';
        targetUrl = `/${category}/${restaurant.id}`;
        console.log('Localhost navigation to:', targetUrl);
        navigate(targetUrl, { state: { restaurant } });
      } else if (currentHost === 'customer.test.shopatb2b.com') {
        // For customer.test.shopatb2b.com, navigate to subdomain.test.shopatb2b.com
        targetUrl = `https://${restaurant.subdomain}.test.shopatb2b.com`;
        console.log('Test domain navigation to:', targetUrl);
        window.location.href = targetUrl;
      } else if (currentHost === 'www.shopatb2b.com') {
        // For www.shopatb2b.com, navigate to subdomain.shopatb2b.com
        targetUrl = `https://${restaurant.subdomain}.shopatb2b.com`;
        console.log('Production domain navigation to:', targetUrl);
        window.location.href = targetUrl;
      } else {
        // Fallback for other domains
        const category = restaurant.category?.toLowerCase() || 'restaurant';
        targetUrl = `/${category}/${restaurant.id}`;
        console.log('Fallback navigation to:', targetUrl);
        navigate(targetUrl, { state: { restaurant } });
      }
    } else {
      // No subdomain, use regular navigation
      const category = restaurant.category?.toLowerCase() || 'restaurant';
      console.log('No subdomain, regular navigation to:', `/${category}/${restaurant.id}`);
      navigate(`/${category}/${restaurant.id}`, { state: { restaurant } });
    }
  };

  const renderItemActions = (item) => {
    if (!item.inStock) {
      return <span className="text-red-500 text-sm">Out of Stock</span>;
    }

    const cartItem = getCartItem(item.id);
    const isUpdating = updatingItems[item.id];
    const selectedQuantity = selectedQuantities[item.id] || 100;
    console.log('Rendering actions for item:', item.id, 'selectedQuantity:', selectedQuantity, 'selectedQuantities state:', selectedQuantities);
    const displayPrice = item.loose ?
      (cartItem ? cartItem.totalPrice : calculatePrice(item.price, selectedQuantity, item.unit))
      : null;

    if (cartItem) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.id, -1);
              }}
              className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={isUpdating}
            >
              -
            </button>
            <span className="w-6 text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(item.id, 1);
              }}
              className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={isUpdating}
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(item.id);
              }}
              className="text-red-500 hover:text-red-700 ml-2 text-sm disabled:opacity-50"
              disabled={isUpdating}
            >
              Remove
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {cartItem.quantityLabel && (
              <span>Size: {cartItem.quantityLabel}</span>
            )}
            {displayPrice && (
              <span className="block">Price: ₹{displayPrice}</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {item.loose && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">₹{displayPrice}</span>
            <select
              value={selectedQuantity}
              onChange={(e) => handleQuantitySelect(item.id, parseInt(e.target.value))}
              className="text-xs p-1 border rounded"
              onClick={(e) => e.stopPropagation()}
            >
              {quantityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {getQuantityLabel(option.value, item.unit)}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Add to Cart
        </button>
      </div>
    );
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
        {searchResults.map((result) => {
          const isRestaurant = searchType === 'business' || result.type === 'restaurant';
          if (isRestaurant) {
            return (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleRestaurantClick(result)}
              >
                <div className="relative h-48 w-full">
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      {result.name}
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {result.serviceType === 'both' ? 'PICKUP & DELIVERY' : (result.serviceType || 'Unknown')}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.online ? 'bg-green-500' : 'bg-gray-500'} mr-1`}></span>
                      {result.online ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{result.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={14} />
                    <span>
                      {result.address
                        ? (result.address.fullAddress ||
                          `${result.address.streetAddress || ''} ${result.address.city || ''} ${result.address.state || ''}`.trim() ||
                          'Address not available')
                        : 'Address not available'}
                    </span>
                  </div>
                  {result.operatingHours && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock size={14} />
                      <span>
                        {result.operatingHours.openTime} - {result.operatingHours.closeTime}
                      </span>
                    </div>
                  )}
                  {typeof result.distance === 'number' && (
                    <div className="text-xs text-gray-500">
                      {result.distance.toFixed(1)} km away
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Product result
          return (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full">
                {result.image ? (
                  <img 
                    src={result.image} 
                    alt={result.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    {result.name}
                  </div>
                )}
                {result.restaurant && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {result.restaurant.serviceType === 'both' ? 'PICKUP & DELIVERY' : result.restaurant.serviceType}
                    </span>
                  </div>
                )}
                {result.restaurant && (
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.restaurant.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.restaurant.online ? 'bg-green-500' : 'bg-gray-500'} mr-1`}></span>
                      {result.restaurant.online ? 'Open' : 'Closed'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{result.name}</h3>
                
                {result.restaurant && (
                  <div className="mb-3">
                    <h4 
                      className="font-medium text-gray-800 mb-1 cursor-pointer hover:text-blue-600"
                      onClick={() => handleRestaurantClick(result.restaurant)}
                    >
                      {result.restaurant.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin size={14} />
                      <span>
                        {result.restaurant.address ? 
                          (result.restaurant.address.fullAddress || 
                           `${result.restaurant.address.streetAddress || ''} ${result.restaurant.address.city || ''} ${result.restaurant.address.state || ''}`.trim() || 
                           'Address not available') 
                          : 'Address not available'}
                      </span>
                    </div>
                    {result.restaurant.operatingHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>
                          {result.restaurant.operatingHours.openTime} - {result.restaurant.operatingHours.closeTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-lg font-semibold text-green-600">
                    ₹{result.price}
                    {result.loose && (
                      <span className="text-sm text-gray-500 ml-1">
                        / {result.unit === 'liter' ? 'liter' : 'kg'}
                      </span>
                    )}
                  </p>
                  {result.loose && (
                    <p className="text-sm text-gray-500">
                      ({result.unitValue} {result.unit} available)
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  {renderItemActions(result)}
                </div>
              </div>
            </div>
          );
        })}
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
                        {item.image  ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            {item.name}
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

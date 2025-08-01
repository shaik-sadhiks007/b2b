import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { useRestaurantDetails } from "../hooks/useRestaurantDetails";
import HotelMenu from "./HotelMenu";
import { Search, Tag, ChevronDown } from "lucide-react";

const RestaurantDetailsSkeleton = () => (
  <div className="mt-24">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full">
        <div className="bg-white border rounded-lg overflow-hidden">
          <Skeleton height={360} />
          <div className="p-6">
            <Skeleton height={36} width="70%" className="mb-2" />
            <Skeleton count={2} className="mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton width={100} height={20} />
              <Skeleton width={80} height={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HotelDetails = (props) => {
  const params = useParams();
  const id = props.id || params.id;
  const navigate = useNavigate();
  const { carts, addToCart, isItemInCart, fetchCart, clearCart, updateCartItem, removeCartItem } = useCart();
  const { user } = useContext(HotelContext);
  const { restaurant, menu, isLoading, error } = useRestaurantDetails(id);

  const [pendingAddItem, setPendingAddItem] = useState(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [triggerSearchOnTextUpdate, setTriggerSearchOnTextUpdate] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentItemOffers, setCurrentItemOffers] = useState([]);
  const [selectedItemForOffer, setSelectedItemForOffer] = useState(null);

  const isPantulugariMessSubdomain = useMemo(() => {
    return window.location.hostname === "pantulugaarimess.shopatb2b.com";
  }, []);
  const [showClosingSoonPopup, setShowClosingSoonPopup] = useState(false);
  
  const quantityOptions = [
    { value: 100, label: '100' },
    { value: 150, label: '150' },
    { value: 250, label: '250' },
    { value: 300, label: '300' },
    { value: 500, label: '500' },
    { value: 750, label: '750' },
    { value: 1000, label: '1000' },
  ];

  const calculatePrice = (basePrice, quantity) => {
    return (basePrice * quantity / 1000).toFixed(2);
  };

  const popularItems = useMemo(() => {
    if (!menu || menu.length === 0) return [];
    const allItems = menu.flatMap(category =>
      category.subcategories.flatMap(sub =>
        sub.items?.map(item => ({
          name: item.name,
          image: item.photos?.[0] || "https://via.placeholder.com/80?text=Item",
          totalPrice: item.totalPrice,
          offers: item.offers || [],
          unit: item.unit || 'unit',
          unitValue: item.unitValue || 1
        }))
      )
    );
    const uniqueItems = Array.from(
      new Map(allItems.map(item => [item.name.toLowerCase(), item])).values()
    );
    return uniqueItems.slice(0, 6);
  }, [menu]);

  const randomPopularItems = useMemo(() => {
    if (!menu || menu.length === 0) return [];
    const allItems = menu.flatMap(category =>
      category.subcategories.flatMap(sub =>
        sub.items?.map(item => ({
          ...item,
          image: item.photos?.[0] || "https://via.placeholder.com/80?text=Item"
        }))
      )
    );
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [menu]);

  useEffect(() => {
    if (menu) setFilteredMenu(menu);
  }, [menu]);

  useEffect(() => {
    if (user) fetchCart();
  }, [fetchCart, user]);

  useEffect(() => {
    if (triggerSearchOnTextUpdate) {
      handleSearch();
      setTriggerSearchOnTextUpdate(false);
    }
  }, [searchText, triggerSearchOnTextUpdate]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredMenu(menu);
    }
  }, [searchText, menu]);

  useEffect(() => {
    if (!restaurant?.operatingHours?.closeTime || !restaurant?.online) return;

    const checkClosingTime = () => {
      const now = new Date();
      const [closeHour, closeMinute] = restaurant.operatingHours.closeTime.split(":").map(Number);
      const closingTime = new Date();
      closingTime.setHours(closeHour, closeMinute, 0, 0);

      const diffInMs = closingTime - now;
      const diffInMinutes = diffInMs / (1000 * 60);

      if (diffInMinutes > 0 && diffInMinutes <= 30) {
        setShowClosingSoonPopup(true);
      }
    };

    checkClosingTime();

    const interval = setInterval(checkClosingTime, 60000);
    return () => clearInterval(interval);
  }, [restaurant]);

  const getCartItem = (itemId) => {
    return carts[0]?.items?.find(item => 
      item.itemId === itemId || item.itemId === itemId.toString()
    );
  };

  const handleQuantitySelect = (itemId, quantity) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    if (!item.inStock) {
      toast.error("This item is out of stock");
      return;
    }
    if (isItemInCart(item._id)) {
      return;
    }
    if (carts.length > 0 && carts[0].restaurantId._id !== restaurant._id) {
      setPendingAddItem(item);
      setShowRestaurantModal(true);
      return;
    }

    const selectedQuantity = item.loose ? (selectedQuantities[item._id] || 100) : 1;
    const quantityLabel = item.loose 
      ? (quantityOptions.find(q => q.value === selectedQuantity)?.label + ' grams')
      : `${item.unitValue} ${item.unit}`;
    const calculatedPrice = item.loose 
      ? calculatePrice(item.totalPrice, selectedQuantity)
      : item.totalPrice;

    const items = [{
      itemId: item._id,
      name: item.name,
      quantity: 1,
      quantityValue: selectedQuantity,
      quantityLabel: quantityLabel,
      totalPrice: Number(calculatedPrice),
      foodType: item.foodType,
      photos: Array.isArray(item.photos) ? item.photos.filter(p => typeof p === 'string') : [],
      unit: item.unit || 'unit',
      unitValue: item.unitValue || 1
    }];

    const result = await addToCart(
      restaurant._id,
      restaurant.name,
      items,
      restaurant.serviceType
    );

    if (!result.success) {
      toast.error(result.error || "Failed to add to cart");
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

      const originalPricePerKg = (item.totalPrice * 1000) / item.quantityValue;
      const calculatedPrice = calculatePrice(originalPricePerKg, item.quantityValue);
      
      const result = await updateCartItem(itemId, newQuantity, {
        totalPrice: calculatedPrice
      });
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

  const handleOpenOfferModal = (item) => {
    setSelectedItemForOffer(item);
    setCurrentItemOffers(item.offers || []);
    setShowOfferModal(true);
  };

 const renderItemActions = (item) => {
  if (!item.inStock) {
    return <span className="text-red-500 text-sm">Out of Stock</span>;
  }

  const cartItem = getCartItem(item._id);
  const isUpdating = updatingItems[item._id];
  const selectedQuantity = selectedQuantities[item._id] || 1000;
  const displayPrice = cartItem ? 
    cartItem.totalPrice : 
    calculatePrice(item.totalPrice, selectedQuantity);
  
  if (cartItem) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(item._id, -1);
            }}
            disabled={isUpdating}
            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="w-6 text-center">
            {isUpdating ? <Skeleton width={20} /> : cartItem.quantity}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(item._id, 1);
            }}
            disabled={isUpdating}
            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem(item._id);
            }}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-700 ml-2 text-sm disabled:opacity-50"
          >
            Remove
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {cartItem.quantityLabel && (
            <span>Size: {cartItem.quantityLabel}</span>
          )}
          <span className="block">Price: ₹{displayPrice}</span>
         
          
        </div>
      </div>
    );
  }

  // Check if item has offers
  const hasOffers = item.offers && item.offers.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
           {item.loose && (
          <span className="text-sm font-medium">₹{displayPrice}</span>
        )}
          {!item.loose && (
            <span className="text-xs text-gray-500 block">
              {item.unitValue} {item.unit}
            </span>
          )}
        </div>
        {/* Only show quantity dropdown if item.loose is true */}
        {item.loose && (
          <select
            value={selectedQuantity}
            onChange={(e) => handleQuantitySelect(item._id, parseInt(e.target.value))}
            className="text-xs p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {quantityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {hasOffers ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenOfferModal(item);
          }}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center justify-center gap-1"
        >
          <Tag size={14} />
          <span>Options</span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Add
        </button>
      )}
    </div>
  );
};

  const handleRestaurantModalResponse = async (resetCart) => {
    if (resetCart) {
      await clearCart();
      if (pendingAddItem) {
        await handleAddToCart(pendingAddItem);
        setPendingAddItem(null);
      }
    }
    setShowRestaurantModal(false);
  };

  const handleSearch = () => {
    const trimmed = searchText.trim().toLowerCase();
    if (!trimmed) {
      setFilteredMenu(menu);
      return;
    }

    const searchTerms = trimmed.split(/\s+/);
    const filtered = menu.map(categoryObj => {
      const matchedSubcategories = categoryObj.subcategories.map(sub => {
        const matchedItems = sub.items.filter(item =>
          searchTerms.every(term => item.name.toLowerCase().includes(term))
        );
        return { ...sub, items: matchedItems };
      }).filter(sub => sub.items.length > 0);

      return matchedSubcategories.length > 0
        ? { ...categoryObj, subcategories: matchedSubcategories }
        : null;
    }).filter(Boolean);

    setFilteredMenu(filtered);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (isLoading) return <RestaurantDetailsSkeleton />;
  if (error) return <div className="flex justify-center items-center h-screen">{error.message}</div>;
  if (!restaurant && !isLoading) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

  return (
    <>
      {showRestaurantModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Items already in Cart</h2>
            <p className="text-gray-600 mb-6">
              Your cart contains items from another restaurant. Would you like
              to reset your cart for adding items from this restaurant?
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

      {showOfferModal && selectedItemForOffer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Offers for {selectedItemForOffer.name}
            </h2>
            
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Regular Price</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700">₹{selectedItemForOffer.totalPrice}</span>
                    <span className="text-xs text-gray-500 block">
                      {selectedItemForOffer.unitValue} {selectedItemForOffer.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleAddToCart(selectedItemForOffer);
                      setShowOfferModal(false);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {currentItemOffers.length > 0 && (
                <>
                  <h3 className="font-medium mb-2">Special Offers</h3>
                  <div className="space-y-3">
                    {currentItemOffers.map((offer, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-yellow-800">{offer.title}</h4>
                          {offer.isActive && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">{offer.description}</p>
                        
                        {offer.offerType === 'percentage-off' && (
                          <p className="text-sm">
                            {offer.discountPercentage}% off - Now ₹{(selectedItemForOffer.totalPrice * (1 - offer.discountPercentage/100)).toFixed(2)}
                          </p>
                        )}
                        {offer.offerType === 'flat-rate' && (
                          <p className="text-sm">
                            Flat ₹{offer.flatDiscount} off - Now ₹{(selectedItemForOffer.totalPrice - offer.flatDiscount).toFixed(2)}
                          </p>
                        )}
                        {offer.offerType === 'bulk-purchase' && (
                          <p className="text-sm">
                            Buy {offer.minQuantity} for ₹{(selectedItemForOffer.totalPrice * offer.minQuantity * (1 - offer.discountPercentage/100)).toFixed(2)} ({offer.discountPercentage}% off)
                          </p>
                        )}
                        
                        <button
                          onClick={() => {
                            handleAddToCart(selectedItemForOffer);
                            setShowOfferModal(false);
                          }}
                          className="mt-3 w-full px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                        >
                          Add with Offer
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowOfferModal(false)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden mb-6 h-[500px] sm:h-[600px] md:h-[440px] relative flex justify-center items-center">
          <img
            src={restaurant?.imageUrl || "https://via.placeholder.com/800x300?text=Restaurant"}
            alt={restaurant?.name || "Restaurant"}
            className={`w-full h-full object-contain ${!restaurant?.online ? "grayscale" : ""}`}
          />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">{restaurant?.name || "Restaurant"}</h1>
          {restaurant?.description && (
            <p className="text-gray-500 text-sm max-w-xl mx-auto">{restaurant.description}</p>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl text-center font-bold mb-4">Menu</h2>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 shadow-md transition-all">
              <div className="flex items-center gap-2 flex-1">
                <Search size={20} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  Search
                </button>
                {searchText && (
                  <button
                    onClick={() => {
                      setSearchText('');
                      setFilteredMenu(menu);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-md hover:text-gray-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {inputFocused && searchText === '' && popularItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-2 p-4 z-50">
                <h3 className="text-lg font-semibold mb-3">Popular Products</h3>
                <div className="flex overflow-x-auto pb-2 gap-4 hide-scrollbar">
                  <div className="flex space-x-4">
                    {popularItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-32 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setSearchText(item.name);
                          setTriggerSearchOnTextUpdate(true);
                          setInputFocused(false);
                        }}
                      >
                        <span className="text-sm text-center font-medium whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.unitValue} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {showClosingSoonPopup && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-yellow-600 mb-2">Closing Soon</h3>
                <p className="text-gray-700 mb-4">This restaurant will close in less than 30 minutes. Please place your order soon!</p>
                <button
                  onClick={() => setShowClosingSoonPopup(false)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {isPantulugariMessSubdomain && randomPopularItems.length > 0 && (
            <div className="mt-16 bg-transprent border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
              <h3 className="text-xl font-semibold mb-4 text-center">Popular Products</h3>
              <div className="md:grid md:grid-cols-3 gap-6 hidden">
                {randomPopularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center text-center p-4 border rounded-md hover:shadow-md transition"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded mb-2"
                    />
                    <p className="text-sm font-medium mb-2">{item.name}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.unitValue} {item.unit}
                    </p>
                    {renderItemActions(item)}
                  </div>
                ))}
              </div>
              <div className="md:hidden overflow-x-auto pb-4">
                <div className="flex space-x-4 w-max">
                  {randomPopularItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center text-center p-4 border rounded-md hover:shadow-md transition w-48"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium mb-2">{item.name}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {item.unitValue} {item.unit}
                      </p>
                      {renderItemActions(item)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {filteredMenu == undefined || filteredMenu == null || filteredMenu.length === 0 ? (
            <div className="text-center text-gray-500 mt-6">
              {searchText ? `No items found matching "${searchText}"` : "No items available"}
            </div>
          ) : (
            <HotelMenu
              menu={Array.isArray(filteredMenu) ? filteredMenu : []}
              renderItemActions={renderItemActions}
              restaurantOnline={restaurant?.online}
              boldHeaders={true}
            />
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default HotelDetails;
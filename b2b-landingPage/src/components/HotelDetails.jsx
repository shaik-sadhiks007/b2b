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
import { useOffer } from "../context/OfferContext";

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
  const { getActiveOffersForItem } = useOffer();

  const [pendingAddItem, setPendingAddItem] = useState(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [triggerSearchOnTextUpdate, setTriggerSearchOnTextUpdate] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentItemOffers, setCurrentItemOffers] = useState([]);
  const [selectedItemForOffer, setSelectedItemForOffer] = useState(null);
  const [offersLoading, setOffersLoading] = useState(false);

  // Track which offers have been used (blur & disable)
  const [usedOffers, setUsedOffers] = useState(() => new Set());

  const isPantulugariMessSubdomain = useMemo(() => {
    return window.location.hostname === "pantulugaarimess.shopatb2b.com";
  }, []);
  const [showClosingSoonPopup, setShowClosingSoonPopup] = useState(false);

  const quantityOptions = [
    { value: 100, label: "100" },
    { value: 150, label: "150" },
    { value: 250, label: "250" },
    { value: 300, label: "300" },
    { value: 500, label: "500" },
    { value: 750, label: "750" },
    { value: 1000, label: "1000" },
  ];

  const calculatePrice = (basePrice, quantity, unit) => {
    if (unit === "liter") return (basePrice * quantity / 1000).toFixed(2);
    return (basePrice * quantity / 1000).toFixed(2);
  };

  const getQuantityLabel = (value, unit) => {
    if (unit === "ltr" || unit === "liter") return `${value} ml`;
    return `${value} g`;
  };

  const isOfferCartItem = (ci) =>
    ci?.pricingType === "bulk-price" || ci?.pricingType === "buy-x-get-y-free";

  const buildRegularCartItem = (menuItem, { looseQty, quantityLabel, totalPrice }) => ({
    itemId: menuItem._id,
    name: menuItem.name,
    quantity: 1,
    quantityValue: looseQty ?? menuItem.unitValue ?? 1,
    quantityLabel:
      quantityLabel ??
      (menuItem.loose ? `${menuItem.unitValue} ${menuItem.unit}` : `${menuItem.unitValue} ${menuItem.unit}`),
    totalPrice: Number(totalPrice ?? menuItem.totalPrice), // total price for this line (not unit price)
    foodType: menuItem.foodType,
    photos: Array.isArray(menuItem.photos) ? menuItem.photos.filter((p) => typeof p === "string") : [],
    unit: menuItem.unit || "unit",
    unitValue: menuItem.unitValue || 1,
    loose: !!menuItem.loose,
    pricingType: "regular",
  });

  // BULK PRICE: quantity = X, totalPrice = discountedPrice (price for the pack)
  const buildBulkPriceCartItem = (menuItem, offer) => {
    const qty = Number(offer.purchaseQuantity) || 1;
    return {
      itemId: menuItem._id,
      name: menuItem.name,
      quantity: qty, // send X quantity
      quantityValue: menuItem.unitValue || 1,
      quantityLabel: `(Offer: ${qty} for ₹${Number(offer.discountedPrice).toFixed(2)})`,
      totalPrice: Number(offer.discountedPrice), // price user pays for all X
      foodType: menuItem.foodType,
      photos: Array.isArray(menuItem.photos) ? menuItem.photos.filter((p) => typeof p === "string") : [],
      unit: menuItem.unit || "unit",
      unitValue: menuItem.unitValue || 1,
      loose: !!menuItem.loose,
      pricingType: "bulk-price",
      offerId: offer._id,
      packSize: qty,
      discountedPrice: Number(offer.discountedPrice),
    };
  };

  // BUY X GET Y: quantity = X + Y, totalPrice = unitPrice * X (pay only for X)
  const buildBxGyCartItem = (menuItem, offer) => {
    const buyQ = Number(offer.buyQuantity) || 0;
    const freeQ = Number(offer.freeQuantity) || 0;
    const delivered = buyQ + freeQ;
    const unitPrice = Number(menuItem.totalPrice) || 0;
    const payAmount = unitPrice * buyQ;
    return {
      itemId: menuItem._id,
      name: menuItem.name,
      quantity: delivered, // send X + Y as quantity
      quantityValue: menuItem.unitValue || 1,
      quantityLabel: `(Offer: Buy ${buyQ} Get ${freeQ}, delivers ${delivered})`,
      totalPrice: payAmount, // pay for X
      foodType: menuItem.foodType,
      photos: Array.isArray(menuItem.photos) ? menuItem.photos.filter((p) => typeof p === "string") : [],
      unit: menuItem.unit || "unit",
      unitValue: menuItem.unitValue || 1,
      loose: !!menuItem.loose,
      pricingType: "buy-x-get-y-free",
      offerId: offer._id,
      buyQuantity: buyQ,
      freeQuantity: freeQ,
      deliveredUnits: delivered,
      chargedUnits: buyQ,
      unitPrice,
    };
  };

  const popularItems = useMemo(() => {
    if (!menu || menu.length === 0) return [];
    const allItems = menu.flatMap((category) =>
      category.subcategories.flatMap((sub) =>
        sub.items?.map((item) => ({
          name: item.name,
          image: item.photos?.[0] || "https://via.placeholder.com/80?text=Item",
          totalPrice: item.totalPrice,
          offers: item.offers || [],
          unit: item.unit || "unit",
          unitValue: item.unitValue || 1,
          loose: item.loose || false,
        }))
      )
    );
    const uniqueItems = Array.from(new Map(allItems.map((item) => [item.name.toLowerCase(), item])).values());
    return uniqueItems.slice(0, 6);
  }, [menu]);

  const randomPopularItems = useMemo(() => {
    if (!menu || menu.length === 0) return [];
    const allItems = menu.flatMap((category) =>
      category.subcategories.flatMap((sub) =>
        sub.items?.map((item) => ({
          ...item,
          image: item.photos?.[0] || "https://via.placeholder.com/80?text=Item",
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
    return carts[0]?.items?.find((item) => item.itemId === itemId || item.itemId === itemId.toString());
  };

  const cartHasOffer = (itemId, offerId) => {
    return !!carts[0]?.items?.some(ci => (ci.itemId === itemId || ci.itemId === itemId?.toString()) && ci.offerId === offerId);
  };

  const handleQuantitySelect = (itemId, quantity) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: quantity,
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
    const quantityLabel = item.loose ? getQuantityLabel(selectedQuantity, item.unit) : `${item.unitValue} ${item.unit}`;
    const calculatedPrice = item.loose ? calculatePrice(item.totalPrice, selectedQuantity, item.unit) : item.totalPrice;

    const items = [
      buildRegularCartItem(item, {
        looseQty: selectedQuantity,
        quantityLabel,
        totalPrice: calculatedPrice,
      }),
    ];

    const result = await addToCart(restaurant._id, restaurant.name, items, restaurant.serviceType);

    if (!result.success) {
      toast.error(result.error || "Failed to add to cart");
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    if (!carts.length || !carts[0]) {
      toast.error("Cart not loaded yet");
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      const item = getCartItem(itemId);
      if (!item) {
        toast.error("Item not in cart");
        return;
      }

      if (isOfferCartItem(item)) {
        toast.info("To change offer quantity, please remove and re-add as packs.");
        return;
      }

      const newQuantity = item.quantity + change;
      if (newQuantity < 1) {
        toast.error("Minimum quantity is 1");
        return;
      }

      const originalPricePerUnit = (item.totalPrice * (item.unit === "liter" ? 1000 : 1000)) / item.quantityValue;
      const calculatedPrice = calculatePrice(originalPricePerUnit, item.quantityValue, item.unit);

      const result = await updateCartItem(itemId, newQuantity, {
        totalPrice: calculatedPrice
      });
      if (!result.success) {
        toast.error(result.error || "Failed to update quantity");
      }
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      const result = await removeCartItem(itemId);
      if (result.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleOpenOfferModal = async (item) => {
    setSelectedItemForOffer(item);
    setShowOfferModal(true);
    setOffersLoading(true);
    try {
      const list = await getActiveOffersForItem(item._id);
      setCurrentItemOffers(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load offers");
      setCurrentItemOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const renderItemActions = (item) => {
    if (!item.inStock) {
      return <span className="text-red-500 text-sm">Out of Stock</span>;
    }

    const cartItem = getCartItem(item._id);
    const isUpdating = updatingItems[item._id];
    const selectedQuantity = selectedQuantities[item._id] || 100;
    const displayPrice = item.loose
      ? cartItem
        ? cartItem.totalPrice
        : calculatePrice(item.totalPrice, selectedQuantity, item.unit)
      : null;

    if (cartItem) {
      const offerLine = isOfferCartItem(cartItem);
      return (
        <div className="flex flex-col gap-2">
          {offerLine ? (
            <>
              <div className="text-xs text-yellow-700 font-medium">
                Offer applied: {cartItem.pricingType === "bulk-price" ? "Bulk price" : "Buy X Get Y Free"}
              </div>
              <div className="text-xs text-gray-600">
                <span>Qty: {cartItem.quantityLabel || cartItem.quantity}</span>
                {cartItem.totalPrice != null && (
                  <span className="block">Price: ₹{Number(cartItem.totalPrice).toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item._id);
                  }}
                  disabled={isUpdating}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </>
          ) : (
            <>
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
                <span className="w-6 text-center">{isUpdating ? <Skeleton width={20} /> : cartItem.quantity}</span>
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
                {cartItem.quantityLabel && <span>Size: {cartItem.quantityLabel}</span>}
                {displayPrice && <span className="block">Price: ₹{displayPrice}</span>}
              </div>
            </>
          )}
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
              onChange={(e) => handleQuantitySelect(item._id, parseInt(e.target.value))}
              className="text-xs p-1 border rounded"
              onClick={(e) => e.stopPropagation()}
            >
              {quantityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {getQuantityLabel(option.value, item.unit)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
            className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Add
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenOfferModal(item);
            }}
            className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center justify-center gap-1"
          >
            <Tag size={14} />
            <span>Options</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderItemCard = (item) => {
    const pricePerText = item.loose ? (item.unit === "liter" ? "/ liter" : "/ kg") : "";

    return (
      <div className="relative">
        {item.loose && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold leading-none bg-orange-500 text-white">
              Loose Item
            </span>
          </div>
        )}
        <div className={`p-4 border rounded-lg ${item.loose ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <img
                src={item.photos?.[0] || "https://via.placeholder.com/80?text=Item"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                ₹{item.totalPrice} {pricePerText}
                {item.loose && <span className="text-xs text-gray-400 ml-1">({item.unitValue} {item.unit})</span>}
              </p>
              {renderItemActions(item)}
            </div>
          </div>
        </div>
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
    const filtered = menu
      .map((categoryObj) => {
        const matchedSubcategories = categoryObj.subcategories
          .map((sub) => {
            const matchedItems = sub.items.filter((item) =>
              searchTerms.every((term) => item.name.toLowerCase().includes(term))
            );
            return { ...sub, items: matchedItems };
          })
          .filter((sub) => sub.items.length > 0);

        return matchedSubcategories.length > 0 ? { ...categoryObj, subcategories: matchedSubcategories } : null;
      })
      .filter(Boolean);

    setFilteredMenu(filtered);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
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
              Your cart contains items from another restaurant. Would you like to reset your cart for adding items from
              this restaurant?
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
            <h2 className="text-xl font-bold mb-4">Options for {selectedItemForOffer.name}</h2>

            {/* Regular */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">Regular</h3>
              <div className="flex justify-between items-center">
                <div className="text-gray-700">
                  ₹{selectedItemForOffer.totalPrice}
                  {selectedItemForOffer.loose && (
                    <span className="text-xs text-gray-500 ml-1">
                      / {selectedItemForOffer.unit === "liter" ? "liter" : "kg"} ({selectedItemForOffer.unitValue}{" "}
                      {selectedItemForOffer.unit})
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await handleAddToCart(selectedItemForOffer);
                    setShowOfferModal(false);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Add Regular
                </button>
              </div>
            </div>

            {/* Offers */}
            <div className="space-y-3">
              {offersLoading && <div className="text-sm text-gray-500">Loading offers…</div>}

              {!offersLoading && currentItemOffers.length === 0 && (
                <div className="text-sm text-gray-500">No active offers for this item.</div>
              )}

              {!offersLoading &&
                currentItemOffers.map((offer) => {
                  const isBulk = offer.offerType === "bulk-price";
                  const buyQ = Number(offer.buyQuantity) || 0;
                  const freeQ = Number(offer.freeQuantity) || 0;
                  const delivered = !isBulk ? buyQ + freeQ : null;
                  const bxgyPay = !isBulk ? Number(selectedItemForOffer.totalPrice) * buyQ : null;

                  const isUsed =
                    usedOffers.has(offer._id) || cartHasOffer(selectedItemForOffer._id, offer._id);

                  return (
                    <div
                      key={offer._id}
                      className={`bg-yellow-50 border border-yellow-100 p-4 rounded-md transition-opacity ${
                        isUsed ? "opacity-60" : "opacity-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-yellow-800">
                          {offer.title} <span className="text-xs text-gray-500">({offer.offerType})</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          {isUsed && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Applied</span>
                          )}
                          {offer.isActive && !isUsed && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                          )}
                        </div>
                      </div>

                      {offer.description && <p className="text-sm text-yellow-700 mb-2">{offer.description}</p>}

                      {isBulk ? (
                        <p className="text-sm">
                          Buy <b>{offer.purchaseQuantity}</b> for <b>₹{offer.discountedPrice}</b>
                        </p>
                      ) : (
                        <p className="text-sm">
                          Buy <b>{buyQ}</b> get <b>{freeQ}</b> free — Pay <b>₹{bxgyPay}</b> (delivers <b>{delivered}</b>)
                        </p>
                      )}

                      {(offer.startDate || offer.endDate) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {offer.startDate && <>From {offer.startDate.slice(0, 10)} </>}
                          {offer.endDate && <>to {offer.endDate.slice(0, 10)}</>}
                        </div>
                      )}

                      <button
                        disabled={isUsed}
                        onClick={async () => {
                          const builtItem = isBulk
                            ? buildBulkPriceCartItem(selectedItemForOffer, offer)
                            : buildBxGyCartItem(selectedItemForOffer, offer);

                          const result = await addToCart(
                            restaurant._id,
                            restaurant.name,
                            [builtItem],
                            restaurant.serviceType
                          );
                          if (!result.success) {
                            toast.error(result.error || "Failed to add to cart");
                          } else {
                            toast.success("Offer added to cart");
                            setUsedOffers((prev) => {
                              const next = new Set(prev);
                              next.add(offer._id);
                              return next;
                            });
                            // Keep modal open so user sees the blurred state; close if you prefer:
                            // setShowOfferModal(false);
                          }
                        }}
                        className={`mt-3 w-full px-3 py-1 rounded text-white text-sm ${
                          isUsed
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        {isUsed ? "Applied" : "Add with Offer"}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setShowOfferModal(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hero & Menu */}
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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                      setSearchText("");
                      setFilteredMenu(menu);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-md hover:text-gray-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {inputFocused && searchText === "" && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-2 p-4 z-50">
                <h3 className="text-lg font-semibold mb-3">Popular Products</h3>
                <div className="flex overflow-x-auto pb-2 gap-4 hide-scrollbar">
                  <div className="flex space-x-4">
                    {(menu?.flatMap(c => c.subcategories.flatMap(s => s.items)) || []).slice(0,6).map((item, i) => (
                      <div
                        key={i}
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
                        {item.loose && (
                          <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Loose ({item.unitValue} {item.unit})
                          </span>
                        )}
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
              renderItemCard={renderItemCard}
            />
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default HotelDetails;

import {
  Search,
  ShoppingCart,
  CreditCard,
  Package,
  UserCircle,
  Bell,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";
import LocationSuggestions from "./LocationSuggestions";
import { useState, useEffect, useContext, useRef } from "react";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { useLocationContext } from "../context/LocationContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { API_URL } from "../api/api";
import io from "socket.io-client";
import logo from "../assets/b2bupdate.png";
import { getSubdomain } from "../utils/getSubdomain";

function Navbar({ alwaysVisible }) {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useContext(HotelContext);
  const { cartCount, fetchCart } = useCart();
  const navigate = useNavigate();
  const {
    location,
    setLocation,
    suggestions,
    showSuggestions: locationShowSuggestions,
    setShowSuggestions: setLocationShowSuggestions,
    fetchLocationSuggestions,
    onLocationSelect,
    onAllowLocation,
    onLoginClick,
  } = useLocationContext();

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileButtonRef = useRef(null);
  const socketRef = useRef(null);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [subdomain, setSubdomain] = useState(null);

  // Check if this is a subdomain on initial load
  useEffect(() => {
    const subdomain = getSubdomain();
    setSubdomain(subdomain);
    setIsSubdomain(subdomain && subdomain !== "shopatb2b");
  }, []);

  // Load saved location from localStorage
  useEffect(() => {
    if (!isSubdomain) {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const { location: savedLoc } = JSON.parse(savedLocation);
        setLocation(savedLoc);
      }
    }
  }, [setLocation, isSubdomain]);

  // Setup socket connection when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
      setupSocketConnection();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, fetchCart]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest('a[href^="/"]') ||
        event.target.closest(".keep-dropdown-open") ||
        event.target.closest(".logout-button")
      ) {
        return;
      }
      // For profile dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !profileButtonRef.current?.contains(event.target)
      ) {
        setShowLoginOptions(false);
      }

      // For notifications dropdown
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !event.target.closest("[data-notification-button]")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const setupSocketConnection = () => {
    if (!user) return;

    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("orderStatusUpdate", (updatedOrder) => {
      const isCancelled = updatedOrder.status.toLowerCase().includes("cancel");
      if (isCancelled && updatedOrder.cancelledBy === "restaurant") {
        addNotification({
          id: Date.now().toString(),
          text: `Order #${updatedOrder._id.slice(
            -6
          )} has been cancelled by the restaurant`,
          time: new Date().toLocaleTimeString(),
          read: false,
          orderId: updatedOrder._id,
          isCancelled: true,
        });
        return;
      }
      addNotification({
        id: Date.now().toString(),
        text: `Order #${updatedOrder._id.slice(
          -6
        )} status updated to: ${updatedOrder.status.replace(/_/g, " ")}`,
        time: new Date().toLocaleTimeString(),
        read: false,
        orderId: updatedOrder._id,
        isCancelled: false,
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await logout();
      console.log("Logout complete");
      toast.success("Logged out successfully");

      setTimeout(() => {
        setShowLoginOptions(false); // Delay closing dropdown
        navigate("/");
      }, 100); // Just enough delay for things to complete
    } catch (error) {
      toast.error("Failed to logout");
    }
  };


  const handleLocationSelect = (suggestion) => {
    const locationData = {
      location: suggestion.address || suggestion.name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lng),
      },
    };
    localStorage.setItem("userLocation", JSON.stringify(locationData));
    window.dispatchEvent(new Event("locationUpdated"));
    setLocation(suggestion.address || suggestion.name);
    setLocationShowSuggestions(false);
    if (onLocationSelect) onLocationSelect(suggestion);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/order-status/${notification.orderId}`);
    }
    setShowNotifications(false);
  };

  const toggleLoginOptions = (e) => {
    e.stopPropagation();
    setShowLoginOptions(!showLoginOptions);
    setShowNotifications(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowLoginOptions(false);
  };

  const handleSubdomainClick = () => {
    if (isSubdomain && subdomain) {
      const currentHost = window.location.hostname;
      let targetUrl;
      
      if (currentHost === 'localhost' || currentHost.includes('localhost')) {
        // For localhost, navigate to /restaurant/subdomain
        navigate(`/restaurant/${subdomain}`);
      } else if (currentHost.includes('shopatb2b.com')) {
        // For *.shopatb2b.com, replace * with subdomain
        if (currentHost.includes('test.shopatb2b.com')) {
          // For *.test.shopatb2b.com
          targetUrl = `https://${subdomain}.test.shopatb2b.com`;
        } else {
          // For *.shopatb2b.com
          targetUrl = `https://${subdomain}.shopatb2b.com`;
        }
        window.location.href = targetUrl;
      } else {
        // Fallback for other domains
        navigate(`/restaurant/${subdomain}`);
      }
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/">
                <img src={logo} loading="lazy" alt="logo" width="40px" />
              </Link>
              {isSubdomain && (
                <button
                  onClick={handleSubdomainClick}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {subdomain}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isSubdomain && (
                <>
                  <div className="relative w-64">
                    <input
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        fetchLocationSuggestions(e.target.value);
                      }}
                      onFocus={() => setLocationShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setLocationShowSuggestions(false), 150)
                      }
                      placeholder="Enter your location"
                      className="w-full pl-10 pr-20 py-2 rounded-full border-2 focus:border-blue-500 outline-none"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    {locationShowSuggestions && location && (
                      <LocationSuggestions
                        suggestions={suggestions}
                        onSelect={handleLocationSelect}
                        onAllowLocation={() => {
                          onAllowLocation();
                          setLocationShowSuggestions(false);
                        }}
                      />
                    )}
                  </div>

                  <Link
                    to="/search"
                    className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Search size={20} />
                    <span className="text-sm">Search</span>
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1 relative"
              >
                <ShoppingCart size={20} />
                <span className="text-sm">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1"
              >
                <Package size={20} />
                <span className="text-sm">Orders</span>
              </Link>

              <Link
                to="/checkout"
                className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1"
              >
                <CreditCard size={20} />
                <span className="text-sm">Checkout</span>
              </Link>

              <div className="relative" ref={notificationsRef}>
                <button
                  data-notification-button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 max-h-96 overflow-y-auto border border-blue-200">
                    <div className="px-4 py-2 border-b flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""
                              }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <p className="text-sm font-medium">
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No notifications yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={toggleLoginOptions}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {user ? (
                    <>
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.username || user.email}
                          className="w-8 h-8 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserCircle size={24} />
                      )}
                      <span className="text-md font-medium capitalize">
                        {user.username || "Hi User"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCircle size={24} />
                      <span className="text-md capitalize">
                        Login/Register
                      </span>
                    </>
                  )}
                </button>

                {showLoginOptions && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {user.email || user.username}
                        </div>
                        <Link
                          to="/profile"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => setShowLoginOptions(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/feedback"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => setShowLoginOptions(false)}
                        >
                          Feedback
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setShowLoginOptions(false);
                            onLoginClick && onLoginClick();
                          }}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setShowLoginOptions(false);
                            onLoginClick && onLoginClick();
                          }}
                        >
                          Register
                        </Link>
                        <Link
                          to="/feedback"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            setShowLoginOptions(false);
                            navigate("/feedback"); // Force navigation
                          }}
                        >
                          Feedback
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Navbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">

              <Link to="/">
                <img src={logo} loading="lazy" alt="logo" width="40px" />
              </Link>

              {isSubdomain && (
                <button
                  onClick={handleSubdomainClick}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  {subdomain}
                </button>
              )}
            </div>

            {!isSubdomain && (
              <div className="flex-1 mx-4">
                <div className="relative">
                  <input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      fetchLocationSuggestions(e.target.value);
                    }}
                    onFocus={() => setLocationShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setLocationShowSuggestions(false), 150)
                    }
                    placeholder="Enter location"
                    className="w-full pl-10 pr-4 py-2 rounded-full border-2 focus:border-blue-500 outline-none text-sm"
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  {locationShowSuggestions && location && (
                    <LocationSuggestions
                      suggestions={suggestions}
                      onSelect={handleLocationSelect}
                      onAllowLocation={() => {
                        onAllowLocation();
                        setLocationShowSuggestions(false);
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationsRef}>
                <button
                  data-notification-button
                  onClick={toggleNotifications}
                  className="p-1 relative"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50 max-h-80 overflow-y-auto border border-gray-200">
                    <div className="px-3 py-2 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${!notification.read ? "bg-blue-50" : ""
                              }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <p className="font-medium">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-6 text-center text-gray-500 text-sm">
                        No notifications yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={toggleLoginOptions}
                  className="p-1"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.username || user.email}
                      className="w-8 h-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UserCircle size={24} />
                  )}
                </button>

                {showLoginOptions && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                  >
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">
                          {user.email || user.username}
                        </div>
                        <Link
                          to="/profile"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => setShowLoginOptions(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/feedback"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => setShowLoginOptions(false)}
                        >
                          Feedback
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => {
                            setShowLoginOptions(false);
                            onLoginClick && onLoginClick();
                          }}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => {
                            setShowLoginOptions(false);
                            onLoginClick && onLoginClick();
                          }}
                        >
                          Register
                        </Link>
                        <Link
                          to="/feedback"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => setShowLoginOptions(false)}
                        >
                          Feedback
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {!isSubdomain && (
            <Link
              to="/search"
              className="flex flex-col items-center p-2 text-gray-700"
            >
              <Search size={24} />
              <span className="text-xs mt-1">Search</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="flex flex-col items-center p-2 text-gray-700 relative"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </Link>

          <Link
            to="/checkout"
            className="flex flex-col items-center p-2 text-gray-700"
          >
            <CreditCard size={24} />
            <span className="text-xs mt-1">Checkout</span>
          </Link>

          <Link
            to="/orders"
            className="flex flex-col items-center p-2 text-gray-700"
          >
            <Package size={24} />
            <span className="text-xs mt-1">Orders</span>
          </Link>

          <Link
            to="/feedback"
            className="flex flex-col items-center p-2 text-gray-700"
          >
            <MessageSquare size={24} />
            <span className="text-xs mt-1">Feedback</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
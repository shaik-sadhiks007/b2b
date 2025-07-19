import { Search, Mic, Camera, ShoppingBag, Home, User, LogOut, ShoppingCart, CreditCard, Package, UserCircle, X, MessageSquare, Bell } from "lucide-react"
import LocationSuggestions from "./LocationSuggestions"
import { useState, useEffect, useContext, useRef } from "react"
import { HotelContext } from "../contextApi/HotelContextProvider"
import { useNavigate, Link } from "react-router-dom"
import { useLocationContext } from "../context/LocationContext"
import { useCart } from "../context/CartContext"
import { toast } from 'react-toastify'
import { API_URL } from '../api/api';
import io from 'socket.io-client';
import logo from '../assets/b2bupdate.png';
import { getSubdomain } from '../utils/getSubdomain';

function Navbar({ alwaysVisible }) {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user, logout } = useContext(HotelContext)
  const { cartCount, fetchCart } = useCart()
  const navigate = useNavigate()
  const {
    location,
    setLocation,
    suggestions,
    showSuggestions: locationShowSuggestions,
    setShowSuggestions: setLocationShowSuggestions,
    fetchLocationSuggestions,
    onLocationSelect,
    onAllowLocation,
    onLoginClick
  } = useLocationContext();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const socketRef = useRef(null);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    // Check if we're on a subdomain
    const subdomain = getSubdomain();
    setIsSubdomain(subdomain && subdomain !== "shopatb2b");
    
    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      const { location: savedLoc, coordinates } = JSON.parse(savedLocation)
      setLocation(savedLoc)
    }
  }, [])

  // Add localStorage change listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userLocation') {
        const { location: newLocation } = JSON.parse(e.newValue);
        setLocation(newLocation);
        setLocationShowSuggestions(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const setupSocketConnection = () => {
    if (!user) return;

    // Initialize socket connection
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    // Listen for order status updates
    socket.on('orderStatusUpdate', (updatedOrder) => {
      console.log('orderStatusUpdate received:', updatedOrder);
      const isCancelled = updatedOrder.status.toLowerCase().includes('cancel');
      if (isCancelled) {
        if (updatedOrder.cancelledBy === 'restaurant') {
          const notificationText = `Order #${updatedOrder._id.slice(-6)} has been cancelled by the restaurant`;
          addNotification({
            id: Date.now().toString(),
            text: notificationText,
            time: new Date().toLocaleTimeString(),
            read: false,
            orderId: updatedOrder._id,
            isCancelled: true
          });
        }
        return;
      }
      const notificationText = `Order #${updatedOrder._id.slice(-6)} status updated to: ${updatedOrder.status.replace(/_/g, ' ')}`;
      addNotification({
        id: Date.now().toString(),
        text: notificationText,
        time: new Date().toLocaleTimeString(),
        read: false,
        orderId: updatedOrder._id,
        isCancelled: false
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Order Update', {
          body: notification.text,
          tag: 'order-update'
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLoginOptions(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }

  const handleSearchClick = () => {
    navigate('/search')
  }

  const handleLogoClick = (e) => {
    e.preventDefault();
    const subdomain = getSubdomain();
    if (subdomain && subdomain !== "shopatb2b") {
      navigate('/')
    } else {
      navigate('/')
    }
  }

  const handleLocationSelect = (suggestion) => {
    const locationData = {
      location: suggestion.address || suggestion.name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lng)
      }
    }
    localStorage.setItem('userLocation', JSON.stringify(locationData))
    window.dispatchEvent(new Event('locationUpdated'))
    setLocation(suggestion.address || suggestion.name)
    setLocationShowSuggestions(false)
    if (onLocationSelect) {
      onLocationSelect(suggestion)
    }
  }

  useEffect(() => {
    const handleLocationUpdate = () => {
      const savedLocation = localStorage.getItem('userLocation')
      if (savedLocation) {
        const { location: savedLoc } = JSON.parse(savedLocation)
        setLocation(savedLoc)
        setLocationShowSuggestions(false)
      }
    }

    window.addEventListener('locationUpdated', handleLocationUpdate)
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/order-status/${notification.orderId}`);
    }
    setShowNotifications(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button onClick={handleLogoClick} className="cursor-pointer">
                <img src={logo} loading="lazy" alt="logo" width='40px' />
              </button>
            </div>

            {/* Desktop Navigation - Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Desktop navigation items */}
              {!isSubdomain && (
                <div className="relative w-64">
                  <input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      fetchLocationSuggestions(e.target.value);
                    }}
                    onFocus={() => setLocationShowSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setLocationShowSuggestions(false), 150)
                    }}
                    placeholder="Enter your location"
                    className="w-full pl-10 pr-20 py-2 rounded-full border-2 focus:border-blue-500 outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

                  {locationShowSuggestions && location && (
                    <LocationSuggestions
                      suggestions={suggestions}
                      onSelect={handleLocationSelect}
                      onAllowLocation={() => {
                        onAllowLocation()
                        setLocationShowSuggestions(false)
                      }}
                    />
                  )}
                </div>
              )}

              {!isSubdomain && (
                <button
                  onClick={handleSearchClick}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1"
                >
                  <Search size={20} />
                  <span className="text-sm">Search</span>
                </button>
              )}

              <Link to="/cart">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1 relative">
                  <ShoppingCart size={20} />
                  <span className="text-sm">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              <Link to="/orders">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                  <Package size={20} />
                  <span className="text-sm">Orders</span>
                </button>
              </Link>

              <Link to="/checkout">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                  <CreditCard size={20} />
                  <span className="text-sm">Checkout</span>
                </button>
              </Link>

              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1 relative"
                >
                  <Bell size={20} />
                  <span className="text-sm">Notifications</span>
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
                        onClick={markAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''} ${
                              notification.isCancelled ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm">
                              {notification.isCancelled ? (
                                <span className="text-red-600 font-medium">{notification.text}</span>
                              ) : (
                                <span className="text-blue-600 font-medium">{notification.text}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
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

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLoginOptions(!showLoginOptions)}
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
                      <span className="text-md font-medium capitalize ">{user.username || "Hi User"}</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User size={20} />
                      <span className="text-sm">Login</span>
                    </div>
                  )}
                </button>

                {showLoginOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {user.email || user.username}
                        </div>
                        <Link to="/profile">
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                            <User size={18} />
                            Profile
                          </button>
                        </Link>
                        <Link to="/feedback">
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                            <MessageSquare size={18} />
                            <span>Feedback</span>
                          </button>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                          <button
                            onClick={() => {
                              onLoginClick()
                              setShowLoginOptions(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <User size={18} />
                            <span>Login</span>
                          </button>
                        </Link>
                        <Link to="/register">
                          <button
                            onClick={() => {
                              onLoginClick()
                              setShowLoginOptions(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <LogOut size={18} />
                            <span>Register</span>
                          </button>
                        </Link>
                        <Link to="/feedback">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <MessageSquare size={18} />
                            <span>Feedback</span>
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation - Right Side */}
            <div className="flex md:hidden items-center gap-4">
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
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
                        onClick={markAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''} ${
                              notification.isCancelled ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm">
                              {notification.isCancelled ? (
                                <span className="text-red-600 font-medium">{notification.text}</span>
                              ) : (
                                <span className="text-blue-600 font-medium">{notification.text}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
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

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLoginOptions(!showLoginOptions)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  {user ? (
                    user?.image ? (
                      <img
                        src={user.image}
                        alt={user.username || user.email}
                        className="w-8 h-8 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <UserCircle size={24} />
                    )
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {showLoginOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {user.email || user.username}
                        </div>
                        <Link to="/profile">
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                            <User size={18} />
                            Profile
                          </button>
                        </Link>
                        <Link to="/feedback">
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                            <MessageSquare size={18} />
                            <span>Feedback</span>
                          </button>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                          <button
                            onClick={() => {
                              onLoginClick()
                              setShowLoginOptions(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <User size={18} />
                            <span>Login</span>
                          </button>
                        </Link>
                        <Link to="/register">
                          <button
                            onClick={() => {
                              onLoginClick()
                              setShowLoginOptions(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <LogOut size={18} />
                            <span>Register</span>
                          </button>
                        </Link>
                        <Link to="/feedback">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <MessageSquare size={18} />
                            <span>Feedback</span>
                          </button>
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

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <Link to="/cart" className="flex flex-col items-center p-2 text-gray-700">
            <div className="relative">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Cart</span>
          </Link>

          <Link to="/checkout" className="flex flex-col items-center p-2 text-gray-700">
            <CreditCard size={24} />
            <span className="text-xs mt-1">Checkout</span>
          </Link>

          <Link to="/orders" className="flex flex-col items-center p-2 text-gray-700">
            <Package size={24} />
            <span className="text-xs mt-1">Orders</span>
          </Link>

          <Link to="/feedback" className="flex flex-col items-center p-2 text-gray-700">
            <MessageSquare size={24} />
            <span className="text-xs mt-1">Feedback</span>
          </Link>
        </div>
      </nav>

      {/* Add padding to main content to avoid overlap with bottom navbar */}
      <style jsx global>{`
        body {
          padding-bottom: 64px;
        }
        @media (min-width: 768px) {
          body {
            padding-bottom: 0;
          }
        }
      `}</style>
    </>
  )
}

export default Navbar
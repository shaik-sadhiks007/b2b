import { Search, Mic, Camera, ShoppingBag, Home, User, LogOut, ShoppingCart, CreditCard, Package, UserCircle, X, MessageSquare, Bell, Download } from "lucide-react"
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

function Navbar({ alwaysVisible }) {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosInstallBanner, setShowIosInstallBanner] = useState(false);
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

  useEffect(() => {
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
      console.log('orderStatusUpdate received:', updatedOrder); // Debug log
      const isCancelled = updatedOrder.status.toLowerCase().includes('cancel');
      // Only notify if cancelled by restaurant
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

    // Show toast notification with appropriate color
    // if (notification.isCancelled) {
    //   toast.error(notification.text);
    // } else {
    //   toast.info(notification.text);
    // }

    // Show browser notification if permission is granted
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
    navigate('/')
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
      n.id === id ? { ...n, read: true } : n
    ));
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/order-status/${notification.orderId}`);
    }
    setShowNotifications(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        // setShowInstall(false); // This state is removed
      }
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    // iOS PWA install banner logic
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isInStandaloneMode = () =>
      'standalone' in window.navigator && window.navigator.standalone;
    if (isIos() && !isInStandaloneMode()) {
      setShowIosInstallBanner(true);
    }
  }, []);

  return (
    <>
      {showIosInstallBanner && (
        <div style={{ background: '#1976d2', color: 'white', padding: '10px', textAlign: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <span>To install this app on your iPhone/iPad, tap <b>Share</b> <span role="img" aria-label="share">&#x1f5d2;</span> and then <b>Add to Home Screen</b>.</span>
          <button onClick={() => setShowIosInstallBanner(false)} style={{ marginLeft: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2" style={{ top: showIosInstallBanner ? 48 : 0 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handleLogoClick} className="cursor-pointer">
                <img src={logo} loading="lazy" alt="logo" width='40px' />
              </button>
            </div>

            {/* Mobile Location Input */}
            <div className="relative flex-1 max-w-xs mx-4 lg:hidden">
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
                placeholder="Enter location"
                className="w-full pl-10 pr-4 py-2 rounded-full border-2 focus:border-blue-500 outline-none text-sm"
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

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
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

              <button
                onClick={handleSearchClick}
                className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1"
              >
                <Search size={20} />
                <span className="text-sm">Search</span>
              </button>

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

              {/* Notification Bell with Dropdown */}
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
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''} ${notification.isCancelled ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
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

              {/* User Profile/Login */}
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
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {user.email || user.username}
                        </div>

                        <Link to="/profile">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <User size={18} />
                            Profile
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
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                        {!showIosInstallBanner && (
                          <button
                            onClick={handleInstallClick}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            title={deferredPrompt ? "Install App" : "Install prompt not available"}
                            disabled={!deferredPrompt}
                            style={{ opacity: deferredPrompt ? 1 : 0.5, cursor: deferredPrompt ? 'pointer' : 'not-allowed' }}
                          >
                            <Download size={18} />
                            <span>Install App</span>
                          </button>
                        )}
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
                        {!showIosInstallBanner && (
                          <button
                            onClick={handleInstallClick}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            title={deferredPrompt ? "Install App" : "Install prompt not available"}
                            disabled={!deferredPrompt}
                            style={{ opacity: deferredPrompt ? 1 : 0.5, cursor: deferredPrompt ? 'pointer' : 'not-allowed' }}
                          >
                            <Download size={18} />
                            <span>Install App</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Offcanvas Navigation */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-50 lg:hidden transition-opacity duration-300 ease-in-out"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
              className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <Search size={20} />
                      <span>Search</span>
                    </button>
                  </Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <div className="relative">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </div>
                      <span>Cart</span>
                    </button>
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <Package size={20} />
                      <span>Orders</span>
                    </button>
                  </Link>
                  <Link to="/checkout" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <CreditCard size={20} />
                      <span>Checkout</span>
                    </button>
                  </Link>
                  <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors relative">
                      <Bell size={20} />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  <Link to="/feedback" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <MessageSquare size={20} />
                      <span>Feedback</span>
                    </button>
                  </Link>

                  {user ? (
                    <>
                      <div className="p-3 border-t border-b mt-2">
                        <div className="flex items-center gap-3">
                          {user?.image ? (
                            <img
                              src={user.image}
                              alt={user.username || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <UserCircle size={40} />
                          )}
                          <div>
                            <p className="font-medium">{user.username || user.email}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                          <User size={20} />
                          <span>Profile</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 text-red-600 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                          <User size={20} />
                          <span>Login</span>
                        </button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                          <LogOut size={20} />
                          <span>Register</span>
                        </button>
                      </Link>
                    </>
                  )}
                  {!showIosInstallBanner && deferredPrompt && (
                    <button
                      onClick={() => {
                        handleInstallClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      title="Install App"
                    >
                      <Download size={20} />
                      <span>Install App</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}

export default Navbar
import { Search, Mic, Camera, ShoppingBag, Home, User, LogOut, ShoppingCart, CreditCard, Package, UserCircle, X, MessageSquare } from "lucide-react"
import LocationSuggestions from "./LocationSuggestions"
import { useState, useEffect, useContext, useRef } from "react"
import { HotelContext } from "../contextApi/HotelContextProvider"
import { useNavigate, Link } from "react-router-dom"
import { useLocationContext } from "../context/LocationContext"
import { useCart } from "../context/CartContext"
import { toast } from 'react-toastify'
import logo from '../assets/b2bupdate.png';


function Navbar({ alwaysVisible }) {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    }
  }, [fetchCart, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLocationSelect = (suggestion) => {
    const locationData = {
      location: suggestion.address || suggestion.name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lng)
      }
    }
    localStorage.setItem('userLocation', JSON.stringify(locationData))
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('locationUpdated'))
    setLocation(suggestion.address || suggestion.name)
    setLocationShowSuggestions(false)
    if (onLocationSelect) {
      onLocationSelect(suggestion)
    }
  }

  // Add event listener for custom location update event
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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <img src={logo} loading="lazy" alt="logo" width='40px' />
            </Link>
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

            {/* Location suggestions for mobile */}
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

              {/* Location suggestions */}
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
            <Link to="/checkout">
              <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                <CreditCard size={20} />
                <span className="text-sm">Checkout</span>
              </button>
            </Link>
            <Link to="/orders">
              <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                <Package size={20} />
                <span className="text-sm">Orders</span>
              </button>
            </Link>
            <div className="relative">
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
                  <div className="flex">
                    <User size={20} />
                    <span className="text-sm">Login</span>
                  </div>
                )}
              </button>

              {/* Login options dropdown */}
              {showLoginOptions && (
                <div
                  ref={dropdownRef}
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

        {/* Mobile Offcanvas Navigation */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/30 z-50 lg:hidden transition-opacity duration-300 ease-in-out"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div 
              className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
                  <Link to="/checkout" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <CreditCard size={20} />
                      <span>Checkout</span>
                    </button>
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <Package size={20} />
                      <span>Orders</span>
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
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar


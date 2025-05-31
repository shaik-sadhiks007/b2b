import { Search, Mic, Camera, ShoppingBag, Home, User, LogOut, ShoppingCart, CreditCard, Package, UserCircle } from "lucide-react"
import { useScroll } from "../context/ScrollContext"
import LocationSuggestions from "./LocationSuggestions"
import { useState, useEffect, useContext } from "react"
import { HotelContext } from "../contextApi/HotelContextProvider"
import { useNavigate, Link } from "react-router-dom"
import { useLocationContext } from "../context/LocationContext"
import { useCart } from "../context/CartContext"
import { toast } from 'react-toastify'
import logo from '../assets/b2bupdate.png';


function Navbar({ alwaysVisible }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
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
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  const handleLogout = () => {
    logout()
    setShowLoginOptions(false)
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
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
              <img src="https://res.cloudinary.com/dcd6oz2pi/image/upload/f_auto,q_auto/v1/logo/xwdu2f0zjbsscuo0q2kq"
                loading="lazy"
                alt="logo"
                width='40px'
              />
            </Link>
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
                className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                {user ? (
                  <>
                    <UserCircle size={24} />
                    <span className="text-sm">{user.name || user.email.split('@')[0]}</span>
                  </>
                ) : (
                  <User size={24} />
                )}
              </button>

              {/* Login options dropdown */}
              {showLoginOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user.email}
                      </div>

                      <Link to="/profile">
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                          <User size={18} />

                          Profile
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="relative w-full mb-4">
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
                placeholder="Enter delivery location"
                className="w-full pl-10 pr-20 py-2 rounded-full border-2 focus:border-blue-500 outline-none"
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
            <div className="flex flex-col gap-2">
              <Link to="/search">
                <button
                  onClick={handleSearchClick}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2"
                >
                  <Search size={20} />
                  <span>Search</span>
                </button>
              </Link>
              <Link to="/cart">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2 relative">
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>
              <Link to="/checkout">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2">
                  <CreditCard size={20} />
                  <span>Checkout</span>
                </button>
              </Link>
              <Link to="/orders">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2">
                  <Package size={20} />
                  <span>Orders</span>
                </button>
              </Link>
              <button
                onClick={() => setShowLoginOptions(!showLoginOptions)}
                className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2"
              >
                {user ? (
                  <>
                    <UserCircle size={20} />
                    <span>{user.name || user.email.split('@')[0]}</span>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <User size={20} />
                      <span>Login</span>
                    </Link>
                    <Link to="/register">
                      <User size={20} />
                      <span>Register</span>
                    </Link>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar


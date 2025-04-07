import { Search, Mic, Camera, ShoppingBag, Home, User, LogOut } from "lucide-react"
import { useScroll } from "../context/ScrollContext"
import LocationSuggestions from "./LocationSuggestions"
import { useState, useEffect, useContext } from "react"
import { HotelContext } from "../contextApi/HotelContextProvider"

function Navbar({ location, setLocation, suggestions, onLocationSelect, onAllowLocation, onLoginClick }) {
  const { isScrolled } = useScroll()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const { user, logout } = useContext(HotelContext)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setShowLoginOptions(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md py-2" : "py-4 -translate-y-full"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">
            B2B
          </span>
        </div>
        <div className="relative w-1/2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150)
            }}
            placeholder="Enter delivery location"
            className="w-full pl-10 pr-20 py-2 rounded-full border-2 focus:border-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          
          {/* Location suggestions */}
          {showSuggestions && location && (
            <LocationSuggestions
              suggestions={suggestions}
              onSelect={(suggestion) => {
                onLocationSelect(suggestion)
                setShowSuggestions(false)
              }}
              onAllowLocation={() => {
                onAllowLocation()
                setShowSuggestions(false)
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ShoppingBag size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Home size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowLoginOptions(!showLoginOptions)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User size={24} />
            </button>

            {/* Login options dropdown */}
            {showLoginOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user.email}
                    </div>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar


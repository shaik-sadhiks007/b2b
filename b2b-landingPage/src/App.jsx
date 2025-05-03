import { useState, useEffect } from "react"
import { Search, Mic, Camera } from "lucide-react"
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom"
import LocationModal from "./components/LocationModal"
import CategoryShortcuts from "./components/CategoryShortcuts"
import Navbar from "./components/Navbar"
import LocationSuggestions from "./components/LocationSuggestions"
import { ScrollProvider } from "./context/ScrollContext"
import HotelDataProvider from "./contextApi/HotelContextProvider"
import Login from "./authentication/Login"
import Register from "./authentication/Register"
import Home from "./components/Home"
import HotelDetails from "./components/HotelDetails"
import { CartProvider } from './context/CartContext'
import CartPage from './components/CartPage'
import SearchPage from './pages/SearchPage'
import LocationProvider from "./context/LocationContext"

function AppContent() {
  const routerLocation = useRouterLocation();
  const isHome = routerLocation.pathname === "/";

  // Centralized state for location and suggestions
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Dummy handlers (replace with your actual logic if needed)
  const onLocationSelect = (suggestion) => {
    setLocation(suggestion.address || suggestion.name);
  };
  const onAllowLocation = () => {};
  const onLoginClick = () => {};

  return (
    <div className="min-h-screen bg-white">
      {!isHome && (
        <Navbar
          alwaysVisible={true}
          location={location}
          setLocation={setLocation}
          suggestions={suggestions}
          onLocationSelect={onLocationSelect}
          onAllowLocation={onAllowLocation}
          onLoginClick={onLoginClick}
        />
      )}
      <Routes>
        <Route path="/" element={
          <Home/>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/cart" element={<CartPage />} />
        {/* <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} /> */}
        <Route path="/search" element={<SearchPage/>} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <Router>
        <HotelDataProvider>
          <ScrollProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </ScrollProvider>
        </HotelDataProvider>
      </Router>
    </CartProvider>
  )
}

export default App


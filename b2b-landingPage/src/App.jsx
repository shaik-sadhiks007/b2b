import { useState, useEffect } from "react"
import { Search, Mic, Camera } from "lucide-react"
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LocationModal from "./components/LocationModal"
import CategoryShortcuts from "./components/CategoryShortcuts"
import Navbar from "./components/Navbar"
import LocationSuggestions from "./components/LocationSuggestions"
import { ScrollProvider } from "./context/ScrollContext"
import HotelDataProvider from "./contextApi/HotelContextProvider"
import Login from "./authentication/Login"
import Register from "./authentication/Register"
import ForgotPassword from "./authentication/ForgotPassword"
import Home from "./components/Home"
import HotelDetails from "./components/HotelDetails"
import { CartProvider } from './context/CartContext'
import CartPage from './components/CartPage'
import SearchPage from './pages/SearchPage'
import LocationProvider from "./context/LocationContext"
import Checkout from "./components/Checkout"
import OrderSuccess from "./components/OrderSuccess"
import Orders from "./components/Orders"
import ProtectedRoute from './components/ProtectedRoute'
import GuestLogin from "./components/GuestLogin"
import Profile from "./components/Profile"
import AboutUs from "./components/About-us"
import Helpbutton from './components/Helpbutton';
import Whatsappbutton from './components/Whatsappbutton';
import Contactus from './components/Contactus';
import Footer from './components/Footer';
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
  const onAllowLocation = () => { };
  const onLoginClick = () => { };

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
      <Helpbutton />
      <Whatsappbutton />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/:category/:id" element={<HotelDetails />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/ordersuccess/:orderId" element={<OrderSuccess />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/guest-login" element={<GuestLogin />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contactus" element={<Contactus />} />

      </Routes>
      <Footer />
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
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </LocationProvider>
          </ScrollProvider>
        </HotelDataProvider>
      </Router>
    </CartProvider>
  )
}

export default App


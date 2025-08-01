import { useState } from "react"
import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from "./components/Navbar"
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
import OrderDetails from './components/OrderDetails';
import OrderStatus from './components/OrderStatus';
import Features from './components/Features';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Feedback from './pages/Feedback';
import { getSubdomain } from "./utils/getSubdomain";
import { API_URL } from "./api/api"
import axios from 'axios';
import HomeOrHotelDetails from './components/HomeOrHotelDetails';
import bgImage from './assets/bgImage.jpg'


function AppContent() {
  const routerLocation = useRouterLocation();
  const isHome = routerLocation.pathname === "/";

  // Check if current path is hotel details page (pattern: /:category/:id)
  const isHotelDetails = routerLocation.pathname.split('/').length === 3


  // Centralized state for location and suggestions
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const subdomain = getSubdomain();
  const isMainDomain = !subdomain || subdomain === "shopatb2b";
  const isPantulugaarimess = subdomain === "pantulugaarimess";

  // Hide helpers if on subdomain and on home route
  const hideHelpers = !isMainDomain && isHome;

  const hideFooterRoutes = [
    '/checkout',
    '/ordersuccess',
    '/orders',
    '/orders/',
    '/order-status'
  ];

  const shouldHideFooter = hideFooterRoutes.some((r) =>
    routerLocation.pathname.startsWith(r)
  );

  const onLocationSelect = (suggestion) => {
    setLocation(suggestion.address || suggestion.name);
  };

  const onAllowLocation = () => { };
  const onLoginClick = () => { };

  return (
    <div
      className={`min-h-screen ${isPantulugaarimess ? 'bg-cover bg-no-repeat bg-center' : ''}`}
      style={isPantulugaarimess ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      <Navbar
        alwaysVisible={true}
        location={location}
        setLocation={setLocation}
        suggestions={suggestions}
        onLocationSelect={onLocationSelect}
        onAllowLocation={onAllowLocation}
        onLoginClick={onLoginClick}
      />


      <Routes>
        <Route path="/" element={<HomeOrHotelDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/:category/:id" element={<HotelDetails />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/ordersuccess/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/guest-login" element={<GuestLogin />} />
        <Route path="/aboutb2b" element={<AboutUs />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/features" element={<Features />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
        <Route path="/feedback" element={<Feedback />} />
        
      </Routes>

      <Footer />
    </div>
  );
}

function App() {

  const queryClient = new QueryClient()

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
    }
  }, []);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <HotelDataProvider>
          <CartProvider>
            <LocationProvider>
              <AppContent />
              <PWAInstallPrompt />
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              <ToastContainer
                position="top-right"
                autoClose={2000}
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
          </CartProvider>
        </HotelDataProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;

import { useState, useEffect } from "react"
import { Search, Mic, Camera } from "lucide-react"
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom"
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

function AppContent() {
  
  return (
    <div className="min-h-screen bg-white">
     

      {/* Main content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/cart" element={<CartPage />} />
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
            <AppContent />
          </ScrollProvider>
        </HotelDataProvider>
      </Router>
    </CartProvider>
  )
}

export default App


import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import AddRestaurant from './pages/AddRestaurant'
import { AuthProvider } from './context/AuthContext'
import { MobileMenuProvider } from './context/MobileMenuContext'
import Dashboard from './pages/Dashboard'
import Orders from './components/Orders'
import InventoryManager from './components/InventoryManager'
import InStoreBilling from './components/InStoreBilling'
import OrderHistory from './components/OrderHistory'
import { ToastContainer } from 'react-toastify'
import Profile from './components/Profile'
import ForgotPassword from './pages/ForgotPassword'
import Review from './components/Review'
import Aboutus from './components/Aboutus'


function App() {
  return (
    <MobileMenuProvider>
      <AuthProvider>
        <Router>
          <ToastContainer />

          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/inventory' element={<InventoryManager />} />
            <Route path='/menu' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/add-restaurant' element={<AddRestaurant />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/instore-orders' element={<InStoreBilling />} />
            <Route path='/order-history' element={<OrderHistory />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/review' element={<Review />} />
            <Route path='/Aboutus' element={<Aboutus />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MobileMenuProvider>
  )
}

export default App

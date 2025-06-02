import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import AddRestaurant from './pages/AddRestaurant'
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
import { MenuProvider } from './context/MenuContext'
import PrivateRoute from './components/PrivateRoute'
import AuthProvider from './context/AuthContext'

function App() {
  return (
    <MobileMenuProvider>
      <AuthProvider>
        <MenuProvider>
          <Router>
            <ToastContainer />

            <Routes>
              {/* Public Routes */}
              <Route path='/' element={<LandingPage />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/Aboutus' element={<Aboutus />} />

              {/* Protected Routes */}
              <Route path='/orders' element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              } />
              <Route path='/inventory' element={
                <PrivateRoute>
                  <InventoryManager />
                </PrivateRoute>
              } />
              <Route path='/menu' element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path='/add-restaurant' element={
                <PrivateRoute>
                  <AddRestaurant />
                </PrivateRoute>
              } />
              <Route path='/dashboard' element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path='/instore-orders' element={
                <PrivateRoute>
                  <InStoreBilling />
                </PrivateRoute>
              } />
              <Route path='/order-history' element={
                <PrivateRoute>
                  <OrderHistory />
                </PrivateRoute>
              } />
              <Route path='/profile' element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path='/review' element={
                <PrivateRoute>
                  <Review />
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </MenuProvider>
      </AuthProvider>
    </MobileMenuProvider>
  )
}

export default App

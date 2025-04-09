import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import AddRestaurant from './pages/AddRestaurant'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Orders from './components/Orders'
import InventoryManager from './components/InventoryManager'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/inventory' element={<InventoryManager />} />
          <Route path='/menu' element={<Dashboard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/add-restaurant' element={<AddRestaurant />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

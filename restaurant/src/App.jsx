import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import AddRestaurant from './pages/AddRestaurant'
import { MobileMenuProvider } from './context/MobileMenuContext'
import Orders from './components/Orders'
import ItemSummary from './components/ItemSummary'
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
import AdminRoute from './adminComp/AdminRoute'
import AuthProvider from './context/AuthContext'
import Footer from './components/Footer';
import Contactus from './components/Contactus';
import Lowstock from './components/LowStock';
import Summary from './components/Summary'
import Features from './components/Features'
import MenuEditor from './pages/MenuEditor'
import Feedback from './pages/Feedback'
import Business from './adminComp/Business'
import AdminBusinessDashboard from './adminComp/AdminBusinessDashboard';
import BusinessProfile from './adminComp/BusinessProfile'
import AdminFeedback from './adminComp/AdminFeedback'
import Expiry from './components/Expiry';
import Offers from './pages/Offers';
function App() {
  return (
    <MobileMenuProvider>
      <AuthProvider>
        <Router>
          <MenuProvider>
            <ToastContainer autoClose={1000} />
            
            <Routes>
              {/* Public Routes */}
              <Route path='/' element={<LandingPage />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/Aboutb2b' element={<Aboutus />} />
              <Route path='/Footer' element={<Footer />} />
              <Route path='/contactus' element={<Contactus />} />
              <Route path='/features' element={<Features />} />
              {/* Protected Routes */}
              <Route path='/orders' element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              } />
              <Route path='/orders/item-summary' element={
                <PrivateRoute>
                  <ItemSummary />
                </PrivateRoute>
              } />
              <Route path='/features' element={
                <PrivateRoute>
                  <Features />
                </PrivateRoute>
              } />
              <Route path='/inventory' element={
                <PrivateRoute>
                  <InventoryManager />
                </PrivateRoute>
              } />
              <Route path='/menu' element={
                <PrivateRoute>
                  <MenuEditor />
                </PrivateRoute>
              } />
              <Route path='/add-restaurant' element={
                <PrivateRoute>
                  <AddRestaurant />
                </PrivateRoute>
              } />
              <Route path='/dashboard' element={
                <PrivateRoute>
                  <MenuEditor />
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
              <Route path='/summary' element={
                <PrivateRoute>
                  <Summary />
                </PrivateRoute>
              } />
              <Route path='/feedback' element={
                <PrivateRoute>
                  <Feedback />
                </PrivateRoute>
              } /> 
              <Route path='/offers' element={
                <PrivateRoute>
                  <Offers />
                </PrivateRoute>
              } /> 
              <Route path='/menu/expiry' element={
                <PrivateRoute>
                  <Expiry />
                </PrivateRoute>
              } />
              <Route path='/menu/lowstock' element={
                <PrivateRoute>
                  <Lowstock />
                </PrivateRoute>
              } />
              {/* Admin Routes */}
              <Route path='/business' element={
                <AdminRoute>
                  <Business />
                </AdminRoute>
              } />
              <Route path='/admin-feedback'
                element={
                  <AdminRoute>
                    <AdminFeedback />
                  </AdminRoute>
                } />
              <Route path='/admin-business-dashboard/:ownerId/*' element={<AdminBusinessDashboard />}>
                <Route index element={<Summary adminMode />} />
                <Route path='orders' element={<Orders adminMode />} />
                <Route path='orders/item-summary' element={<ItemSummary adminMode />} />
                <Route path='menu' element={<MenuEditor adminMode />} />
                <Route path='summary' element={<Summary adminMode />} />
                <Route path='instore-orders' element={<InStoreBilling adminMode />} />
                <Route path='order-history' element={<OrderHistory adminMode />} />
                <Route path='profile' element={<BusinessProfile adminMode />} />
              </Route>
            </Routes>

          </MenuProvider>
        </Router>
      </AuthProvider>
    </MobileMenuProvider>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/unprotected/welcomePage/Home'
import Login from './pages/unprotected/login/Login'
import Register from './pages/unprotected/login/Register'
import DeliveryPartnerReg from './pages/unprotected/deliveryRegistration/DeliveryPartnerReg'
import Review from './pages/protected/review/Review'
import AppLayout from './pages/protected/AppLayout'
import Dashboard from './pages/protected/dashboard/Dashboard.jsx'
import Orders from './pages/protected/orders/Orders.jsx'
import Profile from './pages/protected/profile/Profile.jsx'
import MyOrders from './pages/protected/orders/MyOrders.jsx'
import CompletedOrders from './pages/protected/orders/CompletedOrders.jsx'
import ForgotPassword from './pages/unprotected/login/ForgotPassword.jsx'
// Admin imports
import AdminLayout from './pages/protected/admin/AdminLayout.jsx'
import DeliveryPartners from './pages/protected/admin/DeliveryPartners.jsx'
import DeliveryPartnerDetails from './pages/protected/admin/DeliveryPartnerDetails.jsx'
import DeliveryPartnerOrders from './pages/protected/admin/DeliveryPartnerOrders.jsx'
import DeliveryPartnerCompletedOrders from './pages/protected/admin/DeliveryPartnerCompletedOrders.jsx'
import AvailableOrders from './pages/protected/admin/AvailableOrders.jsx'

function App() {

  return (
    <div>
      <Header />
      <Routes>

        {/* Unprotected Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/delivery-partner-registration" element={<DeliveryPartnerReg />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* Protected Routes */}
        <Route path="/review" element={<Review />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="completed-orders" element={<CompletedOrders />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="delivery-partners" element={<DeliveryPartners />} />
          <Route path="delivery-partners/:id" element={<DeliveryPartnerDetails />} />
          <Route path="delivery-partners/:id/orders" element={<DeliveryPartnerOrders />} />
          <Route path="delivery-partners/:id/completed-orders" element={<DeliveryPartnerCompletedOrders />} />
          <Route path="available-orders" element={<AvailableOrders />} />
        </Route>


      </Routes>
    </div>
  )
}

export default App

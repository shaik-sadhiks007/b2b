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

        {/* Protected Routes */}
        <Route path="/review" element={<Review />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="completed-orders" element={<CompletedOrders />} />
        </Route>


      </Routes>
    </div>
  )
}

export default App

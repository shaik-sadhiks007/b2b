import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/unprotected/welcomePage/Home'
import Login from './pages/unprotected/login/Login'
import Register from './pages/unprotected/login/Register'
import DeliveryPartnerReg from './pages/unprotected/deliveryRegistration/DeliveryPartnerReg'

function App() {

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/delivery-partner-registration" element={<DeliveryPartnerReg />} />

      </Routes>
    </div>
  )
}

export default App

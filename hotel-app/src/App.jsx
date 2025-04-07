import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./authentication/Login";
import Register from "./authentication/Register";
import MenuItems from "./admin/MenuItems";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderHistory from "../src/admin/OrderHistory";
import EditMenu from "./admin/EditMenu";
import CreateMenu from "./admin/CreateMenu";
import Profile from "./components/Profile";
import AddressManagement from "./components/AddressManagement";
import MenuTemplate from "./admin/MenuTemplate";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";

function App() {
    useEffect(() => {
        // Check for token in localStorage first
        const transferToken = localStorage.getItem('transferToken');
        if (transferToken) {
            localStorage.setItem('token', transferToken);
            localStorage.removeItem('transferToken');
            console.log('Token received from transfer');
        }

        // Define the message handler function
        const messageHandler = (event) => {
            if (event.origin !== "http://localhost:5174") return;  // Verify origin
            const { token } = event.data;
            if (token) {
                localStorage.setItem("token", token); // Store token
                console.log("Token received and stored:", token);
            }
        };

        // Add event listener
        window.addEventListener("message", messageHandler);

        // Notify parent window that this window is ready
        window.postMessage('ready', '*');

        // Cleanup
        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, []);

    return (
        <BrowserRouter>
            <ToastContainer />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/admin' element={<MenuItems />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/create-menu" element={<CreateMenu />} />
                <Route path="/edit-menu/:id" element={<EditMenu />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/address-management" element={<AddressManagement />} />
                <Route path="/menu-templates" element={<MenuTemplate />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

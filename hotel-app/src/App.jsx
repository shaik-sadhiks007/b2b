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



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home/>} />
                <Route path='/login' element={<Login/>} />
                <Route path='/register' element={<Register/>} />
                <Route path='/admin' element={<MenuItems/>} />
                <Route path="/cart" element={<Cart/>} />
                <Route path="/checkout" element={<Checkout/>} />
                <Route path="/order-history" element={<OrderHistory/>} />
                <Route path="/create-menu" element={<CreateMenu/>} />
                <Route path="/edit-menu/:id" element={<EditMenu/>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;

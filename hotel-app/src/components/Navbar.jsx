import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotelContext } from "../contextApi/HotelContextProvider";


function Navbar() {

    const { user, logout } = useContext(HotelContext);

    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/');
        logout()

    }


    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">Hotel Logo</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-3">
                        <li className="nav-item"><Link className="nav-link text-black" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/">About</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/">Contact</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/cart">Cart</Link></li>
                        <li className="nav-item"><Link className="nav-link text-black" to="/order-history">Orders</Link></li>

                        {
                            user?.role == "admin" && (
                                <li className="nav-item"><Link className="nav-link text-black" to="/admin">Menu Items</Link></li>
                            )
                        }
                        {
                            user?.role ? (
                                <li className="nav-item"><button className="btn btn-dark" onClick={() => handleLogout()}>Logout</button></li>

                            ) : (
                                <li className="nav-item"><Link className="nav-link text-black" to="/login">Login</Link></li>

                            )
                        }
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

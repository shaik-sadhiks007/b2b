import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch cart");
            
            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return; 

        try {
            const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) throw new Error("Failed to update quantity");

            const updatedItem = await response.json();
            setCart(cart.map((item) => (item._id === id ? updatedItem : item)));
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeItem = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete item");

            setCart(cart.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleCheckout = () => {
        navigate("/checkout");
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h1 className="text-center">Cart</h1>
                {cart.length === 0 ? (
                    <p className="text-center">Your cart is empty.</p>
                ) : (
                    <>
                        {cart.map((item) => (
                            <div key={item._id} className="card mb-3 p-3">
                                <div className="row align-items-center">
                                    <div className="col-3 col-md-2">
                                        {item.image && (
                                            <img src={item.image} alt={item.menuName} className="img-fluid rounded" style={{ height: "50px", width: "50px", objectFit: "cover" }} />
                                        )}
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <h6 className="mb-0">{item.menuName}</h6>
                                        <p className="text-muted mb-0">₹{item.price}</p>
                                    </div>
                                    <div className="col-3 col-md-2">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={item.quantity || 1}
                                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                                            min="1"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4 text-end">
                                        <button className="btn btn-sm btn-danger me-2" onClick={() => removeItem(item._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="text-center">
                            <button className="btn btn-dark mt-3" onClick={handleCheckout}>Checkout</button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Cart;

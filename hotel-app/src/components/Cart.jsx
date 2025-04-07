import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { toast } from 'react-toastify';

function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCart(localCart);
        }
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

    const handleQuantityChange = async (itemId, change) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                const updatedCart = cart.map(item =>
                    item._id === itemId
                        ? { ...item, quantity: Math.max(1, item.quantity + change) }
                        : item
                );
                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                return;
            }

            const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ quantity: Math.max(1, cart.find(item => item._id === itemId).quantity + change) })
            });

            if (response.ok) {
                const updatedCart = cart.map(item =>
                    item._id === itemId
                        ? { ...item, quantity: Math.max(1, item.quantity + change) }
                        : item
                );
                setCart(updatedCart);
            } else {
                toast.error("Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update quantity");
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                const updatedCart = cart.filter(item => item._id !== itemId);
                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                return;
            }

            const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setCart(cart.filter(item => item._id !== itemId));
                toast.success("Item removed from cart");
            } else {
                toast.error("Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Failed to remove item");
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
                                            <img
                                                src={item.image}
                                                alt={item.menuName}
                                                className="img-fluid rounded"
                                                style={{ height: "50px", width: "50px", objectFit: "cover" }}
                                            />
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
                                            onChange={(e) =>
                                                handleQuantityChange(item._id, parseInt(e.target.value) - (item.quantity || 1))
                                            }
                                            min="1"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4 text-end">
                                        <button
                                            className="btn btn-sm btn-danger me-2"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="text-center">
                            <button className="btn btn-dark mt-3" onClick={handleCheckout}>
                                Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Cart;

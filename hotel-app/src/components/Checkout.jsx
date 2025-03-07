import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

function Checkout() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [form, setForm] = useState({
        name: "", phone: "", address: "", city: "", state: "", country: "India", pincode: ""
    });
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const navigate = useNavigate();
    const shippingCharge = 10;

    const statesOfAP = [
        "Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna",
        "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam",
        "Vizianagaram", "West Godavari"
    ];

    // Fetch cart from API
    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                const localCart = JSON.parse(localStorage.getItem("cart")) || [];
                setCart(localCart);
                updateTotal(localCart);
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/cart", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch cart");
                }

                const data = await response.json();
                setCart(data);
                updateTotal(data);
            } catch (error) {
                console.error("Error fetching cart:", error);
                alert("Error fetching cart");
            }
        };

        fetchCart();
    }, []);

    // Update total price
    const updateTotal = (cartItems) => {
        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalPrice + shippingCharge);
    };

    // Handle form inputs
    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Update quantity
    const updateQuantity = async (index, change) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + change);
        setCart(updatedCart);
        updateTotal(updatedCart);

        const token = localStorage.getItem("token");
        if (!token) {
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return;
        }

        try {
            await fetch(`http://localhost:5000/api/cart/${updatedCart[index]._id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ quantity: updatedCart[index].quantity })
            });
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    // Delete item from cart
    const deleteItem = async (index) => {
        const itemId = cart[index]._id;
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        updateTotal(updatedCart);

        const token = localStorage.getItem("token");
        if (!token) {
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return;
        }


        try {
            await fetch(`http://localhost:5000/api/cart//${itemId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (Object.values(form).some(field => field.trim() === "")) {
            alert("Please fill in all fields.");
            return;
        }

        const token = localStorage.getItem("token");

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const orderData = {
            items: cart,
            shippingDetails: { ...form },
            // totalAmount: total - shippingCharge,
            totalAmount: total,
            paymentMethod: paymentMethod,
        };

        try {
            const apiUrl = token ? "http://localhost:5000/api/orders/place-order" : "http://localhost:5000/api/orders/place-order/guest-login";

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Order placed successfully using ${paymentMethod}!`);

                if (token) {
                    await fetch("http://localhost:5000/api/cart", {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                } else {
                    localStorage.removeItem("cart");
                }

                navigate("/");
            } else {
                alert(`Failed to place order: ${data.error}`);
            }
        } catch (error) {
            alert("An error occurred while placing the order.");
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h2 className="">Checkout</h2>

                {cart.length === 0 ? (
                    <p className="text-center">Your cart is empty.</p>
                ) : (
                    <>
                        {/* Order Summary */}
                        <div className="card p-3 mb-4">
                            <h5>Order Summary</h5>
                            {cart.map((item, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                    <div>
                                        <h6 className="mb-0">{item.menuName}</h6>
                                        <small className="text-muted">Qty: {item.quantity}</small>
                                        <div>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(index, -1)}>-</button>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(index, 1)}>+</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => deleteItem(index)}>Delete</button>
                                        </div>
                                    </div>
                                    <p className="mb-0">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                            <h6 className="mt-3 text-end">Shipping: ₹{shippingCharge}</h6>
                            <h5 className="text-end">Total: ₹{total}</h5>
                        </div>

                        {/* Shipping Details Form */}
                        <div className="card p-3">
                            <h5>Shipping Details</h5>
                            {["name", "phone", "address", "city", "pincode"].map((field, index) => (
                                <div className="mb-2" key={index}>
                                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                    <input
                                        type={field === "pincode" || field === "phone" ? "number" : "text"}
                                        name={field}
                                        className="form-control"
                                        value={form[field]}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            ))}

                            {/* State Dropdown */}
                            <div className="mb-2">
                                <label className="form-label">State</label>
                                <select name="state" className="form-control" value={form.state} onChange={handleInputChange} required>
                                    <option value="">Select State</option>
                                    {statesOfAP.map((state, index) => (
                                        <option key={index} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Method */}
                            {/* Payment Method */}
                            <div className="mb-3">
                                <h5>Payment Method</h5>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        className="form-check-input"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                    />
                                    <label className="form-check-label" htmlFor="cod">Cash on Delivery (COD)</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="upi"
                                        name="paymentMethod"
                                        className="form-check-input"
                                        value="UPI"
                                        checked={paymentMethod === "UPI"}
                                        onChange={() => setPaymentMethod("UPI")}
                                    />
                                    <label className="form-check-label" htmlFor="upi">Pay using UPI</label>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button className="btn btn-dark w-100 mt-3" onClick={handlePlaceOrder}>Place Order</button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Checkout;

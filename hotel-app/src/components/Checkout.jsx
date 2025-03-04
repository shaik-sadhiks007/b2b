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

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
        updateTotal(storedCart);
    }, []);

    const updateTotal = (cartItems) => {
        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalPrice + shippingCharge);
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const updateQuantity = (index, change) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + change);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        updateTotal(updatedCart);
    };

    const deleteItem = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        updateTotal(updatedCart);
    };

    const handlePlaceOrder = async () => {
        if (Object.values(form).some(field => field.trim() === "")) {
            alert("Please fill in all fields.");
            return;
        }

        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        const token = localStorage.getItem("token");

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const orderData = {
            items: cartItems,
            totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
            paymentMethod: paymentMethod,
        };

        try {
            const response = await fetch("http://localhost:5000/api/orders/place-order", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Order placed successfully using ${paymentMethod}!`);
                localStorage.removeItem("cart");
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

                            {/* Country (Fixed as India) */}
                            <div className="mb-2">
                                <label className="form-label">Country</label>
                                <input type="text" className="form-control" value="India" disabled />
                            </div>

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

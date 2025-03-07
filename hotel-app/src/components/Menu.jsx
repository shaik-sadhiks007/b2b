import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Menu() {
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Fetch today's menu
        axios.get("http://localhost:5000/api/menu/today")
            .then((response) => {
                setMenu(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load menu.");
                setLoading(false);
            });

        // Fetch the user's cart from localStorage or backend
        if (token === null) {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCart(localCart);
        } else {
            axios.get("http://localhost:5000/api/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    setCart(response.data);
                })
                .catch(() => {
                    setError("Failed to load cart.");
                });
        }
    }, []);

    const handleAddToCart = async (item, mealTime) => {
        let token = localStorage.getItem("token");

        if (token === null) {
            // Retrieve existing cart items from localStorage
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];

            // Create a new cart item
            const newItem = {
                menuName: item.menuName,
                price: item.price,
                image: item.image,
                mealTime,
                quantity: 1,
                date: new Date().toISOString().split("T")[0],
            };

            // Add the new item to the local cart
            localCart.push(newItem);

            // Store the updated cart in localStorage
            localStorage.setItem("cart", JSON.stringify(localCart));

            // Update the local state
            setCart([...cart, newItem]);

            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/cart",
                {
                    menuName: item.menuName,
                    price: item.price,
                    image: item.image,
                    mealTime,
                    quantity: 1,
                    date: new Date().toISOString().split("T")[0],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCart([...cart, response.data]);
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const handleGoToCart = () => {
        navigate("/cart");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container text-black mt-4">
            <h2 className="text-center">Today's Menu</h2>
            {menu !== null ? (
                <>
                    {["morning", "afternoon", "evening"].map((mealTime) => (
                        <div key={mealTime} className="mt-3">
                            <h4 className="text-center text-capitalize">{mealTime} Menu</h4>
                            <div className="row">
                                {menu[mealTime].map((item, index) => {
                                    const isInCart = Array.isArray(cart) && cart.some(
                                        (cartItem) => cartItem.menuName === item.menuName && cartItem.mealTime === mealTime
                                    );
                                    return (
                                        <div key={index} className="col-md-4 mb-3">
                                            <div className="card" style={{ backgroundColor: "white", color: "black" }}>
                                                {item.image && <img src={item.image} alt={item.menuName} className="card-img-top" style={{ height: "150px", objectFit: "cover" }} />}
                                                <div className="card-body">
                                                    <h5 className="card-title">{item.menuName}</h5>
                                                    {item.price && <p className="card-text">Price: ₹{item.price}</p>}
                                                    {isInCart ? (
                                                        <button className="btn btn-warning me-2" onClick={handleGoToCart}>Go to Cart</button>
                                                    ) : (
                                                        <button className="btn btn-dark me-2" onClick={() => handleAddToCart(item, mealTime)}>Add to Cart</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <h5 className="text-center my-5">Not started yet...</h5>
            )}
        </div>
    );
}

export default Menu;

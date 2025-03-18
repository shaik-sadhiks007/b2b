import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Menu() {
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [filteredMenu, setFilteredMenu] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Fetch today's menu
        axios.get("http://localhost:5000/api/menu/today")
            .then((response) => {
                setMenu(response.data);
                setFilteredMenu(response.data);
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

    // Filter menu items based on search and price range
    useEffect(() => {
        if (!menu) return;

        const filtered = { ...menu };
        ["morning", "afternoon", "evening"].forEach(timeSlot => {
            if (menu[timeSlot] && Array.isArray(menu[timeSlot])) {
                // First filter out items with empty menuName
                const validItems = menu[timeSlot].filter(item => item.menuName && item.menuName.trim() !== '');
                
                // Then apply search and price filters
                filtered[timeSlot] = validItems.filter(item => {
                    const matchesSearch = searchQuery === "" || 
                        item.menuName.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    const matchesMinPrice = !priceRange.min || item.price >= Number(priceRange.min);
                    const matchesMaxPrice = !priceRange.max || item.price <= Number(priceRange.max);

                    return matchesSearch && matchesMinPrice && matchesMaxPrice;
                });
            }
        });

        setFilteredMenu(filtered);
    }, [menu, searchQuery, priceRange]);

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleAddToCart = async (item, mealTime) => {
        let token = localStorage.getItem("token");

        if (token === null) {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            const newItem = {
                menuName: item.menuName,
                price: item.price,
                image: item.image,
                mealTime,
                quantity: 1,
                date: new Date().toISOString().split("T")[0],
            };
            localCart.push(newItem);
            localStorage.setItem("cart", JSON.stringify(localCart));
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

    if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;

    return (
        <div className="container text-black mt-4">
            <h2 className="text-center">Today's Menu</h2>

            {/* Search and Filter Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search menu items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Min price"
                                    value={priceRange.min}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Max price"
                                    value={priceRange.max}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {filteredMenu !== null ? (
                <>
                    {["morning", "afternoon", "evening"].map((mealTime) => {
                        // Only show section if it has valid items (non-empty menuName)
                        const hasValidItems = filteredMenu[mealTime] && 
                            Array.isArray(filteredMenu[mealTime]) && 
                            filteredMenu[mealTime].length > 0;

                        return hasValidItems ? (
                            <div key={mealTime} className="mt-3">
                                {/* <h4 className="text-center text-capitalize">{mealTime} Menu</h4> */}
                                <div className="row">
                                    {filteredMenu[mealTime].map((item, index) => {
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
                        ) : null;
                    })}
                    {/* Show message if no items match the filters */}
                    {!["morning", "afternoon", "evening"].some(time => 
                        filteredMenu[time] && 
                        Array.isArray(filteredMenu[time]) && 
                        filteredMenu[time].length > 0
                    ) && (
                        <div className="alert alert-info text-center">
                            No menu items found matching your search criteria.
                        </div>
                    )}
                </>
            ) : (
                <h5 className="text-center my-5">Not started yet...</h5>
            )}
        </div>
    );
}

export default Menu;

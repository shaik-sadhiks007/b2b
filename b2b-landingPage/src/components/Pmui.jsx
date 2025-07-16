import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { useCart } from "../context/CartContext";
import { useRestaurantDetails } from "../hooks/useRestaurantDetails";
import "react-loading-skeleton/dist/skeleton.css";

const MenuItemCard = ({ name, price, imageUrl, description, onAdd }) => {
  return (
    <div className="bg-white bg-opacity-90 rounded-xl p-4 mb-4 shadow-md flex items-center justify-between">
      <div className="flex-1 pr-4">
        <h2 className="font-bold text-lg text-green-800">{name}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="mt-2 font-semibold text-gray-800">₹{price}</p>
      </div>
      <img
        src={imageUrl || "/plogo.png"}
        alt={name}
        className="w-14 h-14 object-cover rounded-md border"
      />
      <button
        onClick={onAdd}
        className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
      >
        ADD
      </button>
    </div>
  );
};

const Pmui = ({ id }) => {
  const navigate = useNavigate();
  const { user } = useContext(HotelContext);
  const { carts, addToCart, isItemInCart, fetchCart, clearCart } = useCart();
  const { restaurant, menu, isLoading, error } = useRestaurantDetails(id);

  const [filteredMenu, setFilteredMenu] = useState([]);

  useEffect(() => {
    if (menu) {
      setFilteredMenu(menu);
    }
  }, [menu]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const items = [
      {
        itemId: item._id,
        name: item.name,
        quantity: 1,
        totalPrice: Number(item.totalPrice),
        foodType: item.foodType,
        photos: [item.photos] || [],
      },
    ];

    await addToCart(
      restaurant._id,
      restaurant.name,
      items,
      restaurant.serviceType
    );
  };

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-20">Error: {error.message}</div>;
  if (!restaurant) return <div className="text-center mt-20">Restaurant not found</div>;

  return (
    <div className="min-h-screen bg-[url('/assets/banana.avif')] bg-cover bg-fixed p-4">
      <header className="text-center mb-6">
        <img src="/plogo.png" alt="Logo" className="mx-auto h-20 rounded-full" />
        <h1 className="text-2xl font-bold text-red-800">Pantulu Gaari Mess</h1>
        <p className="text-sm text-green-700">Authentic Andhra Meals</p>
      </header>

      {filteredMenu?.length === 0 ? (
        <p className="text-center text-gray-500">Menu not available</p>
      ) : (
        filteredMenu.map((category, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-xl font-semibold text-black-900 mb-3">{category.name}</h2>
            {category.subcategories.map((sub, j) => (
              <div key={j}>
                {sub.items.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    name={item.name}
                    price={item.totalPrice}
                    imageUrl={item.photos}
                    
                    onAdd={() => handleAddToCart(item)}
                  />
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Pmui;

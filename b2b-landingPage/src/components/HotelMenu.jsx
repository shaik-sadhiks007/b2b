import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Star, X } from "lucide-react";

export const VegIcon = () => (
  <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
  </div>
);
export const NonVegIcon = () => (
  <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
  </div>
);

function formatName(name = "") {
  if (name.toLowerCase() === "uncategorized") return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const HotelMenu = ({ menu, onAddToCart, isItemInCart, restaurantOnline }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);

  // Expand all categories by default when menu changes
  useEffect(() => {
    if (menu && menu.length > 0) {
      setExpandedCategories(new Set(menu.map(cat => cat.category)));
    }
  }, [menu]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };
  const toggleSubcategory = (cat, subcat) => {
    const key = `${cat}--${subcat}`;
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };
  const scrollToCategory = (category) => {
    const el = document.getElementById(`category-${category}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setShowMenuOverlay(false);
    }
  };
  const getTotalItemsInCategory = (cat) =>
    cat.subcategories.reduce((total, sub) => total + sub.items.length, 0);

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Menu Overlay */}
      {showMenuOverlay && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowMenuOverlay(false)}>
          <div className="bg-black text-white p-8 rounded-lg w-80 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button onClick={() => setShowMenuOverlay(false)} className="cursor-pointer text-white hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {menu.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => scrollToCategory(cat.category)}
                  className="flex cursor-pointer justify-between items-center w-full text-left py-2 hover:text-gray-300"
                >
                  <span className="text-lg">{cat.category.toLowerCase() === "uncategorized" ? "Uncategorized" : formatName(cat.category)}</span>
                  <span className="text-xl font-bold">{getTotalItemsInCategory(cat)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Menu Button */}
      <div className="fixed bottom-6 right-5 lg:right-32 z-40">
        <button
          onClick={() => setShowMenuOverlay(true)}
          className="w-16 h-16 cursor-pointer bg-black text-white rounded-full font-semibold shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          MENU
        </button>
      </div>
      {/* Main Menu Content */}
      <div className="p-4">
        {menu.map((cat) => (
          <div key={cat.category} id={`category-${cat.category}`} className="mb-8">
            {/* Category Header as Accordion */}
            <button
              onClick={() => toggleCategory(cat.category)}
              className="w-full flex justify-between items-center p-4 text-left bg-white border-b border-gray-200 hover:bg-gray-50 rounded-t-lg"
            >
              {formatName(cat.category) !== null && (
                <h2 className="text-2xl font-bold text-gray-800">{formatName(cat.category)}</h2>
              )}
              {expandedCategories.has(cat.category) ? (
                <ChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </button>
            {/* Category Content Accordion */}
            {expandedCategories.has(cat.category) && (
              <div>
                {/* If only subcategory is general, show items directly */}
                {cat.subcategories.length === 1 && cat.subcategories[0].subcategory === "general" ? (
                  <div className="space-y-4">
                    {cat.subcategories[0].items.map((item) => (
                      <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {item.foodType === "veg" ? <VegIcon /> : <NonVegIcon />}
                                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                              </div>
                              <p className="text-lg font-bold text-gray-900 mb-2">₹{item.totalPrice}</p>
                              {item.description && <p className="text-gray-600 text-sm mb-2">{item.description}</p>}

                            </div>

                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative block md:hidden">
                              {item?.photos && item.photos !== '' ? (
                                <img
                                  src={item.photos}
                                  alt={item.name}
                                  className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                  <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative hidden md:block">
                              {item?.photos && item.photos !== '' ? (
                                <img
                                  src={item.photos}
                                  alt={item.name}
                                  className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                  <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                </div>
                              )}
                            </div>

                            <button
                              className={`w-full md:w-43 px-6 py-2 rounded-lg font-semibold ${!item.inStock || !restaurantOnline
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : isItemInCart && isItemInCart(item._id)
                                  ? "bg-green-500 text-white hover:bg-green-600"
                                  : "border-2 border-green-500 text-green-500 hover:bg-green-50"
                                }`}
                              disabled={!item.inStock || !restaurantOnline}
                              onClick={() => onAddToCart && onAddToCart(item)}
                            >
                              {item.inStock ? (isItemInCart && isItemInCart(item._id) ? "GO TO CART" : "ADD") : "OUT OF STOCK"}
                            </button>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cat.subcategories.map((subcat) => (
                      <div key={subcat.subcategory} className="border border-gray-200 rounded-lg">
                        {/* Subcategory Header */}
                        <button
                          onClick={() => toggleSubcategory(cat.category, subcat.subcategory)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                        >
                          <h3 className="text-lg font-semibold text-gray-800">
                            {formatName(subcat.subcategory)} ({subcat.items.length})
                          </h3>
                          {expandedSubcategories.has(`${cat.category}--${subcat.subcategory}`) ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        {/* Subcategory Items */}
                        {expandedSubcategories.has(`${cat.category}--${subcat.subcategory}`) && (
                          <div className="border-t border-gray-200">
                            {subcat.items.map((item) => (
                              <div key={item._id} className="p-4 border-b border-gray-100 last:border-b-0 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        {item.foodType === "veg" ? <VegIcon /> : <NonVegIcon />}
                                        <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                                      </div>
                                      <p className="text-lg font-bold text-gray-900 mb-2">₹{item.totalPrice}</p>
                                      {item.description && <p className="text-gray-600 text-sm mb-2">{item.description}</p>}
                                    </div>
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative block md:hidden">
                                      {item?.photos && item.photos !== '' ? (
                                        <img
                                          src={item.photos}
                                          alt={item.name}
                                          className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`}
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                          <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative hidden md:block">
                                      {item?.photos && item.photos !== '' ? (
                                        <img
                                          src={item.photos}
                                          alt={item.name}
                                          className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`}
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                          <span className="text-white text-md font-bold text-center px-2">{item.name}</span>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      className={`w-full md:w-43 px-6 py-2 rounded-lg font-semibold ${!item.inStock || !restaurantOnline
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : isItemInCart && isItemInCart(item._id)
                                          ? "bg-green-500 text-white hover:bg-green-600"
                                          : "border-2 border-green-500 text-green-500 hover:bg-green-50"
                                        }`}
                                      disabled={!item.inStock || !restaurantOnline}
                                      onClick={() => onAddToCart && onAddToCart(item)}
                                    >
                                      {item.inStock ? (isItemInCart && isItemInCart(item._id) ? "GO TO CART" : "ADD") : "OUT OF STOCK"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelMenu; 
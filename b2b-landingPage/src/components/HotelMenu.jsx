import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export const VegIcon = () => (
  <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
  </div>
);
export const NonVegIcon = () => (
  <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center">
    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
  </div>
);

function formatName(name = "") {
  if (name.toLowerCase() === "uncategorized") return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const HotelMenu = ({ menu, renderItemActions, restaurantOnline, boldHeaders = false }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);

  const isTransparentSubdomain = window.location.hostname.startsWith("pantulugaarimess");

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
    <div className={`max-w-4xl mx-auto font-sans ${isTransparentSubdomain ? "bg-transparent" : "bg-white"}`}>
      {showMenuOverlay && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowMenuOverlay(false)}>
          <div className="bg-black text-white p-8 rounded-lg w-80 max-w-sm font-sans" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold font-sans">Menu</h2>
              <button onClick={() => setShowMenuOverlay(false)} className="cursor-pointer text-white hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 font-sans">
              {menu.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => scrollToCategory(cat.category)}
                  className="flex cursor-pointer justify-between items-center w-full text-left py-2 hover:text-gray-300 font-sans"
                >
                  <span className="text-lg font-sans">{formatName(cat.category)}</span>
                  <span className="text-xl font-bold font-sans">{getTotalItemsInCategory(cat)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-5 lg:bottom-10 lg:right-32 z-40">
        <button
          onClick={() => setShowMenuOverlay(true)}
          className="w-12 h-12 lg:w-16 lg:h-16 text-xs cursor-pointer bg-black text-white rounded-full font-semibold shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-sans"
        >
          MENU
        </button>
      </div>

      <div className="p-4 font-sans">
        {menu.map((cat) => (
          <div key={cat.category} id={`category-${cat.category}`} className="mb-8">
            <button
              onClick={() => toggleCategory(cat.category)}
              className={`w-full flex justify-between items-center p-4 text-left border-b border-gray-200 hover:bg-gray-50 rounded-t-lg font-sans ${isTransparentSubdomain ? "bg-transparent" : "bg-white"}`}
            >
              {formatName(cat.category) !== null && (
                <h2 className={`${boldHeaders ? 'text-2xl md:text-4xl font-bold' : 'text-2xl font-semibold'} text-gray-800 font-sans`}>
                  {formatName(cat.category)}
                </h2>
              )}
              {expandedCategories.has(cat.category) ? (
                <ChevronUp className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
              ) : (
                <ChevronDown className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
              )}
            </button>
            {expandedCategories.has(cat.category) && (
              <div className="font-sans">
                {cat.subcategories.length === 1 && cat.subcategories[0].subcategory === "general" ? (
                  <div className="space-y-4">
                    {cat.subcategories[0].items.map((item) => (
                      <div key={item._id} className={`border border-gray-200 rounded-lg p-4 shadow-sm ${isTransparentSubdomain ? "bg-transparent" : "bg-white"}`}>
                        <MenuItem item={item} renderItemActions={renderItemActions} restaurantOnline={restaurantOnline} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cat.subcategories.map((subcat) => (
                      <div key={subcat.subcategory} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleSubcategory(cat.category, subcat.subcategory)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 font-sans"
                        >
                          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 font-sans">
                            {formatName(subcat.subcategory)} ({subcat.items.length})
                          </h3>
                          {expandedSubcategories.has(`${cat.category}--${subcat.subcategory}`) ? (
                            <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                          )}
                        </button>
                        {expandedSubcategories.has(`${cat.category}--${subcat.subcategory}`) && (
                          <div className="border-t border-gray-200">
                            {subcat.items.map((item) => (
                              <div key={item._id} className={`p-4 border-b border-gray-100 last:border-b-0 border border-gray-200 rounded-lg shadow-sm ${isTransparentSubdomain ? "bg-transparent" : "bg-white"}`}>
                                <MenuItem item={item} renderItemActions={renderItemActions} restaurantOnline={restaurantOnline} />
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

const MenuItem = ({ item, renderItemActions, restaurantOnline }) => {
  const hasDiscount = item.discountPercentage > 0;
  const currentPrice = hasDiscount 
    ? (item.totalPrice * (1 - item.discountPercentage / 100)).toFixed(2)
    : item.totalPrice.toFixed(2);
  const discountAmount = hasDiscount 
    ? (item.totalPrice - currentPrice).toFixed(2)
    : 0;

  // Check if item is loose (you might need to adjust this condition based on your data structure)
  const isLooseItem = item.itemType === 'loose' || item.isLooseItem;

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 font-sans">
      <div className="flex justify-between w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {item.foodType === "veg" ? <VegIcon /> : <NonVegIcon />}
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 font-sans">{item.name}</h3>
          </div>
          {isLooseItem && (item.unit || item.unitValue) && (
            <div className="flex gap-1 text-sm md:text-base text-gray-500 mb-2 ml-7">
              {item.unitValue && <span>{item.unitValue}</span>}
              {item.unit && <span>{item.unit}</span>}
            </div>
          )}
          {item.description && <p className="text-gray-600 text-sm md:text-base mb-2 ml-7 font-sans">{item.description}</p>}
          <div className="flex items-center gap-2 mb-2 ml-7">
            {hasDiscount ? (
              <>
                <span className="text-xl md:text-2xl font-bold text-gray-900">
                  ₹{currentPrice}
                </span>
                <span className="text-lg md:text-xl text-gray-500 line-through">
                  ₹{item.totalPrice.toFixed(2)}
                </span>
                <div className="flex flex-col md:flex-row md:items-center gap-1">
                  <span className="text-sm md:text-base font-semibold text-green-600">
                    {item.discountPercentage}% OFF
                  </span>
                  <span className="text-xs text-green-600">
                    (Save ₹{discountAmount})
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                ₹{item.totalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 rounded-lg overflow-hidden relative block md:hidden">
          {item?.photos && item.photos !== '' ? (
            <img 
              src={item.photos} 
              alt={item.name} 
              className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`} 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
              <span className="text-white text-base md:text-lg font-bold text-center px-2 font-sans">{item.name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 rounded-lg overflow-hidden relative hidden md:block">
          {item?.photos && item.photos !== '' ? (
            <img 
              src={item.photos} 
              alt={item.name} 
              className={`w-full h-full object-cover ${(!restaurantOnline || !item.inStock) ? 'grayscale' : ''}`} 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
              <span className="text-white text-base md:text-lg font-bold text-center px-2 font-sans">{item.name}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end w-full md:w-auto">
          {renderItemActions && renderItemActions(item)}
        </div>
      </div>
    </div>
  );
};

export default HotelMenu;
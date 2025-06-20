import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ItemOffcanvas = ({
  show,
  onHide,
  onSave,
  initialData = {},
  subcategoryName = "",
  subcategoryItems = [],
}) => {
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    serviceType: "Delivery",
    foodType: "Veg",
    basePrice: "",
    photos: [],
    packagingCharges: "",
    totalPrice: "",
    customisable: true,
    isVeg: true,
    inStock: true,
  });

  const [error, setError] = useState("");

  // Reset form when initialData changes or when show becomes true
  useEffect(() => {
    if (show) {
      setError("");
      // Extract basePrice and packagingCharges from price if they're not directly available
      let basePrice = initialData.basePrice || "";
      let packagingCharges = initialData.packagingCharges || "";

      // If we have a price but no basePrice, try to extract it
      if (initialData.price && !basePrice) {
        // Remove the ₹ symbol if present
        const priceStr = initialData.price.replace("₹", "");
        basePrice = priceStr;
      }

      setItemData({
        name: initialData.name || "",
        description: initialData.description || "",
        foodType: initialData.foodType || "Veg",
        serviceType: initialData.serviceType || "Delivery",
        basePrice: basePrice,
        photos: initialData.photos || [],
        packagingCharges: packagingCharges,
        totalPrice: initialData.totalPrice || "",
        customisable:
          initialData.customisable !== undefined
            ? initialData.customisable
            : true,
        isVeg: initialData.isVeg !== undefined ? initialData.isVeg : true,
        inStock: initialData.inStock !== undefined ? initialData.inStock : true,
      });
    }
  }, [show, initialData]);

  const handleSave = () => {
    const newItemName = itemData.name?.trim().toLowerCase();
    // Validate all required fields
    if (!itemData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!initialData._id) {
      const duplicate = subcategoryItems.some((item) => {
        const itemName =
          typeof item?.name === "string" ? item.name.trim().toLowerCase() : "";
        return itemName === newItemName;
      });
      if (duplicate) {
        toast.error(`An Item with the name "${itemData.name}" already exists`);
        setItemData(prev => ({ ...prev, name: ''}));
      }
    }

    // if (!itemData.description.trim()) {
    //     toast.error('Item description is required');
    //     return;
    // }

    if (!itemData.basePrice) {
      toast.error("Base price is required");
      return;
    }

    // if (itemData.photos.length === 0) {
    //   toast.error("At least one photo is required");
    //   return;
    // }

    // Validate description length
    // if (itemData.description.length < 20) {
    //     toast.error('Description must be at least 20 characters long');
    //     return;
    // }

    // Validate description length
    // if (itemData.description.length > 200) {
    //     toast.error('Description cannot exceed 200 characters');
    //     return;
    // }

    // Calculate total price before saving
    const basePrice = parseFloat(itemData.basePrice) || 0;
    const packagingCharges = parseFloat(itemData.packagingCharges) || 0;
    const totalPrice = (basePrice + packagingCharges).toFixed(2);

    // Create a copy of itemData with the calculated total price
    const itemDataWithTotal = {
      ...itemData,
      totalPrice,
      isVeg: itemData.foodType === "Veg", // Ensure isVeg is set based on foodType
    };

    onSave(itemDataWithTotal);
    onHide();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setItemData((prev) => ({
          ...prev,
          photos: [...prev.photos, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(itemData.basePrice) || 0;
    const packagingCharges = parseFloat(itemData.packagingCharges) || 0;
    return (basePrice + packagingCharges).toFixed(2);
  };

  return (
    <div
      className={`offcanvas offcanvas-end ${show ? "show" : ""}`}
      tabIndex="-1"
      style={{ visibility: show ? "visible" : "hidden", width: "500px" }}
    >
      <div className="offcanvas-header border-bottom">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h5 className="offcanvas-title mb-0">
              {initialData.name ? "Edit Item" : "Add New Item"}
            </h5>
            {subcategoryName && (
              <small className="text-muted">{subcategoryName}</small>
            )}
          </div>
          {/* <div>
                        <button className="btn btn-link text-decoration-none me-2" onClick={onHide}>
                            Take a tour
                        </button>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div> */}
        </div>
      </div>
      <div className="offcanvas-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="container-fluid p-0">
          {/* Basic Details Section */}
          <div className="mb-4">
            <h6 className="mb-3">Basic Details</h6>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                Item Name
                <small className="text-muted">
                  {itemData.name.length} / 70
                </small>
              </label>
              <input
                type="text"
                className="form-control"
                value={itemData.name}
                onChange={(e) =>
                  setItemData({ ...itemData, name: e.target.value })
                }
                maxLength={70}
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                Item Description
                <small className="text-muted">
                  {itemData.description.length} / 200
                </small>
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={itemData.description}
                onChange={(e) =>
                  setItemData({ ...itemData, description: e.target.value })
                }
                maxLength={200}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Food Type</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="foodType"
                    id="foodTypeVeg"
                    checked={itemData.foodType === "Veg"}
                    onChange={() =>
                      setItemData({ ...itemData, foodType: "Veg" })
                    }
                  />
                  <label className="form-check-label" htmlFor="foodTypeVeg">
                    Veg
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="foodType"
                    id="foodTypeNonVeg"
                    checked={itemData.foodType === "Non-Veg"}
                    onChange={() =>
                      setItemData({ ...itemData, foodType: "Non-Veg" })
                    }
                  />
                  <label className="form-check-label" htmlFor="foodTypeNonVeg">
                    Non-Veg
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="foodType"
                    id="foodTypeEgg"
                    checked={itemData.foodType === "Egg"}
                    onChange={() =>
                      setItemData({ ...itemData, foodType: "Egg" })
                    }
                  />
                  <label className="form-check-label" htmlFor="foodTypeEgg">
                    Egg
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={itemData.serviceType}
                onChange={(e) =>
                  setItemData({ ...itemData, serviceType: e.target.value })
                }
              >
                <option value="Delivery">Delivery</option>
                <option value="Dine-in">Dine-in</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Stock Status</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inStockSwitch"
                  checked={itemData.inStock}
                  onChange={(e) =>
                    setItemData({ ...itemData, inStock: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="inStockSwitch">
                  {itemData.inStock ? "In Stock" : "Out of Stock"}
                </label>
              </div>
            </div>
          </div>

          {/* Item Photos Section */}
          <div className="mb-4">
            <h6 className="mb-3">Item Photos</h6>
            <div className="d-flex gap-3 mb-3">
              {itemData.photos.map((photo, index) => (
                <div
                  key={index}
                  className="position-relative"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
                    src={photo}
                    alt={`Item photo ${index + 1}`}
                    className="img-fluid rounded"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => {
                      const newPhotos = [...itemData.photos];
                      newPhotos.splice(index, 1);
                      setItemData({ ...itemData, photos: newPhotos });
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
              <div
                className="border rounded d-flex align-items-center justify-content-center"
                style={{ width: "100px", height: "100px", cursor: "pointer" }}
                onClick={() => document.getElementById("photoUpload").click()}
              >
                <i className="bi bi-plus-lg fs-4"></i>
                <input
                  type="file"
                  id="photoUpload"
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          {/* Item Pricing Section */}
          <div className="mb-4">
            <h6 className="mb-3">Item Pricing</h6>
            <div className="alert alert-secondary">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Customers trust brands with fair pricing. Keep same prices
                across menus offered for online ordering and in-restaurant
                dining
              </small>
            </div>
            <div className="mb-3">
              <label className="form-label">Base price</label>
              <input
                type="number"
                className="form-control"
                value={itemData.basePrice}
                onChange={(e) =>
                  setItemData({ ...itemData, basePrice: e.target.value })
                }
                placeholder="139"
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                Packaging charges
                <a href="#" className="text-decoration-none">
                  Guidelines
                </a>
              </label>
              <input
                type="number"
                className="form-control"
                value={itemData.packagingCharges}
                onChange={(e) =>
                  setItemData({ ...itemData, packagingCharges: e.target.value })
                }
                placeholder="10"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Total price</label>
              <input
                type="text"
                className="form-control"
                value={`₹${calculateTotalPrice()}`}
                disabled
              />
            </div>
          </div>

          {/* Customisation Section */}
          <div className="mb-4">
            <h6 className="mb-3">Customisation</h6>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="customisableSwitch"
                checked={itemData.customisable}
                onChange={(e) =>
                  setItemData({ ...itemData, customisable: e.target.checked })
                }
              />
              <label className="form-check-label" htmlFor="customisableSwitch">
                Allow customisation
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="offcanvas-footer border-top p-3">
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onHide}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    
    </div>
  );
};

export default ItemOffcanvas;
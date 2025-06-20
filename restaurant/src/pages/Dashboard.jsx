import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MenuContext } from "../context/MenuContext";
import Sidebar from "../components/Sidebar";
import { BiImageAdd, BiTrash } from "react-icons/bi";
import InventoryManager from "../components/InventoryManager";
import Orders from "../components/Orders";
import "../styles/Dashboard.css";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addItem,
    updateItem,
    deleteItem,
    addItemsBulk,
    deleteItemsBulk,
  } = useContext(MenuContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [defaultCategory, setDefaultCategory] = useState(null);
  const [defaultSubcategory, setDefaultSubcategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});

  // Modal states for categories/subcategories
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'category', 'subcategory'
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [modalData, setModalData] = useState({
    name: "",
    price: "",
    isVeg: true,
    parentId: null,
    itemId: null,
  });
  const [bulkItemsInput, setBulkItemsInput] = useState("");
  const [bulkTarget, setBulkTarget] = useState({
    categoryId: null,
    subcategoryId: null,
  });

  // Item form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    foodType: "Veg",
    basePrice: "",
    photos: [],
    packagingCharges: "",
    totalPrice: "",
    isVeg: true,
    inStock: true,
    quantity: 100,
  });

  const [infoTooltip, setInfoTooltip] = useState({
    show: false,
    content: "",
    position: { top: 0, left: 0 },
  });

  const [activeTab, setActiveTab] = useState("menu-editor");
  const navigate = useNavigate();

  const tabs = [
    { label: "Menu editor", path: "/menu", icon: "bi-menu-button-wide" },
  ];

  useEffect(() => {
    const base = parseFloat(itemData.basePrice) || 0;
    const packaging = parseFloat(itemData.packagingCharges) || 0;
    setItemData((prev) => ({
      ...prev,
      totalPrice: (base + packaging).toFixed(2),
    }));
  }, [itemData.basePrice, itemData.packagingCharges]);

  useEffect(() => {
    if (categories.length > 0 && !defaultCategory) {
      const firstCategory = categories[0];
      setDefaultCategory(firstCategory._id);

      if (firstCategory.subcategories.length > 0) {
        const firstSubcategory = firstCategory.subcategories[0];
        setDefaultSubcategory(firstSubcategory._id);
      }
    }
  }, [categories, defaultCategory]);

  const handleItemCheckboxChange = (itemId, isChecked) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: isChecked
    }));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemData({
      name: item.name,
      description: item.description || "",
      foodType: item.foodType || "Veg",
      basePrice: item.basePrice || "",
      photos: item.photos || [],
      packagingCharges: item.packagingCharges || "",
      totalPrice: item.totalPrice || "",
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      inStock: item.inStock !== undefined ? item.inStock : true,
      quantity: item.quantity == null ? 0 : item.quantity,
    });
    setShowItemForm(true);
  };

  const removeImage = (index) => {
    setItemData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleStatusChange = (status) => {
    setIsOnline(status === "online");
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId],
    }));
  };

  const openModal = (type, mode, data = null, parentId = null) => {
    if (mode === "edit" && !data) {
      toast.error("No data provided for editing");
      return;
    }
    setModalType(type);
    setModalMode(mode);
    setModalData({
      name: data?.name || "",
      totalPrice: data?.totalPrice || "",
      isVeg: data?.isVeg ?? true,
      parentId: parentId,
      itemId: data?._id || null,
    });
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (modalType === "category") {
      if (modalMode === "add") {
        addCategory(modalData.name);
      } else {
        if (!modalData.itemId) {
          toast.error("Category ID is required for editing");
          return;
        }
        updateCategory(modalData.itemId, modalData.name);
      }
    } else if (modalType === "subcategory") {
      if (modalMode === "add") {
        if (!modalData.parentId) {
          toast.error("Category ID is required for adding subcategory");
          return;
        }
        addSubcategory(modalData.parentId, modalData.name);
      } else {
        if (!modalData.parentId || !modalData.itemId) {
          toast.error(
            "Category ID and Subcategory ID are required for editing"
          );
          return;
        }
        updateSubcategory(modalData.parentId, modalData.itemId, modalData.name);
      }
    }
    setShowModal(false);
  };

  const handleStockChange = (itemId, newStockStatus) => {
    // Implement stock change logic if needed
  };

  const handleCategorySelect = (categoryId, subcategoryId = null) => {
    setSelectedCategory(categoryId);
    if (subcategoryId) {
      const category = categories.find((c) => c._id === categoryId);
      if (category) {
        const subcategory = category.subcategories.find(
          (s) => s._id === subcategoryId
        );
        if (subcategory) {
          setSelectedSubcategory(subcategory);
        }
      }
    }
  };

  const handleAddItemClick = (categoryId, subcategoryId) => {
    handleCategorySelect(categoryId, subcategoryId);
    setEditingItem(null);
    setItemData({
      name: "",
      description: "",
      foodType: "Veg",
      basePrice: "",
      photos: [],
      packagingCharges: "",
      totalPrice: "",
      isVeg: true,
      inStock: true,
      quantity: 100,
    });
    setShowItemForm(true);
  };

  const handleBulkAddSubmit = async (e) => {
    e.preventDefault();

    const categoryId = bulkTarget.categoryId
    const subcategoryId = bulkTarget.subcategoryId



    if (!categoryId || !subcategoryId) {
      toast.error("Please select a category and subcategory first");
      return;
    }

    const itemNames = bulkItemsInput
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (itemNames.length === 0) {
      toast.error("Please enter at least one item name");
      return;
    }

    await addItemsBulk(categoryId, subcategoryId, itemNames);
    setBulkItemsInput("");
    //toast.success(`${itemNames.length} items added successfully`);
  };

  const handleDeleteSelectedItems = async (categoryId, subcategoryId) => {
    const selectedItemIds = Object.keys(selectedItems).filter(
      (itemId) => selectedItems[itemId]
    );

    if (selectedItemIds.length === 0) {
      toast.warning("No items selected for deletion");
      return;
    }

    try {
      await deleteItemsBulk(categoryId, subcategoryId, selectedItemIds);
      setSelectedItems({});
      //toast.success(`${selectedItemIds.length} items deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete items");
      console.error("Error deleting items:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

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

  const handleItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSubcategory) {
      toast.error("Please select a category and subcategory first");
      return;
    }

    // Validate quantity
    const quantity = parseInt(itemData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      toast.error("Please enter a valid quantity (minimum 1)");
      return;
    }

    const submissionData = {
      ...itemData,
      quantity: quantity, // Ensure quantity is a number
    };

    if (editingItem) {
      updateItem(
        selectedCategory,
        selectedSubcategory._id,
        editingItem._id,
        submissionData
      );
    } else {
      addItem(selectedCategory, selectedSubcategory._id, submissionData);
    }

    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (categoryId, subcategoryId, itemId, e) => {
    e.stopPropagation();
    deleteItem(categoryId, subcategoryId, itemId);
  };

  const showInfoTooltip = (e, content) => {
    const rect = e.target.getBoundingClientRect();
    setInfoTooltip({
      show: true,
      content: content,
      position: {
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX,
      },
    });

    setTimeout(() => {
      setInfoTooltip((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  if (!user) {
    return <div>Please login to access the dashboard</div>;
  }

  const getCategoryName = (id) => categories.find(c => c._id === id)?.name || "Not selected";
  const getSubcategoryName = (catId, subId) => {
    if (!catId || !subId) return "Not selected";
    const category = categories.find(c => c._id === catId);
    if (!category) return "Not selected";
    const subcategory = category.subcategories.find(s => s._id === subId);
    return subcategory?.name || "Not selected";
  };

  return (
    <div className="container-fluid px-0">
      {infoTooltip.show && (
        <div
          className="position-absolute bg-dark text-white p-2 rounded shadow-sm"
          style={{
            top: `${infoTooltip.position.top}px`,
            left: `${infoTooltip.position.left}px`,
            zIndex: 9999,
            maxWidth: "200px",
          }}
        >
          {infoTooltip.content}
        </div>
      )}

      {showItemForm && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingItem ? "Edit Item" : "Add New Item"} -{" "}
                    {selectedSubcategory?.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowItemForm(false);
                      setEditingItem(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleItemSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Item Name*</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={itemData.name}
                            onChange={handleItemInputChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={itemData.description}
                            onChange={handleItemInputChange}
                            rows="3"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Food Type</label>
                          <select
                            className="form-select"
                            name="foodType"
                            value={itemData.foodType}
                            onChange={handleItemInputChange}
                          >
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Quantity*</label>
                          <input
                            type="number"
                            className="form-control"
                            name="quantity"
                            value={itemData.quantity}
                            onChange={handleItemInputChange}
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Base Price*</label>
                          <div className="input-group">
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              name="basePrice"
                              value={itemData.basePrice}
                              onChange={handleItemInputChange}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Packaging Charges
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              name="packagingCharges"
                              value={itemData.packagingCharges}
                              onChange={handleItemInputChange}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Total Price</label>
                          <div className="input-group">
                            <span className="input-group-text">₹</span>
                            <input
                              type="text"
                              className="form-control"
                              value={itemData.totalPrice}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Images</label>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {itemData.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="position-relative"
                            style={{ width: "100px" }}
                          >
                            <img
                              src={photo}
                              alt={`Item ${index}`}
                              className="img-thumbnail"
                              style={{ height: "100px", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              className="position-absolute top-0 end-0 btn btn-sm btn-danger"
                              onClick={() => removeImage(index)}
                            >
                              <BiTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="btn btn-outline-primary">
                        <BiImageAdd className="me-1" />
                        Add Images
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={itemData.photos.length >= 5}
                        />
                      </label>
                      <small className="text-muted ms-2">
                        Max 5 images (500KB each)
                      </small>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="inStockSwitch"
                        name="inStock"
                        checked={itemData.inStock}
                        onChange={handleItemInputChange}
                      />
                      <label className="form-check-label" htmlFor="inStockSwitch">
                        Item is in stock
                      </label>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowItemForm(false);
                          setEditingItem(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingItem ? "Update Item" : "Add Item"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "add"
                      ? `Add ${modalType === "category" ? "Category" : "Subcategory"
                      }`
                      : `Edit ${modalType === "category" ? "Category" : "Subcategory"
                      }`}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      {modalType === "category" ? "Category" : "Subcategory"}{" "}
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalData.name}
                      onChange={(e) =>
                        setModalData({ ...modalData, name: e.target.value })
                      }
                      placeholder={`Enter ${modalType === "category" ? "category" : "subcategory"
                        } name`}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleModalSubmit}
                  >
                    {modalMode === "add" ? "Add" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: "60px" }}>
        <Navbar />
        <Sidebar />

        <div className="col-lg-10 ms-auto" style={{ marginTop: "60px" }}>
          <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm">
            <div className="d-flex gap-3">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setActiveTab(tab.label.toLowerCase().replace(" ", "-"))
                  }
                  className={`btn btn-link text-decoration-none d-flex align-items-center gap-2 ${activeTab === tab.label.toLowerCase().replace(" ", "-")
                    ? "text-primary border-bottom border-2 border-primary"
                    : "text-gray-600"
                    }`}
                >
                  <i className={`bi ${tab.icon} fs-5`}></i>
                  <span className="fw-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === "menu-editor" ? (
            <div className="container-fluid px-3 my-3">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading menu...</p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <p className="text-danger">{error}</p>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0 fw-bold fs-5 fs-sm-4 fs-md-3 fs-lg-2">
                        Categories ({categories.length})
                      </h4>
                      <button
                        className="btn btn-primary d-flex align-items-center justify-content-center px-3 px-sm-4 py-2 py-sm-3"
                        onClick={() => openModal("category", "add")}
                      >
                        <i className="bi bi-plus-lg fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                        <span className="d-none d-sm-inline">Add Category</span>
                        <span className="d-inline d-sm-none"></span>
                      </button>
                    </div>

                    {/* Bulk Add Items Form */}
                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Add List of Items</h5>
                        <form onSubmit={handleBulkAddSubmit}>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Category</label>
                                <select
                                  className="form-select"
                                  value={bulkTarget.categoryId || defaultCategory || ""}
                                  onChange={(e) => setBulkTarget(prev => ({
                                    ...prev,
                                    categoryId: e.target.value,
                                    subcategoryId: null
                                  }))}
                                >
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Subcategory</label>
                                <select
                                  className="form-select"
                                  value={bulkTarget.subcategoryId || defaultSubcategory || ""}
                                  onChange={(e) => setBulkTarget(prev => ({
                                    ...prev,
                                    subcategoryId: e.target.value
                                  }))}
                                  disabled={!bulkTarget.categoryId && !defaultCategory}
                                >
                                  <option value="">Select Subcategory</option>
                                  {categories
                                    .find(c => c._id === (bulkTarget.categoryId || defaultCategory))
                                    ?.subcategories.map(sub => (
                                      <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Enter item names (one per line or comma-separated)
                            </label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={bulkItemsInput}
                              onChange={(e) => setBulkItemsInput(e.target.value)}
                              placeholder="e.g. Pappu&#10;Rasam&#10;Curd"
                            />
                            <small className="text-muted">
                              You can add multiple items at once by separating them with new lines or commas
                            </small>
                            <div className="col-md-4 d-flex align-items-end">
                              <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={!bulkItemsInput.trim()}
                              >
                                Add Items
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className="accordion" id="categoriesAccordion">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="accordion-item border rounded mb-3"
                        >
                          <div
                            className={`accordion-header d-flex justify-content-between align-items-center p-3 ${selectedCategory === category._id
                              ? "bg-light"
                              : "bg-white"
                              }`}
                            onClick={() => {
                              toggleCategory(category._id);
                              handleCategorySelect(category._id);
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <span className="fw-bold fs-5">
                                {category.name}
                              </span>
                              <span className="badge bg-secondary ms-3 fs-6">
                                {category.subcategories.reduce(
                                  (acc, sub) => acc + sub.items.length,
                                  0
                                )}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <button
                                className="btn btn-outline-info p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showInfoTooltip(
                                    e,
                                    `Click on + button to create sub-category, click on pencil to edit category name, click on trash bin to delete sub-category`
                                  );
                                }}
                                title="Info"
                              >
                                <i className="bi bi-info-circle fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                              </button>
                              <button
                                className="btn btn-outline-success p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(
                                    "subcategory",
                                    "add",
                                    null,
                                    category._id
                                  );
                                }}
                                title="Add Subcategory"
                              >
                                <i className="bi bi-plus-lg fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                              </button>
                              <button
                                className="btn btn-outline-secondary p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("category", "edit", category);
                                }}
                              >
                                <i className="bi bi-pencil fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category._id);
                                }}
                              >
                                <i className="bi bi-trash fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                              </button>
                              <i
                                className={`bi bi-chevron-${expandedCategories[category._id]
                                  ? "up"
                                  : "down"
                                  } fs-5`}
                              ></i>
                            </div>
                          </div>
                          {expandedCategories[category._id] && (
                            <div className="accordion-body p-3 bg-light">
                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory._id} className="mb-3">
                                  <div
                                    className={`d-flex justify-content-between align-items-center p-3 rounded ${selectedSubcategory?._id ===
                                      subcategory._id
                                      ? "bg-info bg-opacity-10"
                                      : "bg-white"
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubcategory(subcategory._id);
                                      handleCategorySelect(
                                        category._id,
                                        subcategory._id
                                      );
                                    }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <input
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        checked={subcategory.items.every(item => selectedItems[item._id])}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          const newSelected = { ...selectedItems };
                                          subcategory.items.forEach(item => {
                                            newSelected[item._id] = isChecked;
                                          });
                                          setSelectedItems(newSelected);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span className="fw-medium fs-6 fs-sm-5 fs-md-4 fs-lg-3">
                                        {subcategory.name}
                                      </span>
                                      <span className="badge bg-secondary ms-3 fs-6 fs-sm-5 fs-md-5 fs-lg-4 gap-2">
                                        {subcategory.items.length}
                                      </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                      <button
                                        className="btn btn-outline-info p-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showInfoTooltip(
                                            e,
                                            `Click on + icon to add more items, click on pencil to edit sub-category name, click on trash bin to delete sub-category`
                                          );
                                        }}
                                        title="Info"
                                      >
                                        <i className="bi bi-info-circle fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                      </button>
                                      <button
                                        className="btn btn-outline-secondary p-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openModal(
                                            "subcategory",
                                            "edit",
                                            subcategory,
                                            category._id
                                          );
                                        }}
                                      >
                                        <i className="bi bi-pencil fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                      </button>
                                      <button
                                        className="btn btn-outline-success p-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddItemClick(
                                            category._id,
                                            subcategory._id
                                          );
                                        }}
                                        title="Add Item"
                                      >
                                        <i className="bi bi-plus-lg fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                      </button>
                                      <button
                                        className="btn btn-outline-danger p-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteSubcategory(
                                            category._id,
                                            subcategory._id
                                          );
                                        }}
                                      >
                                        <i className="bi bi-trash fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                      </button>
                                      <i
                                        className={`bi bi-chevron-${expandedSubcategories[subcategory._id]
                                          ? "up"
                                          : "down"
                                          } fs-5`}
                                      ></i>
                                    </div>
                                  </div>
                                  {expandedSubcategories[subcategory._id] && (
                                    <div className="ms-4 ps-3 border-start">
                                      <div className="d-flex justify-content-between p-2 bg-light">
                                        <div>
                                          <span className="me-2">
                                            {Object.values(selectedItems).filter(Boolean).length} selected
                                          </span>
                                          <button
                                            className="btn btn-sm btn-outline-danger me-2"
                                            disabled={!Object.values(selectedItems).some(Boolean)}
                                            onClick={() => handleDeleteSelectedItems(category._id, subcategory._id)}
                                          >
                                            Delete Selected
                                          </button>
                                        </div>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => setSelectedItems({})}
                                        >
                                          Clear Selection
                                        </button>
                                      </div>
                                      {subcategory.items.map((item) => (
                                        <div
                                          key={item._id}
                                          className="d-flex justify-content-between align-items-center p-3 my-2 bg-white rounded"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <div className="d-flex align-items-center">
                                            <input
                                              type="checkbox"
                                              className="form-check-input me-3"
                                              checked={!!selectedItems[item._id]}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                handleItemCheckboxChange(item._id, e.target.checked);
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="fs-5" onClick={() => handleEditItem(item)}>
                                              {item.name}
                                            </span>
                                            <div className="d-flex align-items-center gap-2 ms-2">
                                              <span className="badge bg-info">Qty: {item.quantity == null ? 'not given' : item.quantity}</span>
                                              {item.inStock === false && (
                                                <span className="badge bg-danger">Out of Stock</span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="d-flex align-items-center gap-3">
                                            <button
                                              className="btn btn-outline-info p-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                showInfoTooltip(
                                                  e,
                                                  `Click here to edit item details, click on trash bin to delete the item`
                                                );
                                              }}
                                              title="Info"
                                            >
                                              <i className="bi bi-info-circle fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                            </button>
                                            <button
                                              className="btn btn-outline-danger p-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteItem(
                                                  category._id,
                                                  subcategory._id,
                                                  item._id,
                                                  e
                                                );
                                              }}
                                              title="Delete Item"
                                            >
                                              <i className="bi bi-trash fs-6 fs-sm-5 fs-md-2 fs-lg-3"></i>
                                            </button>
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
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "manage-inventory" ? (
            <InventoryManager
              categories={categories}
              onStockChange={handleStockChange}
            />
          ) : activeTab === "orders" ? (
            <Orders />
          ) : (
            <div className="container-fluid px-3">
              <div className="text-center p-4">
                <h5>Coming Soon</h5>
                <p className="text-muted">This feature is under development</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
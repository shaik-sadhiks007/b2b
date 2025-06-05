import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MenuContext } from "../context/MenuContext";
import Sidebar from "../components/Sidebar";
import ItemOffcanvas from "../components/ItemOffcanvas";
import InventoryManager from "../components/InventoryManager";
import Orders from "../components/Orders";
import "../styles/Dashboard.css";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
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
    toggleCategoryExpansion,
  } = useContext(MenuContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'category', 'subcategory', 'item'
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [modalData, setModalData] = useState({
    name: "",
    price: "",
    isVeg: true,
    customisable: false,
    parentId: null,
    itemId: null,
  });

  // Add new state for offcanvas
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [infoTooltip, setInfoTooltip] = useState({
    show: false,
    content: "",
    position: { top: 0, left: 0 },
  });

  const [activeTab, setActiveTab] = useState("menu-editor");

  const navigate = useNavigate();

  const tabs = [
    { label: "Menu editor", path: "/menu", icon: "bi-menu-button-wide" },
    // { label: "Manage inventory", path: "/inventory", icon: "bi-box-seam" },
    // { label: "Taxes", path: "/taxes", icon: "bi-calculator" },
    // { label: "Charges", path: "/charges", icon: "bi-credit-card" }
  ];

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
      customisable: data?.customisable ?? false,
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

  const handleOffcanvasSave = (itemData) => {
    if (!selectedCategory || !selectedSubcategory) {
      toast.error("Please select a category and subcategory first");
      return;
    }

    if (editingItem) {
      updateItem(
        selectedCategory,
        selectedSubcategory._id,
        editingItem._id,
        itemData
      );
    } else {
      addItem(selectedCategory, selectedSubcategory._id, itemData);
    }
    setShowOffcanvas(false);
    setEditingItem(null);
    setIsAddingNewItem(false);
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
    setIsAddingNewItem(true);
    setShowOffcanvas(true);
  };

  const handleDeleteItem = (categoryId, subcategoryId, itemId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(categoryId, subcategoryId, itemId);
    }
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

    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setInfoTooltip((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  if (!token) {
    return <div>Please login to access the dashboard</div>;
  }

  return (
    <div className="container-fluid px-0">
      {/* Info Tooltip */}
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

      {/* Item Offcanvas */}
      <ItemOffcanvas
        show={showOffcanvas}
        onHide={() => {
          setShowOffcanvas(false);
          setEditingItem(null);
          setIsAddingNewItem(false);
        }}
        onSave={handleOffcanvasSave}
        initialData={isAddingNewItem ? {} : editingItem || {}}
        subcategoryName={selectedSubcategory?.name || ""}
        subcategoryItems={selectedSubcategory?.items || []}
      />

      {/* Modal for Categories and Subcategories */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none" }}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalMode === "add"
                  ? `Add ${
                      modalType === "category" ? "Category" : "Subcategory"
                    }`
                  : `Edit ${
                      modalType === "category" ? "Category" : "Subcategory"
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
                  {modalType === "category" ? "Category" : "Subcategory"} Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={modalData.name}
                  onChange={(e) =>
                    setModalData({ ...modalData, name: e.target.value })
                  }
                  placeholder={`Enter ${
                    modalType === "category" ? "category" : "subcategory"
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
      {showModal && <div className="modal-backdrop fade show"></div>}

      <div style={{ marginTop: "60px" }}>
        <Navbar />
        <Sidebar />

        {/* Main Content */}
        <div className="col-lg-10 ms-auto" style={{ marginTop: "60px" }}>
          {/* Top Navigation */}
          <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm">
            <div className="d-flex gap-3">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setActiveTab(tab.label.toLowerCase().replace(" ", "-"))
                  }
                  className={`btn btn-link text-decoration-none d-flex align-items-center gap-2 ${
                    activeTab === tab.label.toLowerCase().replace(" ", "-")
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

          {/* Conditional Rendering based on active tab */}
          {activeTab === "menu-editor" ? (
            // Menu Editor Content
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
                  {/* Categories Section */}
                  <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0 fw-bold">Categories ({categories.length})</h4>
                      <button
                        className="btn btn-primary px-3 py-2"
                        onClick={() => openModal("category", "add")}
                      >
                        <i className="bi bi-plus-lg me-2 fs-5"></i>
                        Add Category
                      </button>
                    </div>

                    {/* Accordion for Categories */}
                    <div className="accordion" id="categoriesAccordion">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="accordion-item border rounded mb-3"
                        >
                          <div
                            className={`accordion-header d-flex justify-content-between align-items-center p-3 ${
                              selectedCategory === category._id
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
                                <i className="bi bi-info-circle fs-5"></i>
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
                                <i className="bi bi-plus-lg fs-5"></i>
                              </button>
                              <button
                                className="btn btn-outline-secondary p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("category", "edit", category);
                                }}
                              >
                                <i className="bi bi-pencil fs-5"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category._id);
                                }}
                              >
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                              <i
                                className={`bi bi-chevron-${
                                  expandedCategories[category._id]
                                    ? "up"
                                    : "down"
                                } fs-5`}
                              ></i>
                            </div>
                          </div>
                          {expandedCategories[category._id] && (
                            <div className="accordion-body p-3 bg-light">
                              {category.subcategories.map((subcategory) => (
                                <div
                                  key={subcategory._id}
                                  className="mb-3"
                                >
                                  <div
                                    className={`d-flex justify-content-between align-items-center p-3 rounded ${
                                      selectedSubcategory?._id ===
                                      subcategory._id
                                        ? "bg-info bg-opacity-10"
                                        : "bg-white"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubcategory(subcategory._id);
                                    }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <span className="fs-5 fw-medium">{subcategory.name}</span>
                                      <span className="badge bg-secondary ms-3 fs-6">
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
                                        <i className="bi bi-info-circle fs-5"></i>
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
                                        <i className="bi bi-pencil fs-5"></i>
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
                                        <i className="bi bi-plus-lg fs-5"></i>
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
                                        <i className="bi bi-trash fs-5"></i>
                                      </button>
                                      <i
                                        className={`bi bi-chevron-${
                                          expandedSubcategories[subcategory._id]
                                            ? "up"
                                            : "down"
                                        } fs-5`}
                                      ></i>
                                    </div>
                                  </div>
                                  {expandedSubcategories[subcategory._id] && (
                                    <div className="ms-4 ps-3 border-start">
                                      {subcategory.items.map((item) => (
                                        <div
                                          key={item._id}
                                          className="d-flex justify-content-between align-items-center p-3 my-2 bg-white rounded"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingItem(item);
                                            setShowOffcanvas(true);
                                          }}
                                        >
                                          <div className="d-flex align-items-center">
                                            <i
                                              className={`bi bi-circle-fill me-3 ${
                                                item.isVeg
                                                  ? "text-success"
                                                  : "text-danger"
                                              } fs-6`}
                                            ></i>
                                            <span className="fs-5">{item.name}</span>
                                          </div>
                                          <div className="d-flex align-items-center gap-3">
                                            <button
                                              className="btn btn-outline-info p-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                showInfoTooltip(
                                                  e,
                                                  `click here to edit item details, click on trash bin to delete the item`
                                                );
                                              }}
                                              title="Info"
                                            >
                                              <i className="bi bi-info-circle fs-5"></i>
                                            </button>
                                            <button
                                              className="btn btn-outline-danger p-2"
                                              onClick={(e) =>
                                                handleDeleteItem(
                                                  category._id,
                                                  subcategory._id,
                                                  item._id,
                                                  e
                                                )
                                              }
                                              title="Delete Item"
                                            >
                                              <i className="bi bi-trash fs-5"></i>
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
            // Inventory Manager Content
            <InventoryManager
              categories={categories}
              onStockChange={handleStockChange}
            />
          ) : activeTab === "orders" ? (
            // Orders Content
            <Orders />
          ) : (
            // Other tabs content
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
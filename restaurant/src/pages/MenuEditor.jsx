import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import MenuItemModal from "./MenuItemModal";
import BulkAddModal from "./BulkAddModal";
import ImportExcelModal from "./ImportExcelModal";
import { MenuContext } from "../context/MenuContext";
import ConfirmModal from "../reusable/ConfirmModal";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { OfferContext } from "../context/OfferContext";
import Offers from "./Offers";
// Veg/NonVeg icons for menu items
const VegIcon = () => (
  <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
  </div>
);
const NonVegIcon = () => (
  <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
  </div>
);

function MenuEditor() {
  const {
    menuItems, // now an array of { category, subcategories: [{ subcategory, items: [...] }] }
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    bulkAddMenuItems,
    bulkDeleteMenuItems,
    renameCategory,
    renameSubcategory,
    deleteCategory,
  } = useContext(MenuContext);
  const { user } = useContext(AuthContext);

  // State for selected category and subcategory (by name)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    category: "",
    subcategory: "",
    item: null,
  });
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCategoryHelp, setShowCategoryHelp] = useState(false);

  // Bulk delete state
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedSubcategories, setSelectedSubcategories] = useState({});

  // Add state for category/subcategory edit modal
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editSubcategoryModalOpen, setEditSubcategoryModalOpen] =
    useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [subcategoryToEdit, setSubcategoryToEdit] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // State for expanded/collapsed subcategories
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // State for accordion form
  const [showAccordionForm, setShowAccordionForm] = useState(false);
  const [accordionSubcategory, setAccordionSubcategory] = useState("");
  const [newItemData, setNewItemData] = useState({
    name: "",
    price: "",
    description: "",
    foodType: "veg",
    inStock: true,
    quantity: "",
    expiryDate: "",
    unit: "piece",
    unitValue: 1, // Default unit value
  });

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedOfferItem, setSelectedOfferItem] = useState(null);

  // Handler for opening offer modal
  const handleOpenOfferModal = (item) => {
    setSelectedOfferItem(item);
    setOfferModalOpen(true);
  };

  // Set default selected category and subcategory on load
  useEffect(() => {
    if (menuItems.length > 0 && !selectedCategory) {
      setSelectedCategory(menuItems[0].category);
      if (menuItems[0].subcategories.length > 0) {
        setSelectedSubcategory(menuItems[0].subcategories[0].subcategory);
        // Expand the first subcategory by default
        setExpandedSubcategories({
          [menuItems[0].subcategories[0].subcategory]: true,
        });
      }
    }
  }, [menuItems, selectedCategory]);

  // When selectedCategory changes, reset selectedSubcategory
  useEffect(() => {
    const catObj = menuItems.find((cat) => cat.category === selectedCategory);
    if (catObj && catObj.subcategories.length > 0) {
      setSelectedSubcategory(catObj.subcategories[0].subcategory);
      // Expand the first subcategory when category changes
      setExpandedSubcategories({
        [catObj.subcategories[0].subcategory]: true,
      });
    } else {
      setSelectedSubcategory("");
    }
  }, [selectedCategory, menuItems]);

  // Handle modal submit for add/edit
  const handleModalSubmit = (formData) => {
    if (!formData.quantity || isNaN(formData.quantity)) {
      alert("Quantity is required and must be a number.");
      return;
    }
    if (modalData.item) {
      updateMenuItem(modalData.item._id, formData);
    } else {
      console.log("Adding new item:", formData);
      addMenuItem({ ...formData });
    }
    setModalOpen(false);
    setModalData({ category: "", subcategory: "", item: null });
  };

  // Handle opening modal for add/edit
  const handleOpenModal = (category = "", subcategory = "", item = null) => {
    setModalData({ category, subcategory, item });
    setModalOpen(true);
  };

  // Handle bulk add
  const handleBulkAdd = async (itemsData) => {
    try {
      await bulkAddMenuItems(itemsData);
    } catch (error) {
      console.error("Error in bulk add:", error);
    }
  };

  // Handle subcategory delete click (enter bulk delete mode)
  const handleSubcategoryDeleteClick = (subcat) => {
    setBulkDeleteMode(true);
    // Pre-select all items in this subcategory
    const allItemIds = subcat.items.map((item) => item._id);
    const selectedItemsObj = {};
    allItemIds.forEach((id) => {
      selectedItemsObj[id] = true;
    });
    setSelectedItems(selectedItemsObj);
    // Pre-select this subcategory
    setSelectedSubcategories({ [subcat.subcategory]: true });
  };

  // Handle item selection for bulk delete
  const handleItemSelection = (itemId, isSelected) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: isSelected,
    }));
  };

  // Handle subcategory selection for bulk delete
  const handleSubcategorySelection = (subcategoryName, isSelected) => {
    setSelectedSubcategories((prev) => ({
      ...prev,
      [subcategoryName]: isSelected,
    }));

    // If subcategory is selected, select all items in it
    const currentCategoryObj = menuItems.find(
      (cat) => cat.category === selectedCategory
    );
    if (currentCategoryObj) {
      const subcat = currentCategoryObj.subcategories.find(
        (sub) => sub.subcategory === subcategoryName
      );
      if (subcat) {
        const allItemIds = subcat.items.map((item) => item._id);
        const updatedSelection = { ...selectedItems };
        allItemIds.forEach((id) => {
          updatedSelection[id] = isSelected;
        });
        setSelectedItems(updatedSelection);
      }
    }
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    const selectedItemIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id]
    );

    if (selectedItemIds.length === 0) {
      return;
    }

    try {
      await bulkDeleteMenuItems(selectedItemIds);
      // Clear all selections and exit bulk delete mode
      setBulkDeleteMode(false);
      setSelectedItems({});
      setSelectedSubcategories({});
    } catch (error) {
      console.error("Error in bulk delete:", error);
    }
  };

  // Handle cancel bulk delete (clear all selections)
  const handleCancelBulkDelete = () => {
    setBulkDeleteMode(false);
    setSelectedItems({});
    setSelectedSubcategories({});
  };

  // Get current category and subcategories
  const currentCategoryObj = menuItems.find(
    (cat) => cat.category === selectedCategory
  );
  const subcategories = currentCategoryObj
    ? currentCategoryObj.subcategories
    : [];

  // Handler for opening category edit modal
  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setNewCategoryName(category);
    setEditCategoryModalOpen(true);
  };
  // Handler for opening subcategory edit modal
  const handleEditSubcategory = (subcategory) => {
    setSubcategoryToEdit(subcategory);
    setNewSubcategoryName(subcategory);
    setEditSubcategoryModalOpen(true);
  };
  // Handler for opening category delete confirm
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  // Handle accordion form toggle
  const toggleAccordionForm = (subcategory) => {
    if (showAccordionForm && accordionSubcategory === subcategory) {
      setShowAccordionForm(false);
      setAccordionSubcategory("");
    } else {
      setShowAccordionForm(true);
      setAccordionSubcategory(subcategory);
      setNewItemData({
        name: "",
        price: "",
        description: "",
        foodType: "veg",
        inStock: true,
        quantity: "",
        expiryDate: "",
        unit: "piece", // Add default unit
        unitValue: "1",
        loose: false, // Default to not loose
      });
    }
  };

  // Handle accordion form input change
  const handleAccordionInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItemData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle accordion form submit
  const handleAccordionSubmit = (e) => {
    e.preventDefault();
    if (!newItemData.quantity || isNaN(newItemData.quantity)) {
      alert("Quantity is required and must be a number.");
      return;
    }
    addMenuItem({
      ...newItemData,
      category: selectedCategory,
      subcategory: accordionSubcategory,
      price: parseFloat(newItemData.price),
      totalPrice: parseFloat(newItemData.price),
      quantity: parseInt(newItemData.quantity, 10),
      unit: newItemData.unit || "piece",
      unitValue: newItemData.unitValue || 1,
      loose: newItemData.loose || false, // Add loose field
      expiryDate: newItemData.expiryDate
        ? new Date(newItemData.expiryDate)
        : null,
    });
    setShowAccordionForm(false);
    setAccordionSubcategory("");
  };

  return (
    <div className="container-fluid px-0">
      {user && user?.role !== "admin" && (
        <div style={{ marginTop: "60px" }}>
          <Navbar />
          <Sidebar />
        </div>
      )}

      <div
        className={`${
          user?.role === "admin" ? "col-lg-12" : "col-lg-10"
        } ms-auto`}
        style={{ marginTop: user?.role === "admin" ? "0px" : "60px" }}
      >
        <div className="p-4">
          <style>{`
            @media (max-width: 640px) {
              .menu-mobile-flex {
                flex-direction: column !important;
                height: auto !important;
              }
              .menu-mobile-sidebar {
                width: 100% !important;
                border-right: none !important;
                border-bottom: 1px solid #e5e7eb !important;
                padding: 0 !important;
                height: auto !important;
                background: none !important;
              }
              .menu-mobile-main {
                width: 100% !important;
                padding: 1rem 0.5rem !important;
                height: auto !important;
              }
              .menu-mobile-action {
                width: 100% !important;
                flex-direction: column !important;
                gap: 0.5rem !important;
              }
              .menu-mobile-action button {
                width: 100% !important;
              }
              .menu-mobile-search {
                width: 100% !important;
              }
              .mobile-category-list {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 0.5rem !important;
                padding: 1rem 0.5rem !important;
                border-bottom: 1px solid #e5e7eb !important;
                background: #fff !important;
              }
              .mobile-category-btn {
                flex: 1 1 40%;
                background: #f3f4f6;
                border-radius: 9999px;
                padding: 0.5rem 1rem;
                border: none;
                font-size: 1rem;
                color: #374151;
                font-weight: 500;
                text-align: center;
                transition: background 0.2s, color 0.2s;
              }
              .mobile-category-btn.selected {
                background: #f59e42;
                color: #fff;
              }
            }
          `}</style>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 menu-mobile-action">
            {/* Search Input */}
            <div className="relative menu-mobile-search">
              <input
                type="text"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent menu-mobile-search"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={11} cy={11} r={8} />
                <line x1={21} y1={21} x2={16.65} y2={16.65} />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setSearchTerm("")}
                  tabIndex={-1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {/* Show Out of Stock Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="out-of-stock"
                checked={showOutOfStock}
                onChange={(e) => setShowOutOfStock(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="out-of-stock"
                className="ms-1 text-sm text-gray-600"
              >
                Show Out of stock
              </label>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 menu-mobile-action">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                onClick={() => setBulkModalOpen(true)}
              >
                Bulk Data
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                onClick={() => setImportExcelModalOpen(true)}
              >
                Import Excel
              </button>
              {/* Add New Item */}
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                onClick={() => handleOpenModal("", "", null)}
              >
                Add New Item
              </button>
            </div>
          </div>
          <div className="flex h-screen menu-mobile-flex">
            {/* Categories Sidebar */}
            <div className="w-64 bg-white p-6 border-r border-gray-200 flex-shrink-0 h-screen menu-mobile-sidebar">
              {/* Desktop/Tablet: Sidebar, Mobile: Horizontal lines */}
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 block sm:block hidden">
                  Categories
                  <div className="w-8 h-0.5 bg-gray-800 mt-1"></div>
                </h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCategoryHelp(!showCategoryHelp)}
                  aria-label="Category help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {showCategoryHelp && (
                  <div className="absolute z-10 mt-8 ml-[-8px] bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                    <p className="text-sm text-gray-700">
                      Here is the list of categories. To create a new category,
                      go to "Add New Item" and enter a new category name in the
                      category field when adding an item, if no category is
                      given item falls under uncategorized .
                    </p>
                    <button
                      type="button"
                      className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowCategoryHelp(false)}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3 block sm:block hidden">
                {menuItems.map((categoryObj) => (
                  <div
                    key={categoryObj.category}
                    className={`flex items-center justify-between text-gray-600 hover:text-gray-800 cursor-pointer py-2 text-sm transition-colors ${
                      selectedCategory === categoryObj.category
                        ? "font-bold text-orange-500"
                        : ""
                    }`}
                    onClick={() => setSelectedCategory(categoryObj.category)}
                  >
                    <span>{categoryObj.category}</span>
                    <div className="flex gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-800 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(categoryObj.category);
                        }}
                        title="Edit Category"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(categoryObj.category);
                        }}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile: Categories as group of lines */}
              <div className="mobile-category-list sm:hidden">
                {menuItems.map((categoryObj) => (
                  <div
                    key={categoryObj.category}
                    className="flex items-center gap-2 w-full"
                  >
                    <button
                      className={`mobile-category-btn${
                        selectedCategory === categoryObj.category
                          ? " selected"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(categoryObj.category)}
                    >
                      {categoryObj.category}
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(categoryObj.category);
                      }}
                      title="Edit Category"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(categoryObj.category);
                      }}
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Main Menu Area */}
            <div className="flex-1 p-6 pt-3 overflow-y-auto h-screen menu-mobile-main">
              {/* Show loading spinner only in main content area */}
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  {menuItems.length === 0 ? (
                    // Show this when menu is empty
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                      <div className="text-center">
                        <div className="text-gray-500 text-xl mb-4">
                          Your menu is empty
                        </div>
                        <div className="text-gray-400 text-sm mb-6">
                          Start by adding your first menu item
                        </div>
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 mx-auto"
                          onClick={() => handleOpenModal("", "", null)}
                        >
                          <Plus size={20} />
                          Add Your First Item
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Subcategory Tabs - Only show if menu is not empty */}
                      {!(
                        subcategories.length === 1 &&
                        subcategories[0].subcategory === "general"
                      ) && (
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold">
                            Subcategories
                          </span>
                          <button
                            className="flex items-center gap-2 bg-black/80 text-white px-4 py-1 rounded hover:bg-gray-800 transition-colors"
                            onClick={() =>
                              handleOpenModal(selectedCategory, "", null)
                            }
                          >
                            <Plus size={20} />
                            Add Subcategory
                          </button>
                        </div>
                      )}
                      <div className="flex flex-column gap-4">
                        {/* Bulk Delete Controls */}
                        {bulkDeleteMode && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-red-600 font-semibold">
                                  🗑️ Bulk Delete Mode
                                </span>
                                <span className="text-sm text-red-700">
                                  Selected:{" "}
                                  {
                                    Object.keys(selectedItems).filter(
                                      (id) => selectedItems[id]
                                    ).length
                                  }{" "}
                                  items
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelBulkDelete}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium transition-colors hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const selectedItemIds = Object.keys(
                                      selectedItems
                                    ).filter((id) => selectedItems[id]);
                                    if (selectedItemIds.length > 0) {
                                      setItemToDelete({
                                        type: "bulk",
                                        itemIds: selectedItemIds,
                                      });
                                      setDeleteConfirmOpen(true);
                                    }
                                  }}
                                  disabled={
                                    Object.keys(selectedItems).filter(
                                      (id) => selectedItems[id]
                                    ).length === 0
                                  }
                                  className="px-4 py-2 bg-red-500 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                                >
                                  Delete Selected
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                              Select items and subcategories you want to delete.
                              Use checkboxes to select individual items or
                              subcategories to select all items in that
                              subcategory.
                            </p>
                          </div>
                        )}

                        {/* Filter subcategories based on search and out-of-stock */}
                        {(searchTerm || showOutOfStock
                          ? subcategories.filter((subcat) =>
                              subcat.items.some(
                                (item) =>
                                  item.name
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) &&
                                  (!showOutOfStock || item.inStock === false)
                              )
                            )
                          : subcategories
                        ).map((subcat) => (
                          <div key={subcat.subcategory}>
                            <div
                              className={`flex items-center justify-between gap-4 px-3 py-3 rounded-md border ${
                                bulkDeleteMode
                                  ? selectedSubcategories[subcat.subcategory]
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 bg-white"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Subcategory checkbox - only show in bulk delete mode */}
                                {bulkDeleteMode && (
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedSubcategories[
                                        subcat.subcategory
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      handleSubcategorySelection(
                                        subcat.subcategory,
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                  />
                                )}
                                <span className="fs-3 text-gray-800 font-bold">
                                  {subcat.subcategory == "general"
                                    ? ""
                                    : subcat.subcategory}
                                </span>
                                {bulkDeleteMode && (
                                  <span className="text-sm text-gray-500">
                                    ({subcat.items.length} items)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() =>
                                    toggleSubcategory(subcat.subcategory)
                                  }
                                >
                                  {expandedSubcategories[subcat.subcategory] ? (
                                    <ChevronUp size={18} />
                                  ) : (
                                    <ChevronDown size={18} />
                                  )}
                                </button>

                                {subcat.subcategory != "general" && (
                                  <button
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSubcategory(subcat.subcategory);
                                    }}
                                    title="Edit Subcategory"
                                  >
                                    <Pencil size={18} />
                                  </button>
                                )}
                                <button
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAccordionForm(subcat.subcategory);
                                  }}
                                  title="Add Item"
                                >
                                  <Plus size={25} />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubcategoryDeleteClick(subcat);
                                  }}
                                  title="Delete Items"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            {/* Accordion Form - Only show for this subcategory */}
                            {showAccordionForm &&
                              accordionSubcategory === subcat.subcategory && (
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                  <form onSubmit={handleAccordionSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Item Name{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="text"
                                          name="name"
                                          value={newItemData.name}
                                          onChange={handleAccordionInputChange}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                                          required
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Price
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="number"
                                          name="price"
                                          value={newItemData.price}
                                          onChange={handleAccordionInputChange}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                                          required
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>

                                      <div>
                                        <label
                                          className="block text-sm font-medium text-gray-700 mb-1"
                                          htmlFor="quantity-input"
                                        >
                                          Quantity{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="number"
                                          name="quantity"
                                          value={newItemData.quantity}
                                          onChange={handleAccordionInputChange}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                                          required
                                          min="1"
                                          step="1"
                                        />
                                      </div>
                                      <div>
                                        <label
                                          className="block text-sm font-medium text-gray-700 mb-1"
                                          htmlFor="expiry-date-input"
                                        >
                                          Expiry Date{" "}
                                        </label>
                                        <input
                                          type="date"
                                          name="expiryDate"
                                          value={newItemData.expiryDate}
                                          onChange={handleAccordionInputChange}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                      </div>
                                      <div className="flex items-center gap-4"></div>
                                      <div className="flex items-center gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Food Type
                                          </label>
                                          <div className="flex gap-4">
                                            <label className="flex items-center">
                                              <input
                                                type="radio"
                                                name="foodType"
                                                value="veg"
                                                checked={
                                                  newItemData.foodType === "veg"
                                                }
                                                onChange={
                                                  handleAccordionInputChange
                                                }
                                                className="mr-2"
                                              />
                                              Veg
                                            </label>
                                            <label className="flex items-center">
                                              <input
                                                type="radio"
                                                name="foodType"
                                                value="non-veg"
                                                checked={
                                                  newItemData.foodType ===
                                                  "non-veg"
                                                }
                                                onChange={
                                                  handleAccordionInputChange
                                                }
                                                className="mr-2"
                                              />
                                              Non-Veg
                                            </label>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            In Stock
                                          </label>
                                          <input
                                            type="checkbox"
                                            name="inStock"
                                            checked={newItemData.inStock}
                                            onChange={
                                              handleAccordionInputChange
                                            }
                                            className="w-4 h-4"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowAccordionForm(false)
                                        }
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        Add Item
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              )}
                            {/* Menu List Container - Only show if expanded or in search mode */}
                            {(expandedSubcategories[subcat.subcategory] ||
                              searchTerm ||
                              showOutOfStock) && (
                              <div className="space-y-8">
                                <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-4 space-y-4">
                                  {/* Inside your item mapping */}
                                  {subcat.items
                                    .filter(
                                      (item) =>
                                        item.name
                                          .toLowerCase()
                                          .includes(searchTerm.toLowerCase()) &&
                                        (!showOutOfStock ||
                                          item.inStock === false)
                                    )
                                    .map((item, index) => (
                                      <React.Fragment key={item._id || index}>
                                        <div
                                          className={`flex items-center justify-between rounded-md p-3 ${
                                            bulkDeleteMode &&
                                            selectedItems[item._id]
                                              ? "bg-red-50 border border-red-200"
                                              : "bg-white"
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Item checkbox - only show in bulk delete mode */}
                                            {bulkDeleteMode && (
                                              <input
                                                type="checkbox"
                                                checked={
                                                  selectedItems[item._id] ||
                                                  false
                                                }
                                                onChange={(e) =>
                                                  handleItemSelection(
                                                    item._id,
                                                    e.target.checked
                                                  )
                                                }
                                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                              />
                                            )}
                                            {/* Veg/Non-Veg Icon */}
                                            <span
                                              title={
                                                item.foodType === "veg"
                                                  ? "Veg"
                                                  : "Non-Veg"
                                              }
                                              className="inline-block align-middle"
                                            >
                                              {item.foodType === "veg" ? (
                                                <VegIcon />
                                              ) : (
                                                <NonVegIcon />
                                              )}
                                            </span>
                                            <div>
                                              <div className="font-medium text-gray-800">
                                                {item.name}
                                                {item.offers &&
                                                  item.offers.length > 0 && (
                                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                      {item.offers.length} offer
                                                      {item.offers.length > 1
                                                        ? "s"
                                                        : ""}
                                                    </span>
                                                  )}
                                              </div>
                                              <div className="flex gap-4 text-sm text-gray-600">
                                                <span>
                                                  ₹
                                                  {item.price ||
                                                    item.totalPrice}
                                                </span>
                                                <span>
                                                  Qty: {item.quantity}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-4">
                                            {/* InStock Toggle */}
                                            <label className="flex items-center cursor-pointer">
                                              <div className="relative">
                                                <input
                                                  type="checkbox"
                                                  checked={item.inStock}
                                                  onChange={() =>
                                                    updateMenuItem(item._id, {
                                                      ...item,
                                                      inStock: !item.inStock,
                                                    })
                                                  }
                                                  className="sr-only"
                                                />
                                                <div
                                                  className={`block w-10 h-6 rounded-full ${
                                                    item.inStock
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                  }`}
                                                ></div>
                                                <div
                                                  className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                                                    item.inStock
                                                      ? "translate-x-4"
                                                      : ""
                                                  }`}
                                                ></div>
                                              </div>
                                            </label>

                                            {/* Action Buttons */}
                                            {!bulkDeleteMode && (
                                              <>
                                                {/* Desktop buttons */}
                                                <span className="hidden sm:flex gap-2">
                                                  <button
                                                    className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                    onClick={() => {
                                                      setSelectedOfferItem(
                                                        item
                                                      ); // full item
                                                      setOfferModalOpen(true);
                                                    }}
                                                  >
                                                    Add Offer
                                                  </button>

                                                  <button
                                                    className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                    onClick={() =>
                                                      handleOpenModal(
                                                        selectedCategory,
                                                        selectedSubcategory,
                                                        item
                                                      )
                                                    }
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    className="text-red-600 hover:text-red-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                    onClick={() => {
                                                      setItemToDelete(item);
                                                      setDeleteConfirmOpen(
                                                        true
                                                      );
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                </span>

                                                {/* Mobile buttons */}
                                                <span className="sm:hidden flex gap-2">
                                                  <button
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-full"
                                                    onClick={() =>
                                                      handleOpenOfferModal(item)
                                                    }
                                                    title="Add Offer"
                                                  >
                                                    <Plus size={18} />
                                                  </button>

                                                  <button
                                                    className="text-gray-600 hover:text-gray-800 p-2 rounded-full"
                                                    onClick={() =>
                                                      handleOpenModal(
                                                        selectedCategory,
                                                        selectedSubcategory,
                                                        item
                                                      )
                                                    }
                                                    title="Edit"
                                                  >
                                                    <Pencil size={18} />
                                                  </button>
                                                  <button
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-full"
                                                    onClick={() => {
                                                      setItemToDelete(item);
                                                      setDeleteConfirmOpen(
                                                        true
                                                      );
                                                    }}
                                                    title="Delete"
                                                  >
                                                    <Trash2 size={18} />
                                                  </button>
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </React.Fragment>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Add/Edit Menu Item Modal - Now centered */}
          <MenuItemModal
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setModalData({ category: "", subcategory: "", item: null });
            }}
            onSubmit={handleModalSubmit}
            preSelectedCategory={modalData.category}
            preSelectedSubcategory={modalData.subcategory}
            item={modalData.item}
          />

          {/* Bulk Add Modal */}
          <BulkAddModal
            open={bulkModalOpen}
            onClose={() => setBulkModalOpen(false)}
            onBulkAdd={handleBulkAdd}
            preSelectedCategory={selectedCategory}
            preSelectedSubcategory={selectedSubcategory}
          />

          {/* Import Excel Modal */}
          <ImportExcelModal
            open={importExcelModalOpen}
            onClose={() => setImportExcelModalOpen(false)}
            onImport={handleBulkAdd}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={deleteConfirmOpen}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }}
            onConfirm={() => {
              if (itemToDelete) {
                if (itemToDelete.type === "bulk") {
                  // Bulk delete
                  handleBulkDeleteConfirm();
                } else {
                  // Single item delete
                  deleteMenuItem(itemToDelete._id);
                }
              }
            }}
            title="Confirm Delete"
            message={
              itemToDelete?.type === "bulk"
                ? `Are you sure you want to delete ${itemToDelete.itemIds.length} selected items?`
                : "Are you sure you want to delete this item?"
            }
          />

          {/* Edit Category Modal */}
          {editCategoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
              <div className="bg-white rounded-lg p-6 w-full max-w-xs">
                <h2 className="text-lg font-semibold mb-4">Rename Category</h2>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                  placeholder="Enter new category name"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setEditCategoryModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={async () => {
                      await renameCategory(categoryToEdit, newCategoryName);
                      setEditCategoryModalOpen(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Subcategory Modal */}
          {editSubcategoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
              <div className="bg-white rounded-lg p-6 w-full max-w-xs">
                <h2 className="text-lg font-semibold mb-4">
                  Rename Subcategory
                </h2>
                <input
                  type="text"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                  placeholder="Enter new subcategory name"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setEditSubcategoryModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={async () => {
                      await renameSubcategory(
                        selectedCategory,
                        subcategoryToEdit,
                        newSubcategoryName
                      );
                      setEditSubcategoryModalOpen(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Category Modal */}
          <ConfirmModal
            isOpen={!!categoryToDelete}
            onClose={() => {
              setCategoryToDelete(null);
              setDeleteConfirmOpen(false);
            }}
            onConfirm={async () => {
              await deleteCategory(categoryToDelete);
              setCategoryToDelete(null);
              setDeleteConfirmOpen(false);
            }}
            title="Confirm Delete"
            message={`Are you sure you want to delete all items in the category '${categoryToDelete}'? This action cannot be undone.`}
          />
          {/* Offer Modal */}
          {offerModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
    <div className="bg-white rounded-lg p-6 w-full max-w-xl">
      <Offers
        visible={offerModalOpen}
        item={selectedOfferItem}
        // omit offerId to force CREATE
        onHide={() => {
          setOfferModalOpen(false);
          setSelectedOfferItem(null);
        }}
      />
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}

export default MenuEditor;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MenuContext } from '../context/MenuContext';
import Sidebar from '../components/Sidebar';
import ItemOffcanvas from '../components/ItemOffcanvas';
import InventoryManager from '../components/InventoryManager';
import Orders from '../components/Orders';
import '../styles/Dashboard.css';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { API_URL } from '../api/api';
import { useEffect } from 'react';
import axios from 'axios';
ChartJS.register(ArcElement, Tooltip, Legend);

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
        toggleCategoryExpansion
    } = useContext(MenuContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'category', 'subcategory', 'item'
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [modalData, setModalData] = useState({
        name: '',
        price: '',
        isVeg: true,
        customisable: false,
        parentId: null,
        itemId: null
    });

    // Add new state for offcanvas
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isAddingNewItem, setIsAddingNewItem] = useState(false);

    const [activeTab, setActiveTab] = useState('menu-editor');

    const navigate = useNavigate();

    const tabs = [
        { id: 'menu-editor', label: "Menu editor", path: "/menu", icon: "bi-menu-button-wide" },
        // { id: 'total-items-summary', label: "Total Items Summary", path: "/summary", icon: "bi-pie-chart" },
        // { label: "Instore Order", path: "/instore", icon: "bi-shop" },
        // { label: "Manage inventory", path: "/inventory", icon: "bi-box-seam" },
        // { label: "Taxes", path: "/taxes", icon: "bi-calculator" },
        // { label: "Charges", path: "/charges", icon: "bi-credit-card" }
    ];

    const handleStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    const openModal = (type, mode, data = null, parentId = null) => {
        if (mode === 'edit' && !data) {
            toast.error('No data provided for editing');
            return;
        }
        setModalType(type);
        setModalMode(mode);
        setModalData({
            name: data?.name || '',
            totalPrice: data?.totalPrice || '',
            isVeg: data?.isVeg ?? true,
            customisable: data?.customisable ?? false,
            parentId: parentId,
            itemId: data?._id || null
        });
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        if (modalType === 'category') {
            if (modalMode === 'add') {
                addCategory(modalData.name);
            } else {
                if (!modalData.itemId) {
                    toast.error('Category ID is required for editing');
                    return;
                }
                updateCategory(modalData.itemId, modalData.name);
            }
        } else if (modalType === 'subcategory') {
            if (modalMode === 'add') {
                if (!modalData.parentId) {
                    toast.error('Category ID is required for adding subcategory');
                    return;
                }
                addSubcategory(modalData.parentId, modalData.name);
            } else {
                if (!modalData.parentId || !modalData.itemId) {
                    toast.error('Category ID and Subcategory ID are required for editing');
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
            toast.error('Please select a category and subcategory first');
            return;
        }

        if (editingItem) {
            updateItem(selectedCategory, selectedSubcategory._id, editingItem._id, itemData);
        } else {
            addItem(selectedCategory, selectedSubcategory._id, itemData);
        }
        setShowOffcanvas(false);
        setEditingItem(null);
        setIsAddingNewItem(false);
    };

    // Update the category selection logic
    const handleCategorySelect = (category) => {
        setSelectedCategory(category._id);
        // Set the first subcategory as selected when category is clicked
        if (category.subcategories.length > 0) {
            setSelectedSubcategory(category.subcategories[0]);
        } else {
            setSelectedSubcategory(null);
        }
    };

    // Update the subcategory selection logic
    const handleSubcategorySelect = (subcategory, categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory(subcategory);
    };

    if (!user) {
        return <div>Please login to access the dashboard</div>;
    }


    return (
        <div className="container-fluid px-0">
            {/* Replace Modal with ItemOffcanvas */}
            <ItemOffcanvas
                show={showOffcanvas}
                onHide={() => {
                    setShowOffcanvas(false);
                    setEditingItem(null);
                    setIsAddingNewItem(false);
                }}
                onSave={handleOffcanvasSave}
                initialData={isAddingNewItem ? {} : (editingItem || {})}
                subcategoryName={selectedSubcategory?.name || ''}
                subcategoryItems={selectedSubcategory?.items || []}
            />

            {/* Add Modal for Categories and Subcategories */}
            <div className={`modal fade ${showModal ? 'show' : ''}`}
                tabIndex="-1"
                style={{ display: showModal ? 'block' : 'none' }}
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === 'add'
                                    ? `Add ${modalType === 'category' ? 'Category' : 'Subcategory'}`
                                    : `Edit ${modalType === 'category' ? 'Category' : 'Subcategory'}`}
                            </h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">
                                    {modalType === 'category' ? 'Category' : 'Subcategory'} Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={modalData.name}
                                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                    placeholder={`Enter ${modalType === 'category' ? 'category' : 'subcategory'} name`}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleModalSubmit}>
                                {modalMode === 'add' ? 'Add' : 'Save Changes'}
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
                <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>

                    {/* Top Navigation */}
                    <div className="d-flex justify-content-between align-items-center p-4 bg-white shadow-sm">
                        <div className="d-flex gap-4">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`btn btn-link text-decoration-none d-flex align-items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    <i className={`bi ${tab.icon} fs-5`}></i>
                                    <span className="fw-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Rendering based on active tab */}
                    {activeTab === 'menu-editor' ? (
                        // Menu Editor Content
                        <div className="container-fluid px-4 my-4">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading menu...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-500">{error}</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {/* Categories Section */}
                                    <div className="col-md-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Categories ({categories.length})</h5>
                                            <button className="btn btn-link text-dark">
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                        </div>
                                        <button
                                            className="btn btn-link text-primary text-decoration-none p-0 mb-3"
                                            onClick={() => openModal('category', 'add')}
                                        >
                                            <i className="bi bi-plus-lg me-2"></i>
                                            Add Category
                                        </button>

                                        {/* Category List */}
                                        <div className="list-group">
                                            {categories.map((category) => {
                                                return (
                                                    <div key={category._id} className="list-group-item">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span
                                                                className={`cursor-pointer ${selectedCategory === category._id ? 'text-primary' : ''}`}
                                                                onClick={() => handleCategorySelect(category)}
                                                            >
                                                                {category.name} ({category.subcategories.reduce((acc, sub) => acc + sub.items.length, 0)})
                                                            </span>
                                                            <div>
                                                                <div className="dropdown d-inline-block me-2">
                                                                    <button className="btn btn-link text-dark p-0" data-bs-toggle="dropdown">
                                                                        <i className="bi bi-three-dots-vertical"></i>
                                                                    </button>
                                                                    <ul className="dropdown-menu">
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item"
                                                                                onClick={() => openModal('category', 'edit', category)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item text-danger"
                                                                                onClick={() => deleteCategory(category._id)}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                                <button
                                                                    className="btn btn-link text-dark p-0"
                                                                    onClick={() => toggleCategoryExpansion(category._id)}
                                                                >
                                                                    <i className={`bi bi-chevron-${category.isExpanded ? 'up' : 'down'}`}></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {category.isExpanded && (
                                                            <>
                                                                {category.subcategories.map(subcategory => (
                                                                    <div key={subcategory._id} className="ms-3 mt-2">
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <span
                                                                                className={`cursor-pointer ${selectedSubcategory?._id === subcategory._id ? 'text-primary' : ''}`}
                                                                                onClick={() => handleSubcategorySelect(subcategory, category._id)}
                                                                            >
                                                                                {subcategory.name} ({subcategory.items.length})
                                                                            </span>
                                                                            <div className="dropdown">
                                                                                <button className="btn btn-link text-dark p-0" data-bs-toggle="dropdown">
                                                                                    <i className="bi bi-three-dots-vertical"></i>
                                                                                </button>
                                                                                <ul className="dropdown-menu">
                                                                                    <li>
                                                                                        <button
                                                                                            className="dropdown-item"
                                                                                            onClick={() => openModal('subcategory', 'edit', subcategory, category._id)}
                                                                                        >
                                                                                            Edit
                                                                                        </button>
                                                                                    </li>
                                                                                    <li>
                                                                                        <button
                                                                                            className="dropdown-item text-danger"
                                                                                            onClick={() => deleteSubcategory(category._id, subcategory._id)}
                                                                                        >
                                                                                            Delete
                                                                                        </button>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="mt-2">
                                                                    <button
                                                                        className="btn btn-link text-primary text-decoration-none p-0"
                                                                        onClick={() => openModal('subcategory', 'add', null, category._id)}
                                                                    >
                                                                        <i className="bi bi-plus-lg me-2"></i>
                                                                        Add Subcategory
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Products Section */}
                                    <div className="col-md-8">
                                        {selectedSubcategory ? (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="mb-0">{selectedSubcategory.name} ({selectedSubcategory.items.length})</h5>
                                                    <button
                                                        className="btn btn-link text-primary text-decoration-none"
                                                        onClick={() => {
                                                            setEditingItem(null);
                                                            setIsAddingNewItem(true);
                                                            setShowOffcanvas(true);
                                                        }}
                                                    >
                                                        <i className="bi bi-plus-lg me-2"></i>
                                                        Add New Item
                                                    </button>
                                                </div>

                                                <div className="list-group">
                                                    {selectedSubcategory.items.length > 0 ? (
                                                        selectedSubcategory.items.map((item) => (
                                                            <div key={item._id} className="list-group-item">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div>
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '8px' }}></i>
                                                                            <h6 className="mb-0">{item.name}</h6>
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            ₹{item.totalPrice}
                                                                            {item.customisable && ` | customisable`}
                                                                        </small>

                                                                    </div>
                                                                    <div className="dropdown">
                                                                        <button className="btn btn-link text-dark p-0" data-bs-toggle="dropdown">
                                                                            <i className="bi bi-three-dots-vertical"></i>
                                                                        </button>
                                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => {
                                                                                        setEditingItem(item);
                                                                                        setShowOffcanvas(true);
                                                                                    }}
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item text-danger"
                                                                                    onClick={() => deleteItem(selectedCategory, selectedSubcategory._id, item._id)}
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <p className="text-muted">No items in this subcategory yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-5">
                                                <p className="text-muted">Select a subcategory to view or add items</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'instore-order' ? (
                        // Instore Order Content
                        <InstoreOrder />
                    ) : activeTab === 'manage-inventory' ? (
                        // Inventory Manager Content
                        <InventoryManager
                            categories={categories}
                            onStockChange={handleStockChange}
                        />
                    ) : activeTab === 'orders' ? (
                        // Orders Content
                        <Orders />
                    ) : (
                        // Other tabs content
                        <div className="container-fluid px-4">
                            <div className="text-center p-5">
                                <h4>Coming Soon</h4>
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
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ItemOffcanvas from '../components/ItemOffcanvas';
import InventoryManager from '../components/InventoryManager';
import Orders from '../components/Orders';
import '../styles/Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

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

    const menuItems = [
        { icon: "bi-box", label: "Orders", path: "/orders", isNew: false },
        { icon: "bi-list", label: "Menu", path: "/menu", isNew: true },
        { icon: "bi-clock-history", label: "Order history", path: "/order-history" },
        { icon: "bi-graph-up", label: "Reporting", path: "/reporting" },
        { icon: "bi-gift", label: "Offers", path: "/offers" },
        { icon: "bi-wallet2", label: "Payout", path: "/payout" },
        { icon: "bi-cart4", label: "Hyperpure", path: "/hyperpure" },
        { icon: "bi-megaphone", label: "Ads", path: "/ads" },
        { icon: "bi-shop", label: "Outlet info", path: "/outlet-info" },
        { icon: "bi-exclamation-circle", label: "Customer complaints", path: "/complaints" },
        { icon: "bi-star", label: "Reviews", path: "/reviews" },
        { icon: "bi-question-circle", label: "Help centre", path: "/help" }
    ];

    const tabs = [
        { label: "Menu editor", path: "/menu" },
        { label: "Manage inventory", path: "/inventory" },
        { label: "Taxes", path: "/taxes" },
        { label: "Charges", path: "/charges" }
    ];

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    // Fetch menu items
    const fetchMenu = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/menu', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching menu items');
            setLoading(false);
        }
    };

    // Fetch restaurants
    const fetchRestaurants = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/restaurants', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRestaurants(response.data);
            console.log("Restaurants fetched:", response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Error fetching restaurants');
        }
    };

    useEffect(() => {
        if (token) {
            fetchRestaurants();
            fetchMenu();
        }
    }, [token]);

    // Add new menu item
    const handleAddItem = async (newItem) => {
        try {
            const response = await axios.post('http://localhost:5000/api/menu', newItem, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCategories([...categories, response.data]);
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error adding menu item');
        }
    };

    // Update menu item
    const handleUpdateItem = async (id, updatedItem) => {
        try {
            await axios.put(`http://localhost:5000/api/menu/${id}`, updatedItem, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error updating menu item');
        }
    };

    // Delete menu item
    const handleDeleteItem = async (categoryId, subcategoryId, itemId) => {
        if (!categoryId || !subcategoryId || !itemId) {
            setError('Category ID, Subcategory ID, and Item ID are required');
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/api/menu/${categoryId}/subcategories/${subcategoryId}/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error deleting item');
            console.error('Error deleting item:', error);
        }
    };

    const handleStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    const openModal = (type, mode, data = null, parentId = null) => {
        if (mode === 'edit' && !data) {
            setError('No data provided for editing');
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
                handleAddCategory(modalData.name);
            } else {
                if (!modalData.itemId) {
                    setError('Category ID is required for editing');
                    return;
                }
                handleEditCategory(modalData.itemId, modalData.name);
            }
        } else if (modalType === 'subcategory') {
            if (modalMode === 'add') {
                if (!modalData.parentId) {
                    setError('Category ID is required for adding subcategory');
                    return;
                }
                handleAddSubcategory(modalData.parentId, modalData.name);
            } else {
                if (!modalData.parentId || !modalData.itemId) {
                    setError('Category ID and Subcategory ID are required for editing');
                    return;
                }
                handleEditSubcategory(modalData.parentId, modalData.itemId, modalData.name);
            }
        }
        setShowModal(false);
    };

    // Add new category
    const handleAddCategory = async (name) => {
        try {
            const newCategory = {
                name: name,
                isExpanded: true,
                subcategories: []
            };
            await axios.post('http://localhost:5000/api/menu', newCategory, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error adding category');
        }
    };

    // Update category
    const handleEditCategory = async (categoryId, newName) => {
        if (!categoryId) {
            setError('Category ID is required');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:5000/api/menu/${categoryId}`, { name: newName }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error updating category');
            console.error('Error updating category:', error);
        }
    };

    // Delete category
    const handleDeleteCategory = async (categoryId) => {
        try {
            await axios.delete(`http://localhost:5000/api/menu/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error deleting category');
        }
    };

    // Add new subcategory
    const handleAddSubcategory = async (categoryId, name) => {
        if (!categoryId) {
            setError('Category ID is required');
            return;
        }
        try {
            const newSubcategory = {
                name: name,
                items: []
            };
            await axios.post(`http://localhost:5000/api/menu/${categoryId}/subcategories`, newSubcategory, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error adding subcategory');
            console.error('Error adding subcategory:', error);
        }
    };

    // Update subcategory
    const handleEditSubcategory = async (categoryId, subcategoryId, newName) => {
        if (!categoryId || !subcategoryId) {
            setError('Category ID and Subcategory ID are required');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:5000/api/menu/${categoryId}/subcategories/${subcategoryId}`, { name: newName }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error updating subcategory');
            console.error('Error updating subcategory:', error);
        }
    };

    // Delete subcategory
    const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
        if (!categoryId || !subcategoryId) {
            setError('Category ID and Subcategory ID are required');
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/api/menu/${categoryId}/subcategories/${subcategoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            setError('Error deleting subcategory');
            console.error('Error deleting subcategory:', error);
        }
    };

    const handleStockChange = (itemId, newStockStatus) => {
        setCategories(prevCategories =>
            prevCategories.map(category => ({
                ...category,
                subcategories: category.subcategories.map(subcategory => ({
                    ...subcategory,
                    items: subcategory.items.map(item =>
                        item.id === itemId
                            ? { ...item, inStock: newStockStatus }
                            : item
                    )
                }))
            }))
        );
    };

    const handleEditItem = (categoryId, subcategoryId, itemId, itemData) => {
        // Create a new item with updated data
        const updatedItem = itemData;

        // Update the categories state with the edited item
        const updatedCategories = categories.map(category => {
            if (category._id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory => {
                        if (subcategory._id === subcategoryId) {
                            return {
                                ...subcategory,
                                items: subcategory.items.map(item =>
                                    item._id === itemId ? updatedItem : item
                                )
                            };
                        }
                        return subcategory;
                    })
                };
            }
            return category;
        });

        // Update the state with the new categories
        setCategories(updatedCategories);

        // Force a re-render by updating the selectedSubcategory
        const updatedSubcategory = updatedCategories
            .find(cat => cat._id === categoryId)
            ?.subcategories.find(sub => sub._id === subcategoryId);

        if (updatedSubcategory) {
            setSelectedSubcategory({ ...updatedSubcategory });
        }
    };

    const toggleCategoryExpansion = (categoryId) => {
        setCategories(categories.map(category => {
            if (category._id === categoryId) {
                return { ...category, isExpanded: !category.isExpanded };
            }
            return category;
        }));
    };

    console.log(categories, "categories in dashboard");

    // Add new item to subcategory
    const handleAddItemToSubcategory = async (categoryId, subcategoryId, itemData) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/menu/${categoryId}/subcategories/${subcategoryId}/items`,
                itemData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            fetchMenu(); // Refresh the menu data
        } catch (error) {
            console.error('Error adding item:', error);
            setError('Error adding item');
        }
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

    console.log(selectedCategory, "selectedCategory in handleOffcanvasSave");
    console.log(selectedSubcategory, "selectedSubcategory in handleOffcanvasSave");

    const handleOffcanvasSave = (itemData) => {
        if (!selectedCategory || !selectedSubcategory) {
            setError('Please select a category and subcategory first');
            return;
        }

        if (editingItem) {
            handleEditItem(selectedCategory, selectedSubcategory._id, editingItem._id, itemData);
        } else {
            handleAddItemToSubcategory(selectedCategory, selectedSubcategory._id, itemData);
        }
        setShowOffcanvas(false);
        setEditingItem(null);
        setIsAddingNewItem(false);
    };

    // Update the item deletion button click handler
    const handleItemDeleteClick = (categoryId, subcategoryId, itemId) => {
        if (!categoryId || !subcategoryId || !itemId) {
            setError('Missing required IDs for item deletion');
            return;
        }
        handleDeleteItem(categoryId, subcategoryId, itemId);
    };

    if (!token) {
        return <div>Please login to access the dashboard</div>;
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container-fluid">

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

            <div className="row" style={{ marginTop: "48px" }}>
                {/* Sidebar */}
                <Sidebar
                    menuItems={menuItems}
                    logo="B2B"
                    subtitle="restaurant partner"
                />

                {/* Main Content */}
                <div className="col-md-10 ms-auto">
                    {/* Top Navigation */}
                    <div className="bg-white shadow-sm p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-4">
                                {tabs.map((tab, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(tab.label.toLowerCase().replace(' ', '-'))}
                                        className={`btn btn-link text-decoration-none ${activeTab === tab.label.toLowerCase().replace(' ', '-')
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-dark'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Conditional Rendering based on active tab */}
                    {activeTab === 'menu-editor' ? (
                        // Menu Editor Content
                        <div className="container-fluid px-4">
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
                                            console.log(category, "category in categories");
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
                                                                            onClick={() => handleDeleteCategory(category._id)}
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
                                                                                        onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
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
                                                        <div key={item.id} className="list-group-item">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '8px' }}></i>
                                                                        <h6 className="mb-0">{item.name}</h6>
                                                                    </div>
                                                                    <small className="text-muted">
                                                                        ₹{item.totalPrice} | {item.customisable ? 'customisable' : ''}
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
                                                                                onClick={() => handleItemDeleteClick(selectedCategory, selectedSubcategory._id, item._id)}
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
                        </div>
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
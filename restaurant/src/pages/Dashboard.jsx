import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ItemOffcanvas from '../components/ItemOffcanvas';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user, restaurant } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('desserts');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [categories, setCategories] = useState([
        {
            id: 'desserts',
            name: 'Desserts',
            isExpanded: true,
            subcategories: [
                {
                    id: 'ice-cream',
                    name: 'Ice Cream',
                    items: [
                        { id: 1, name: 'Vanilla Ice Cream', price: '₹99', customisable: true, isVeg: true },
                        { id: 2, name: 'Chocolate Ice Cream', price: '₹119', customisable: true, isVeg: true },
                        { id: 3, name: 'Strawberry Ice Cream', price: '₹109', customisable: true, isVeg: true }
                    ]
                }
            ]
        }
    ]);

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

    const handleStatusChange = (status) => {
        setIsOnline(status === 'online');
    };

    const openModal = (type, mode, data = null, parentId = null) => {
        setModalType(type);
        setModalMode(mode);
        setModalData({
            name: data?.name || '',
            price: data?.price || '',
            isVeg: data?.isVeg ?? true,
            customisable: data?.customisable ?? false,
            parentId: parentId,
            itemId: data?.id || null
        });
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        if (modalType === 'category') {
            if (modalMode === 'add') {
                handleAddCategory(modalData.name);
            } else {
                handleEditCategory(modalData.itemId, modalData.name);
            }
        } else if (modalType === 'subcategory') {
            if (modalMode === 'add') {
                handleAddSubcategory(modalData.parentId, modalData.name);
            } else {
                handleEditSubcategory(modalData.parentId, modalData.itemId, modalData.name);
            }
        } else if (modalType === 'item') {
            if (modalMode === 'add') {
                handleAddItem(modalData.parentId, selectedSubcategory.id, modalData);
            } else {
                handleEditItem(modalData.parentId, selectedSubcategory.id, modalData.itemId, modalData);
            }
        }
        setShowModal(false);
    };

    const handleAddCategory = (name) => {
        const newCategory = {
            id: `category-${Date.now()}`,
            name: name,
            isExpanded: true,
            subcategories: []
        };
        setCategories([...categories, newCategory]);
        
        // Select the newly created category
        setSelectedCategory(newCategory.id);
        setSelectedSubcategory(null);
    };

    const handleEditCategory = (categoryId, newName) => {
        setCategories(categories.map(category => 
            category.id === categoryId 
                ? { ...category, name: newName }
                : category
        ));
    };

    const handleDeleteCategory = (categoryId) => {
        setCategories(categories.filter(category => category.id !== categoryId));
        
        // If the deleted category was selected, select another category or clear selection
        if (selectedCategory === categoryId) {
            const remainingCategories = categories.filter(category => category.id !== categoryId);
            if (remainingCategories.length > 0) {
                setSelectedCategory(remainingCategories[0].id);
                if (remainingCategories[0].subcategories.length > 0) {
                    setSelectedSubcategory(remainingCategories[0].subcategories[0]);
                } else {
                    setSelectedSubcategory(null);
                }
            } else {
                setSelectedCategory('');
                setSelectedSubcategory(null);
            }
        }
    };

    const handleAddSubcategory = (categoryId, name) => {
        const newSubcategory = {
            id: `subcategory-${Date.now()}`,
            name: name,
            items: []
        };
        
        const updatedCategories = categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: [
                        ...category.subcategories,
                        newSubcategory
                    ]
                };
            }
            return category;
        });
        
        setCategories(updatedCategories);
        
        // Set the newly created subcategory as selected
        setSelectedSubcategory(newSubcategory);
    };

    const handleEditSubcategory = (categoryId, subcategoryId, newName) => {
        setCategories(categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(sub =>
                        sub.id === subcategoryId
                            ? { ...sub, name: newName }
                            : sub
                    )
                };
            }
            return category;
        }));
    };

    const handleDeleteSubcategory = (categoryId, subcategoryId) => {
        setCategories(categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
                };
            }
            return category;
        }));
    };

    const handleAddItem = (categoryId, subcategoryId, itemData) => {
        // Create a new item with a unique ID
        const newItem = {
            id: Date.now(),
            name: itemData.name,
            description: itemData.description,
            price: `₹${itemData.totalPrice || itemData.basePrice}`,
            customisable: true,
            isVeg: itemData.foodType === 'Veg'
        };

        // Update the categories state with the new item
        const updatedCategories = categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory => {
                        if (subcategory.id === subcategoryId) {
                            return {
                                ...subcategory,
                                items: [...subcategory.items, newItem]
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
            .find(cat => cat.id === categoryId)
            ?.subcategories.find(sub => sub.id === subcategoryId);
            
        if (updatedSubcategory) {
            setSelectedSubcategory({...updatedSubcategory});
        }
    };

    const handleEditItem = (categoryId, subcategoryId, itemId, itemData) => {
        // Create a new item with updated data
        const updatedItem = {
            id: itemId,
            name: itemData.name,
            description: itemData.description,
            price: `₹${itemData.totalPrice || itemData.basePrice}`,
            customisable: true,
            isVeg: itemData.foodType === 'Veg',
            foodType: itemData.foodType,
            serviceType: itemData.serviceType,
            basePrice: itemData.basePrice,
            packagingCharges: itemData.packagingCharges,
            totalPrice: itemData.totalPrice,
            photos: itemData.photos || []
        };

        // Update the categories state with the edited item
        const updatedCategories = categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory => {
                        if (subcategory.id === subcategoryId) {
                            return {
                                ...subcategory,
                                items: subcategory.items.map(item =>
                                    item.id === itemId ? updatedItem : item
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
            .find(cat => cat.id === categoryId)
            ?.subcategories.find(sub => sub.id === subcategoryId);
            
        if (updatedSubcategory) {
            setSelectedSubcategory({...updatedSubcategory});
        }
    };

    const handleDeleteItem = (categoryId, subcategoryId, itemId) => {
        setCategories(categories.map(category => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory => {
                        if (subcategory.id === subcategoryId) {
                            return {
                                ...subcategory,
                                items: subcategory.items.filter(item => item.id !== itemId)
                            };
                        }
                        return subcategory;
                    })
                };
            }
            return category;
        }));
    };

    const toggleCategoryExpansion = (categoryId) => {
        setCategories(categories.map(category => {
            if (category.id === categoryId) {
                return { ...category, isExpanded: !category.isExpanded };
            }
            return category;
        }));
    };

    const handleOffcanvasSave = (itemData) => {
        if (editingItem) {
            handleEditItem(selectedCategory, selectedSubcategory.id, editingItem.id, itemData);
        } else {
            handleAddItem(selectedCategory, selectedSubcategory.id, itemData);
        }
        setShowOffcanvas(false);
        setEditingItem(null);
        setIsAddingNewItem(false);
    };

    return (
        <div className="container-fluid">
            {/* Top Header */}
            <div className="row position-fixed top-0 w-100 bg-white shadow-sm" style={{ zIndex: 1030 }}>
                <div className="col-md-12 d-flex justify-content-between align-items-center py-2 px-4">
                    <div className="d-flex flex-column">
                        <span className="fw-bold">B2B</span>
                        <small className="text-muted">restaurant partner</small>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <button className="btn btn-link text-dark p-0">
                            <i className="bi bi-bell fs-5"></i>
                        </button>
                        <button className="btn btn-link text-dark p-0">
                            <i className="bi bi-gear fs-5"></i>
                        </button>
                        <Link to="/feedback" className="text-decoration-none">
                            <span className="text-dark">Share feedback</span>
                        </Link>
                        <div className="d-flex align-items-center gap-2">
                            <div className="dropdown">
                                <button
                                    className="btn btn-sm dropdown-toggle d-flex align-items-center gap-1"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => handleStatusChange('online')}
                                        >
                                            Online
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => handleStatusChange('offline')}
                                        >
                                            Offline
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="dropdown">
                                <button className="btn btn-link text-dark p-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                    <span className="text-dark">{user?.username || 'User'}</span>
                                    <i className="bi bi-person-circle fs-5"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><a className="dropdown-item" href="#">Profile</a></li>
                                    <li><a className="dropdown-item" href="#">Settings</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" href="#">Logout</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                    logo=""
                    subtitle=""
                />

                {/* Main Content */}
                <div className="col-md-10 ms-auto">
                    {/* Top Navigation */}
                    <div className="bg-white shadow-sm p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-4">
                                {tabs.map((tab, index) => (
                                    <Link
                                        key={index}
                                        to={tab.path}
                                        className={`text-decoration-none ${index === 0 ? 'text-primary border-bottom border-2 border-primary' : 'text-dark'}`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Menu Categories */}
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
                                    {categories.map(category => (
                                        <div key={category.id} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span 
                                                    className={`cursor-pointer ${selectedCategory === category.id ? 'text-primary' : ''}`}
                                                    onClick={() => {
                                                        setSelectedCategory(category.id);
                                                        // Set the first subcategory as selected when category is clicked
                                                        if (category.subcategories.length > 0) {
                                                            setSelectedSubcategory(category.subcategories[0]);
                                                        } else {
                                                            setSelectedSubcategory(null);
                                                        }
                                                    }}
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
                                                                    onClick={() => handleDeleteCategory(category.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <button 
                                                        className="btn btn-link text-dark p-0"
                                                        onClick={() => toggleCategoryExpansion(category.id)}
                                                    >
                                                        <i className={`bi bi-chevron-${category.isExpanded ? 'up' : 'down'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            {category.isExpanded && (
                                                <>
                                                    {category.subcategories.map(subcategory => (
                                                        <div key={subcategory.id} className="ms-3 mt-2">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span 
                                                                    className={`cursor-pointer ${selectedSubcategory?.id === subcategory.id ? 'text-primary' : ''}`}
                                                                    onClick={() => setSelectedSubcategory(subcategory)}
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
                                                                                onClick={() => openModal('subcategory', 'edit', subcategory, category.id)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button 
                                                                                className="dropdown-item text-danger"
                                                                                onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
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
                                                            onClick={() => openModal('subcategory', 'add', null, category.id)}
                                                        >
                                                            <i className="bi bi-plus-lg me-2"></i>
                                                            Add Subcategory
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
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
                                                                    {item.price} | {item.customisable ? 'customisable' : ''}
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
                                                                            onClick={() => handleDeleteItem(selectedCategory, selectedSubcategory.id, item.id)}
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
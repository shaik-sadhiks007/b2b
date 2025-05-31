import React, { useState } from 'react';

const InventoryManager = ({ categories, onStockChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedSubcategories, setExpandedSubcategories] = useState({});

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const toggleSubcategory = (subcategoryId) => {
        setExpandedSubcategories(prev => ({
            ...prev,
            [subcategoryId]: !prev[subcategoryId]
        }));
    };

    const toggleStockStatus = (item) => {
        if (onStockChange) {
            onStockChange(item.id, !item.inStock);
        }
    };

    const toggleAllInCategory = (categoryId, value) => {
        const category = categories.find(c => c.id === categoryId);
        if (onStockChange) {
            category.subcategories.forEach(sub => {
                sub.items.forEach(item => {
                    onStockChange(item.id, value);
                });
            });
        }
    };

    const toggleAllInSubcategory = (subcategoryId, items, value) => {
        if (onStockChange) {
            items.forEach(item => {
                onStockChange(item.id, value);
            });
        }
    };

    // Add this CSS at the top of your component
    const toggleStyles = `
        .form-switch .form-check-input:checked {
            background-color: #198754;
            border-color: #198754;
        }
        .form-switch .form-check-input:not(:checked) {
            background-color: #dc3545;
            border-color: #dc3545;
        }
        .form-switch .form-check-input:focus {
            border-color: rgba(0, 0, 0, 0.25);
            box-shadow: none;
        }
    `;

    // Helper function to check if all items in a subcategory are out of stock
    const isSubcategoryInStock = (subcategory) => {
        // Returns true if at least one item is in stock
        return subcategory.items.some(item => item.inStock);
    };

    // Helper function to check if all subcategories in a category are out of stock
    const isCategoryInStock = (category) => {
        // Returns true if at least one item in any subcategory is in stock
        return category.subcategories.some(sub => 
            sub.items.some(item => item.inStock)
        );
    };

    return (
        <div className="container-fluid px-4">
            <style>{toggleStyles}</style>
            {/* Search Bar */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search for dishes, categories or subcategories"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-6 text-end">
                    <button className="btn btn-outline-primary">
                        <i className="bi bi-filter me-2"></i>
                        Filters
                    </button>
                </div>
            </div>

            {/* Categories List */}
            <div className="list-group">
                {categories.map(category => (
                    <div key={category.id} className="list-group-item border-0 p-0 mb-3">
                        {/* Category Header */}
                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    className="btn btn-link p-0 text-dark"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <i className={`bi bi-chevron-${expandedCategories[category.id] ? 'down' : 'right'}`}></i>
                                </button>
                                <span className="fw-bold">{category.name}</span>
                                <span className="text-muted">
                                    ({category.subcategories.reduce((acc, sub) => acc + sub.items.length, 0)} items)
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className={`small ${isCategoryInStock(category) ? 'text-success' : 'text-danger'}`}>
                                    {isCategoryInStock(category) ? 'In stock' : 'Out of stock'}
                                </span>
                                <div className="form-check form-switch mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={`category-switch-${category.id}`}
                                        checked={isCategoryInStock(category)}
                                        onChange={(e) => toggleAllInCategory(category.id, e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subcategories */}
                        {expandedCategories[category.id] && (
                            <div className="ms-4 mt-2">
                                {category.subcategories.map(subcategory => (
                                    <div key={subcategory.id} className="mb-2">
                                        {/* Subcategory Header */}
                                        <div className="d-flex justify-content-between align-items-center p-2 bg-white rounded">
                                            <div className="d-flex align-items-center gap-3">
                                                <button
                                                    className="btn btn-link p-0 text-dark"
                                                    onClick={() => toggleSubcategory(subcategory.id)}
                                                >
                                                    <i className={`bi bi-chevron-${expandedSubcategories[subcategory.id] ? 'down' : 'right'}`}></i>
                                                </button>
                                                <span>{subcategory.name}</span>
                                                <span className="text-muted">({subcategory.items.length} items)</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`small ${isSubcategoryInStock(subcategory) ? 'text-success' : 'text-danger'}`}>
                                                    {isSubcategoryInStock(subcategory) ? 'In stock' : 'Out of stock'}
                                                </span>
                                                <div className="form-check form-switch mb-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id={`subcategory-switch-${subcategory.id}`}
                                                        checked={isSubcategoryInStock(subcategory)}
                                                        onChange={(e) => toggleAllInSubcategory(subcategory.id, subcategory.items, e.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        {expandedSubcategories[subcategory.id] && (
                                            <div className="ms-4 mt-2">
                                                {subcategory.items.map(item => (
                                                    <div key={item.id} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className={`bi bi-circle-fill ${item.isVeg ? 'text-success' : 'text-danger'}`} style={{ fontSize: '8px' }}></i>
                                                            <span>{item.name}</span>
                                                            <span className="text-muted">{item.price}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className={`small ${item.inStock ? 'text-success' : 'text-danger'}`}>
                                                                {item.inStock ? 'In stock' : 'Out of stock'}
                                                            </span>
                                                            <div className="form-check form-switch mb-0">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id={`item-switch-${item.id}`}
                                                                    checked={item.inStock}
                                                                    onChange={() => toggleStockStatus(item)}
                                                                />
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
                ))}
            </div>
        </div>
    );
};

export default InventoryManager; 
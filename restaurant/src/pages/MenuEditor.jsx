import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Pencil, Trash2, Plus } from 'lucide-react';
import MenuItemModal from './MenuItemModal';
import BulkAddModal from './BulkAddModal';
import { MenuContext } from '../context/MenuContext';
import ConfirmModal from '../reusable/ConfirmModal';

function MenuEditor() {
    const {
        menuItems, // now an array of { category, subcategories: [{ subcategory, items: [...] }] }
        loading,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        bulkAddMenuItems,
        bulkDeleteMenuItems,
    } = useContext(MenuContext);

    // State for selected category and subcategory (by name)
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ category: '', subcategory: '', item: null });
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Bulk delete state
    const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectedSubcategories, setSelectedSubcategories] = useState({});

    // Set default selected category and subcategory on load
    React.useEffect(() => {
        if (menuItems.length > 0 && !selectedCategory) {
            setSelectedCategory(menuItems[0].category);
            if (menuItems[0].subcategories.length > 0) {
                setSelectedSubcategory(menuItems[0].subcategories[0].subcategory);
            }
        }
    }, [menuItems, selectedCategory]);

    // When selectedCategory changes, reset selectedSubcategory
    React.useEffect(() => {
        const catObj = menuItems.find(cat => cat.category === selectedCategory);
        if (catObj && catObj.subcategories.length > 0) {
            setSelectedSubcategory(catObj.subcategories[0].subcategory);
        } else {
            setSelectedSubcategory('');
        }
    }, [selectedCategory, menuItems]);

    // Handle modal submit for add/edit
    const handleModalSubmit = (formData) => {
        if (modalData.item) {
            updateMenuItem(modalData.item._id, formData);
        } else {
            addMenuItem({ ...formData });
        }
        setModalOpen(false);
        setModalData({ category: '', subcategory: '', item: null });
    };

    // Handle opening modal for add/edit
    const handleOpenModal = (category = '', subcategory = '', item = null) => {
        setModalData({ category, subcategory, item });
        setModalOpen(true);
    };

    // Handle bulk add
    const handleBulkAdd = async (itemsData) => {
        try {
            await bulkAddMenuItems(itemsData);
        } catch (error) {
            console.error('Error in bulk add:', error);
        }
    };

    // Handle subcategory delete click (enter bulk delete mode)
    const handleSubcategoryDeleteClick = (subcat) => {
        setBulkDeleteMode(true);
        // Pre-select all items in this subcategory
        const allItemIds = subcat.items.map(item => item._id);
        const selectedItemsObj = {};
        allItemIds.forEach(id => {
            selectedItemsObj[id] = true;
        });
        setSelectedItems(selectedItemsObj);
        // Pre-select this subcategory
        setSelectedSubcategories({ [subcat.subcategory]: true });
    };

    // Handle item selection for bulk delete
    const handleItemSelection = (itemId, isSelected) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: isSelected
        }));
    };

    // Handle subcategory selection for bulk delete
    const handleSubcategorySelection = (subcategoryName, isSelected) => {
        setSelectedSubcategories(prev => ({
            ...prev,
            [subcategoryName]: isSelected
        }));
        
        // If subcategory is selected, select all items in it
        const currentCategoryObj = menuItems.find(cat => cat.category === selectedCategory);
        if (currentCategoryObj) {
            const subcat = currentCategoryObj.subcategories.find(sub => sub.subcategory === subcategoryName);
            if (subcat) {
                const allItemIds = subcat.items.map(item => item._id);
                const updatedSelection = { ...selectedItems };
                allItemIds.forEach(id => {
                    updatedSelection[id] = isSelected;
                });
                setSelectedItems(updatedSelection);
            }
        }
    };

    // Handle bulk delete confirmation
    const handleBulkDeleteConfirm = async () => {
        const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
        
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
            console.error('Error in bulk delete:', error);
        }
    };

    // Handle cancel bulk delete (clear all selections)
    const handleCancelBulkDelete = () => {
        setBulkDeleteMode(false);
        setSelectedItems({});
        setSelectedSubcategories({});
    };

    // Get current category and subcategories
    const currentCategoryObj = menuItems.find(cat => cat.category === selectedCategory);
    const subcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];

    if (loading) return <div className="p-4">Loading menu...</div>;

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for items..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <circle cx={11} cy={11} r={8} />
                                <line x1={21} y1={21} x2={16.65} y2={16.65} />
                            </svg>
                        </div>
                        {/* Show Out of Stock Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="out-of-stock"
                                checked={showOutOfStock}
                                onChange={e => setShowOutOfStock(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="out-of-stock" className="ms-1 text-sm text-gray-600">
                                Show Out of stock
                            </label>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                onClick={() => setBulkModalOpen(true)}
                            >
                                Bulk Data
                            </button>
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                                Import Excel
                            </button>
                            {/* Add New Item */}
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                onClick={() => handleOpenModal('', '', null)}
                            >
                                Add New Item
                            </button>
                        </div>
                    </div>
                    <div className="flex h-screen">
                        {/* Categories Sidebar */}
                        <div className="w-64 bg-white p-6 border-r border-gray-200 flex-shrink-0 h-screen">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Categories.
                                <div className="w-8 h-0.5 bg-gray-800 mt-1"></div>
                            </h2>
                            <div className="space-y-3">
                                {menuItems.map((categoryObj) => (
                                    <div
                                        key={categoryObj.category}
                                        className={`flex items-center justify-between text-gray-600 hover:text-gray-800 cursor-pointer py-2 text-sm transition-colors ${selectedCategory === categoryObj.category ? "font-bold text-orange-500" : ""}`}
                                        onClick={() => setSelectedCategory(categoryObj.category)}
                                    >
                                        <span>{categoryObj.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Main Menu Area */}
                        <div className="flex-1 p-6 pt-3 overflow-y-auto h-screen">
                            {/* Subcategory Tabs */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold">Subcategories</span>
                                <button
                                    className="flex items-center gap-2 bg-black/80 text-white px-4 py-1 rounded hover:bg-gray-800 transition-colors"
                                    onClick={() => handleOpenModal(selectedCategory, '', null)}
                                >
                                    <Plus size={20} />
                                    Add Subcategory
                                </button>
                            </div>
                            <div className="flex flex-column gap-4">
                                {/* Bulk Delete Controls */}
                                {bulkDeleteMode && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-red-600 font-semibold">🗑️ Bulk Delete Mode</span>
                                                <span className="text-sm text-red-700">
                                                    Selected: {Object.keys(selectedItems).filter(id => selectedItems[id]).length} items
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
                                                        const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
                                                        if (selectedItemIds.length > 0) {
                                                            setItemToDelete({ type: 'bulk', itemIds: selectedItemIds });
                                                            setDeleteConfirmOpen(true);
                                                        }
                                                    }}
                                                    disabled={Object.keys(selectedItems).filter(id => selectedItems[id]).length === 0}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                                                >
                                                    Delete Selected
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-red-600 mt-2">
                                            Select items and subcategories you want to delete. Use checkboxes to select individual items or subcategories to select all items in that subcategory.
                                        </p>
                                    </div>
                                )}
                                
                                {subcategories.map((subcat) => (
                                    <div key={subcat.subcategory}>
                                        <div
                                            className={`flex items-center justify-between gap-4 px-4 py-3 rounded-md border ${
                                                bulkDeleteMode 
                                                    ? selectedSubcategories[subcat.subcategory] 
                                                        ? 'border-red-300 bg-red-50' 
                                                        : 'border-gray-200 bg-white'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Subcategory checkbox - only show in bulk delete mode */}
                                                {bulkDeleteMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubcategories[subcat.subcategory] || false}
                                                        onChange={(e) => handleSubcategorySelection(subcat.subcategory, e.target.checked)}
                                                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                    />
                                                )}
                                                <span className="fs-3 text-gray-800 font-bold">{subcat.subcategory == 'general' ? '' : subcat.subcategory}</span>
                                                {bulkDeleteMode && (
                                                    <span className="text-sm text-gray-500">({subcat.items.length} items)</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">

                                                {(subcat.subcategory != 'general') && (
                                                    <button
                                                        className="text-gray-600 hover:text-gray-800"
                                                        onClick={e => { e.stopPropagation(); /* handle subcategory edit here */ }}
                                                        title="Edit Subcategory"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    className="text-gray-600 hover:text-gray-800"
                                                    onClick={e => { e.stopPropagation(); handleOpenModal(selectedCategory, subcat.subcategory, null); }}
                                                    title="Add Item"
                                                >
                                                    <Plus size={25} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={e => { e.stopPropagation(); handleSubcategoryDeleteClick(subcat); }}
                                                    title="Delete Subcategory"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Menu List Container */}
                                        <div className="space-y-8">
                                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-4">
                                                {subcat.items
                                                    .filter(item =>
                                                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                                        (!showOutOfStock || item.inStock === false)
                                                    )
                                                    .map((item, index) => (
                                                        <div
                                                            key={item._id || index}
                                                            className={`flex items-center justify-between rounded-md p-3 ${
                                                                bulkDeleteMode && selectedItems[item._id] 
                                                                    ? 'bg-red-50 border border-red-200' 
                                                                    : 'bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {/* Item checkbox - only show in bulk delete mode */}
                                                                {bulkDeleteMode && (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedItems[item._id] || false}
                                                                        onChange={(e) => handleItemSelection(item._id, e.target.checked)}
                                                                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                                    <div className="text-sm text-gray-600">₹{item.price || item.totalPrice}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                {/* InStock Toggle */}
                                                                <label className="flex items-center cursor-pointer">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.inStock}
                                                                            onChange={() => updateMenuItem(item._id, { ...item, inStock: !item.inStock })}
                                                                            className="sr-only"
                                                                        />
                                                                        <div className={`block w-10 h-6 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                        <div
                                                                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${item.inStock ? 'translate-x-4' : ''
                                                                                }`}
                                                                        ></div>
                                                                    </div>
                                                                </label>
                                                                {/* Edit/Delete - Hide in bulk delete mode */}
                                                                {!bulkDeleteMode && (
                                                                    <>
                                                                        <button
                                                                            className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                                            onClick={() => handleOpenModal(selectedCategory, selectedSubcategory, item)}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            className="ms-3 text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                                            onClick={() => {
                                                                                setItemToDelete(item);
                                                                                setDeleteConfirmOpen(true);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    {/* Add/Edit Menu Item Offcanvas Modal */}
                    <MenuItemModal
                        open={modalOpen}
                        onClose={() => {
                            setModalOpen(false);
                            setModalData({ category: '', subcategory: '', item: null });
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

                    {/* Delete Confirmation Modal */}
                    <ConfirmModal
                        isOpen={deleteConfirmOpen}
                        onClose={() => {
                            setDeleteConfirmOpen(false);
                            setItemToDelete(null);
                        }}
                        onConfirm={() => {
                            if (itemToDelete) {
                                if (itemToDelete.type === 'bulk') {
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
                            itemToDelete?.type === 'bulk' 
                                ? `Are you sure you want to delete ${itemToDelete.itemIds.length} selected items?`
                                : "Are you sure you want to delete this item?"
                        }
                    />
                </div>
            </div>
        </div >
    );
}

export default MenuEditor;
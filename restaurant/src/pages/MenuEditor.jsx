import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Pencil, Trash2, Plus } from 'lucide-react';
import MenuItemModal from './MenuItemModal';
import { MenuContext } from '../context/MenuContext';

function MenuEditor() {
    const {
        menuItems, // now an array of { category, subcategories: [{ subcategory, items: [...] }] }
        loading,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
    } = useContext(MenuContext);

    // State for selected category and subcategory (by name)
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ category: '', subcategory: '', item: null });

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

    // Get current category and subcategories
    const currentCategoryObj = menuItems.find(cat => cat.category === selectedCategory);
    const subcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];
    const currentSubcategoryObj = subcategories.find(sub => sub.subcategory === selectedSubcategory);
    const items = currentSubcategoryObj ? currentSubcategoryObj.items : [];

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
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
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
                                {subcategories.map((subcat) => (
                                    <div>
                                        <div
                                            key={subcat.subcategory}
                                            className={`flex items-center justify-between gap-4 px-0 py-2 rounded-md bg-white w-full cursor-pointer'}`}
                                        >
                                            <span className="fs-3 text-gray-800 font-bold">{subcat.subcategory == 'general' ? '' : subcat.subcategory}</span>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    className="text-gray-600 hover:text-gray-800"
                                                    onClick={e => { e.stopPropagation(); /* handle subcategory edit here */ }}
                                                    title="Edit Subcategory"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-gray-800"
                                                    onClick={e => { e.stopPropagation(); handleOpenModal(selectedCategory, subcat.subcategory, null); }}
                                                    title="Add Item"
                                                >
                                                    <Plus size={25} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={e => { e.stopPropagation(); /* handle subcategory delete here */ }}
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
                                                            className="flex items-center justify-between rounded-md bg-white"
                                                        >
                                                            <div>
                                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                                <div className="text-sm text-gray-600">₹{item.price || item.totalPrice}</div>
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
                                                                {/* Edit/Delete */}
                                                                <button
                                                                    className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                                    onClick={() => handleOpenModal(selectedCategory, selectedSubcategory, item)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="ms-3 text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors bg-gray-200/60 border"
                                                                    onClick={() => deleteMenuItem(item._id)}
                                                                >
                                                                    Delete
                                                                </button>
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
                </div>
            </div>
        </div >
    );
}

export default MenuEditor;
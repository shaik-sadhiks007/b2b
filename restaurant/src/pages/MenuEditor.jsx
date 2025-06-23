import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import menuData from "./data.json"; // Make sure this import is at the top
import { Pencil, Trash2 } from 'lucide-react';
import MenuItemModal from './MenuItemModal';

function MenuEditor() {
    const [selectedCategory, setSelectedCategory] = useState(menuData.menu[0]?.category || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const filteredCategories = menuData.menu;
    const currentCategory = filteredCategories.find(cat => cat.category === selectedCategory);

    // icons for edit and delete
    const EditIcon = () => (
        <Pencil width={18} height={18} />
    );
    const DeleteIcon = () => (
        <Trash2 width={18} height={18} />
    );

    // Handle modal submit
    const handleAddMenuItem = (formData) => {
        console.log('New menu item:', formData);
        setModalOpen(false);
    };

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
                            <label htmlFor="out-of-stock" className="text-sm text-gray-600">
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
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                onClick={() => setModalOpen(true)}
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
                                {filteredCategories.map((category, index) => (
                                    <div
                                        key={category.category}
                                        className={`flex items-center justify-between text-gray-600 hover:text-gray-800 cursor-pointer py-2 text-sm transition-colors ${selectedCategory === category.category ? "font-bold text-orange-500" : ""}`}
                                        onClick={() => setSelectedCategory(category.category)}
                                    >
                                        <span>{category.category}</span>
                                        <span>
                                            <button className="p-1" title="Edit Category"><EditIcon /></button>
                                            <button className="p-1" title="Delete Category"><DeleteIcon /></button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Main Menu Area */}
                        <div className="flex-1 p-6 overflow-y-auto h-screen">
                            <div className="space-y-8">
                                {currentCategory?.subcategories.map((subcategory) => (
                                    <div key={subcategory.subcategory}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">{subcategory.subcategory}</h3>
                                            <span>
                                                <button className="p-1" title="Edit Subcategory"><EditIcon /></button>
                                                <button className="p-1" title="Delete Subcategory"><DeleteIcon /></button>
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {subcategory.items
                                                .filter(item =>
                                                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                                                    && (!showOutOfStock || !item.available === false)
                                                )
                                                .map((item, index) => (
                                                    <div key={item._id || index} className="flex items-center justify-between py-3 border-b border-gray-100">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            <div>
                                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                                <div className="text-sm text-gray-600">₹{item.price}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <button className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors">
                                                                Edit
                                                            </button>
                                                            <button className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Add Menu Item Offcanvas Modal */}
                    <MenuItemModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddMenuItem} />
                </div>
            </div>
        </div>
    );
}

export default MenuEditor;
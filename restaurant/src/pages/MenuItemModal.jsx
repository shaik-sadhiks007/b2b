import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const defaultForm = {
    name: '',
    category: '',
    subcategory: '',
    foodType: 'veg',
    description: '',
    photos: '',
    totalPrice: '',
    inStock: true,
    quantity: 100,
};

const MenuItemModal = ({ open, onClose, onSubmit }) => {
    const [form, setForm] = useState(defaultForm);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) setForm(defaultForm);
    }, [open]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.totalPrice) {
            setError('Name and Price are required');
            return;
        }
        setError('');
        onSubmit(form);
        setForm(defaultForm);
    };

    // Close when clicking outside the offcanvas
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex justify-end bg-black/70"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-md h-full shadow-lg p-6 relative animate-slide-in-right overflow-y-auto">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X />
                </button>
                <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
                {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Subcategory</label>
                            <input
                                type="text"
                                name="subcategory"
                                value={form.subcategory}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Food Type</label>
                        <select
                            name="foodType"
                            value={form.foodType}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="veg">Veg</option>
                            <option value="nonveg">Non-Veg</option>
                            <option value="egg">Egg</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo URL</label>
                        <input
                            type="text"
                            name="photos"
                            value={form.photos}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Price<span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="totalPrice"
                                value={form.totalPrice}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="inStock"
                            checked={form.inStock}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="text-sm">In Stock</label>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                        >
                            Add Item
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
                }
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default MenuItemModal; 
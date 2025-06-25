import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const defaultForm = {
    name: '',
    category: '',
    subcategory: '',
    foodType: 'veg',
    description: '',
    photos: '', // will store base64 or url
    totalPrice: '',
    inStock: true,
    quantity: 100,
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const MenuItemModal = ({ open, onClose, onSubmit, preSelectedCategory = '', preSelectedSubcategory = '', item }) => {
    const [form, setForm] = useState(
        item != null
            ? { ...item }
            : {
                ...defaultForm,
                category: preSelectedCategory,
                subcategory: preSelectedSubcategory,
            }
    );

    console.log("item",item)
    console.log('form',form)
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (item != null) {
            setForm({ ...item });
        } else {
            setForm({
                ...defaultForm,
                category: preSelectedCategory,
                subcategory: preSelectedSubcategory,
            });
        }
    }, [item, preSelectedCategory, preSelectedSubcategory]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, WEBP, and GIF images are allowed.');
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error('Image size must be less than 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, photos: reader.result }));
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
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
        setImagePreview(null);
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
                                readOnly={!!preSelectedCategory}
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
                                readOnly={!!preSelectedSubcategory}
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
                        <label className="block text-sm font-medium mb-1">Photo Upload (JPG, PNG, WEBP, GIF, &lt;5MB)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="mt-2 h-24 rounded object-cover" />
                        )}
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
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="inStockSwitch"
                            checked={form.inStock}
                            onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor="inStockSwitch">
                            {form.inStock ? "In Stock" : "Out of Stock"}
                        </label>
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
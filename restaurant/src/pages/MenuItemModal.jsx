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
    quantity: 1,
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
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (item != null) {
            setForm({ ...item });
            if (item.photos) setImagePreview(item.photos);
        } else {
            setForm({
                ...defaultForm,
                category: preSelectedCategory,
                subcategory: preSelectedSubcategory,
            });
            setImagePreview(null);
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
            setError('Only JPG, PNG, WEBP, and GIF images are allowed.');
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setError('Image size must be less than 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, photos: reader.result }));
            setImagePreview(reader.result);
            setError('');
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
                <h2 className="text-xl font-semibold mb-4">
                    {item ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price<span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-2">₹</span>
                                <input
                                    type="number"
                                    name="totalPrice"
                                    value={form.totalPrice}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 pl-8"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
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
                        <div>
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
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="veg"
                                    checked={form.foodType === 'veg'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <span>Veg</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="nonveg"
                                    checked={form.foodType === 'nonveg'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                                />
                                <span>Non-Veg</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="egg"
                                    checked={form.foodType === 'egg'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                                />
                                <span>Egg</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="Enter item description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Item Image</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-gray-100 file:text-gray-700
                                    hover:file:bg-gray-200"
                                />
                                <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP, or GIF (Max 5MB)</p>
                            </div>
                            {imagePreview && (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="h-16 w-16 rounded object-cover border" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, photos: '' }));
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="inStock"
                                checked={form.inStock}
                                onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                            />
                            <span className="text-sm font-medium">Available in stock</span>
                        </label>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            {item ? 'Update Item' : 'Add Item'}
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
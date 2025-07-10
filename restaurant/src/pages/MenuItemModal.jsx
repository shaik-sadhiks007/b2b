import { X, HelpCircle } from 'lucide-react';
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
    quantity: ''
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryHelp, setShowCategoryHelp] = useState(false);
    const [showSubcategoryHelp, setShowSubcategoryHelp] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.totalPrice) {
            setError('Name and Price are required');
            return;
        }
        
        setError('');
        setIsSubmitting(true);
        
        try {
            await onSubmit(form);
            setForm(defaultForm);
            setImagePreview(null);
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-lg shadow-xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 hover:scale-100">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {item ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <div className="w-12 h-1 bg-green-500 mt-2 rounded-full"></div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            required
                            placeholder="e.g., idly"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="totalPrice"
                                    value={form.totalPrice}
                                    onChange={handleChange}
                                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <button 
                                    type="button" 
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowCategoryHelp(!showCategoryHelp)}
                                    aria-label="Category help"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </button>
                                {showCategoryHelp && (
                                    <div className="absolute z-10 mt-8 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                                        <p className="text-sm text-gray-700">
                                            Create a new category here. Categories help organize your menu items (e.g., Breakfast, Lunch, Dinner).
                                        </p>
                                        <button 
                                            type="button"
                                            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowCategoryHelp(false)}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                placeholder="e.g., Breakfast"
                                readOnly={!!preSelectedCategory}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory
                                </label>
                                <button 
                                    type="button" 
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowSubcategoryHelp(!showSubcategoryHelp)}
                                    aria-label="Subcategory help"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </button>
                                {showSubcategoryHelp && (
                                    <div className="absolute z-10 mt-8 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                                        <p className="text-sm text-gray-700">
                                            Create a new subcategory here. Subcategories help further organize items within a category (e.g., Classic, Special, Combo).
                                        </p>
                                        <button 
                                            type="button"
                                            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowSubcategoryHelp(false)}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                name="subcategory"
                                value={form.subcategory}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                placeholder="e.g., Classic"
                                readOnly={!!preSelectedSubcategory}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Food Type
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`relative w-5 h-5 rounded-full border-2 ${form.foodType === 'veg' ? 'border-green-500 bg-green-500' : 'border-gray-300'} transition-colors duration-200`}>
                                    {form.foodType === 'veg' && (
                                        <div className="absolute inset-0.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-gray-700">Veg</span>
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="veg"
                                    checked={form.foodType === 'veg'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`relative w-5 h-5 rounded-full border-2 ${form.foodType === 'nonveg' ? 'border-red-500 bg-red-500' : 'border-gray-300'} transition-colors duration-200`}>
                                    {form.foodType === 'nonveg' && (
                                        <div className="absolute inset-0.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-gray-700">Non-Veg</span>
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="nonveg"
                                    checked={form.foodType === 'nonveg'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`relative w-5 h-5 rounded-full border-2 ${form.foodType === 'egg' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'} transition-colors duration-200`}>
                                    {form.foodType === 'egg' && (
                                        <div className="absolute inset-0.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-gray-700">Egg</span>
                                <input
                                    type="radio"
                                    name="foodType"
                                    value="egg"
                                    checked={form.foodType === 'egg'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="Describe the item (ingredients, special notes, etc.)"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Image
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">JPG, PNG, WEBP, or GIF (Max 5MB)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {imagePreview && (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="h-24 w-24 rounded-lg object-cover border shadow-sm" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, photos: '' }));
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors duration-200 shadow-md"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    checked={form.inStock}
                                    onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-5 rounded-full shadow-inner transition-colors duration-200 ${form.inStock ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${form.inStock ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Available in stock</span>
                        </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:shadow-md flex items-center justify-center min-w-24"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : item ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuItemModal;
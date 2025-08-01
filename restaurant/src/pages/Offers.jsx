import React, { useState, useEffect, useContext } from 'react';
import { MenuContext } from '../context/MenuContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Plus,
  X,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  AlertTriangle,
  ChevronDown,
  Calendar,
  Check,
  ChevronUp
} from 'lucide-react';

const Offers = () => {
  const {
    menuItems,
    offers,
    offersLoading,
    createOffer,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
    getOffersForItem,
    fetchBusinessOffers
  } = useContext(MenuContext);
  
  const { user } = useContext(AuthContext);

  const [openForm, setOpenForm] = useState(true); // Changed to true to show form by default
  const [editMode, setEditMode] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    menuItemId: '',
    offerType: 'bulk-price',
    title: '',
    description: '',
    purchaseQuantity: 2,
    discountedPrice: '',
    buyQuantity: 1,
    freeQuantity: 1,
    isActive: true,
    startDate: new Date(),
    endDate: null
  });

  const [errors, setErrors] = useState({});

  

  // Reset form when opening/closing
  useEffect(() => {
    if (!openForm) {
      setFormData({
        menuItemId: '',
        offerType: 'bulk-price',
        title: '',
        description: '',
        purchaseQuantity: 2,
        discountedPrice: '',
        buyQuantity: 1,
        freeQuantity: 1,
        isActive: true,
        startDate: new Date(),
        endDate: null
      });
      setErrors({});
      setCurrentOffer(null);
      setEditMode(false);
    }
  }, [openForm]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Open form to create new offer
  const handleNewOffer = () => {
    setOpenForm(true);
  };

  // Open form to edit existing offer
  const handleEditOffer = (offer) => {
    setCurrentOffer(offer);
    setFormData({
      menuItemId: offer.menuItemId._id,
      offerType: offer.offerType,
      title: offer.title,
      description: offer.description || '',
      purchaseQuantity: offer.purchaseQuantity || 2,
      discountedPrice: offer.discountedPrice || '',
      buyQuantity: offer.buyQuantity || 1,
      freeQuantity: offer.freeQuantity || 1,
      isActive: offer.isActive,
      startDate: new Date(offer.startDate),
      endDate: offer.endDate ? new Date(offer.endDate) : null
    });
    setEditMode(true);
    setOpenForm(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.menuItemId) newErrors.menuItemId = 'Menu item is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    
    if (formData.offerType === 'bulk-price') {
      if (formData.purchaseQuantity < 2) newErrors.purchaseQuantity = 'Must be at least 2';
      if (!formData.discountedPrice || formData.discountedPrice <= 0) {
        newErrors.discountedPrice = 'Valid price required';
      }
    }
    
    if (formData.offerType === 'buy-x-get-y-free') {
      if (formData.buyQuantity < 1) newErrors.buyQuantity = 'Must be at least 1';
      if (formData.freeQuantity < 1) newErrors.freeQuantity = 'Must be at least 1';
    }
    
    if (formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  try {
    if (editMode && currentOffer) {
      await updateOffer(currentOffer._id, formData);
      toast.success('Offer updated successfully');
    } else {
      await createOffer(formData);
      toast.success('Offer created successfully');
    }
    
    setOpenForm(false);
    // Force refresh the offers list
    await fetchBusinessOffers(); // Use your main fetch function here
    
    // Reset form
    setFormData({
      menuItemId: '',
      offerType: 'bulk-price',
      title: '',
      description: '',
      purchaseQuantity: 2,
      discountedPrice: '',
      buyQuantity: 1,
      freeQuantity: 1,
      isActive: true,
      startDate: new Date(),
      endDate: null
    });
    setEditMode(false);
    setCurrentOffer(null);
  } catch (error) {
    toast.error(error.message || 'Failed to save offer');
  }
};

  // Toggle offer status
  const handleToggleStatus = async (offerId) => {
    try {
      await toggleOfferStatus(offerId);
      toast.success('Offer status updated');
      getOffersForItem();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  // Confirm delete
  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setConfirmDelete(true);
  };

  // Execute delete
 const handleConfirmDelete = async () => {
  if (!offerToDelete?._id) {
    toast.error('No offer selected for deletion');
    setConfirmDelete(false);
    return;
  }

  try {
    await deleteOffer(offerToDelete._id);
    toast.success('Offer deleted successfully');
    setConfirmDelete(false);
    // Refresh offers list
    fetchBusinessOffers(); // Use this instead of getOffersForItem if it's the main fetch
  } catch (error) {
    toast.error(error.message || 'Failed to delete offer');
  }
};

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    // Apply status filter
    if (filter === 'active' && !offer.isActive) return false;
    if (filter === 'inactive' && offer.isActive) return false;
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        offer.title.toLowerCase().includes(searchLower) ||
        (offer.description && offer.description.toLowerCase().includes(searchLower)) ||
        offer.menuItemId?.name.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get menu item name by ID
  const getMenuItemName = (id) => {
  if (!menuItems.length) return 'Loading...';
  
  // Handle case where menuItemId might be the full object (if populated)
  if (id && typeof id === 'object' && id.name) {
    return id.name;
  }
  if (typeof id === 'string') {
    for (const category of menuItems) {
      for (const subcategory of category.subcategories) {
        const item = subcategory.items.find(item => item._id === id);
        if (item) return item.name;
      }
    }
  }
  // Handle case where menuItemId is just the ID string
  for (const category of menuItems) {
    for (const subcategory of category.subcategories) {
      const item = subcategory.items.find(item => item._id === id);
      if (item) return item.name;
    }
  }
  
  return 'Unknown Item';
};

  // Calculate savings for bulk price offers
  const calculateSavings = (offer) => {
    if (offer.offerType !== 'bulk-price') return null;
    
    const itemPrice = offer.menuItemId?.totalPrice || 0;
    const originalPrice = itemPrice * offer.purchaseQuantity;
    return originalPrice - offer.discountedPrice;
  };

  // Format date
const formatDate = (dateString) => {
  if (!dateString) return 'No end date';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

  // Check if offer is expired
  const isExpired = (offer) => {
    if (!offer.endDate) return false;
    return new Date(offer.endDate) < new Date();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Manage Offers</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="w-full md:w-auto">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleNewOffer}
          >
            <Plus size={16} />
            Create New Offer
          </button>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Offers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Create/Edit Offer Dialog - Now shown by default */}
      {openForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editMode ? 'Edit Offer' : 'Create New Offer'}
            </h3>
            <button
              onClick={() => setOpenForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item *</label>
                  <select
                    name="menuItemId"
                    value={formData.menuItemId}
                    onChange={handleChange}
                    className={`block w-full border ${errors.menuItemId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                    required
                  >
                    <option value="">Select a menu item</option>
                    {menuItems.flatMap(category => 
                      category.subcategories.flatMap(subcategory => 
                        subcategory.items.map(item => (
                          <option key={item._id} value={item._id}>
                            {item.name} (₹{item.totalPrice})
                          </option>
                        ))
                      )
                    )}
                  </select>
                  {errors.menuItemId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItemId}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                  <select
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  >
                    <option value="bulk-price">Bulk Price (e.g., Buy 2 for ₹180)</option>
                    <option value="buy-x-get-y-free">Buy X Get Y Free</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`block w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>
              </div>
              
              <div>
                {formData.offerType === 'bulk-price' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Quantity *</label>
                      <input
                        type="number"
                        name="purchaseQuantity"
                        value={formData.purchaseQuantity}
                        onChange={handleChange}
                        min={2}
                        className={`block w-full border ${errors.purchaseQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                        required
                      />
                      {errors.purchaseQuantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.purchaseQuantity}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Total Price *</label>
                      <input
                        type="number"
                        name="discountedPrice"
                        value={formData.discountedPrice}
                        onChange={handleChange}
                        min={0.01}
                        step={0.01}
                        className={`block w-full border ${errors.discountedPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                        required
                      />
                      {errors.discountedPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.discountedPrice}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buy Quantity *</label>
                      <input
                        type="number"
                        name="buyQuantity"
                        value={formData.buyQuantity}
                        onChange={handleChange}
                        min={1}
                        className={`block w-full border ${errors.buyQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                        required
                      />
                      {errors.buyQuantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.buyQuantity}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Quantity *</label>
                      <input
                        type="number"
                        name="freeQuantity"
                        value={formData.freeQuantity}
                        onChange={handleChange}
                        min={1}
                        className={`block w-full border ${errors.freeQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
                        required
                      />
                      {errors.freeQuantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.freeQuantity}</p>
                      )}
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Dates</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date *</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.startDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDateChange(new Date(e.target.value), 'startDate')}
                          min={new Date().toISOString().split('T')[0]}
                          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date (optional)</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : null, 'endDate')}
                          min={formData.startDate.toISOString().split('T')[0]}
                          className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active Offer
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setOpenForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editMode ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {offersLoading ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p>Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-lg font-bold mb-2">No offers found</p>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first offer using the form above'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffers.map((offer) => (
                <tr key={offer._id || `${offer.menuItemId}-${offer.title}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold">{offer.title}</div>
                    {offer.description && (
                      <div className="text-sm text-gray-500">
                        {offer.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.menuItemId?.name || getMenuItemName(offer.menuItemId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.offerType === 'bulk-price' ? (
                      <>
                        <div>Buy {offer.purchaseQuantity} for ₹{offer.discountedPrice}</div>
                        <div className="text-sm text-green-600">
                          Save ₹{calculateSavings(offer)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>Buy {offer.buyQuantity} Get {offer.freeQuantity} Free</div>
                        <div className="text-sm">
                          Effective price: ₹{(
                            (offer.buyQuantity * offer.menuItemId?.totalPrice) / 
                            (offer.buyQuantity + offer.freeQuantity)
                          ).toFixed(2)} per item
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>Starts: {new Date(offer.startDate).toLocaleDateString()}</div>
                    <div className={isExpired(offer) ? 'text-red-600' : 'text-gray-500'}>
                      Ends: {offer.endDate ? formatDate(offer.endDate) : 'No end date'}
                    </div>
                    {isExpired(offer) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.isActive ? (
                        <>
                          <CheckCircle2 size={14} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={14} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(offer._id)}
                        className={offer.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                        title={offer.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {offer.isActive ? (
                          <X size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(offer)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete the offer "{offerToDelete?.title}"?
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
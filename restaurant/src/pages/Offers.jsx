import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { OfferContext } from '../context/OfferContext';

const initialOfferState = {
  menuItemId: '',
  title: '',
  description: '',
  offerType: 'bulk-price',
  purchaseQuantity: '',
  discountedPrice: '',
  buyQuantity: '',
  freeQuantity: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const Offers = ({ visible, onHide, item = null }) => {
  const {
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    getActiveOffersForItem,
  } = useContext(OfferContext);

  const [form, setForm] = useState(initialOfferState);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offerList, setOfferList] = useState([]); // active offers for this item
  const [selectedOfferId, setSelectedOfferId] = useState(null); // when editing
  const formRef = useRef(null);

  // Resolve menuItemId from either a full Menu item or an offer-like shape
  const resolveMenuItemId = (itm) => {
    if (!itm) return '';
    if (typeof itm.menuItemId === 'object' && itm.menuItemId?._id) return itm.menuItemId._id;
    return itm.menuItemId || itm._id || '';
  };

  // Load active offers list for this item when modal opens
  const loadOffersForItem = async (menuItemId) => {
    try {
      setLoadingOffers(true);
      const list = await getActiveOffersForItem(menuItemId);
      setOfferList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Load offers error:', err?.response?.data || err?.message);
      toast.error('Failed to load offers for this item');
    } finally {
      setLoadingOffers(false);
    }
  };

  // Initialize form & list on open
  useEffect(() => {
    if (!visible) return;

    const menuItemId = resolveMenuItemId(item);
    setSelectedOfferId(null); // default to create mode
    setForm((prev) => ({
      ...initialOfferState,
      menuItemId: String(menuItemId || ''),
    }));

    if (menuItemId) {
      loadOffersForItem(menuItemId);
    } else {
      setOfferList([]);
    }
  }, [visible, item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'offerType') {
      const nextType = value;
      setForm((prev) => ({
        ...prev,
        offerType: nextType,
        ...(nextType === 'bulk-price'
          ? { buyQuantity: '', freeQuantity: '' }
          : { purchaseQuantity: '', discountedPrice: '' }),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Native + custom validation
  const validateBeforeSubmit = () => {
    const formEl = formRef.current;
    if (formEl && !formEl.checkValidity()) {
      formEl.reportValidity();
      return false;
    }

    if (!String(form.menuItemId || '').trim()) {
      toast.warning('Menu item is missing.');
      return false;
    }
    if (!String(form.title || '').trim()) {
      toast.warning('Title is required.');
      return false;
    }

    if (form.offerType === 'bulk-price') {
      if (form.purchaseQuantity === '' || form.discountedPrice === '') {
        toast.warning('Purchase quantity and discounted price are required.');
        return false;
      }
      if (Number.isNaN(Number(form.purchaseQuantity)) || Number.isNaN(Number(form.discountedPrice))) {
        toast.warning('Purchase quantity and discounted price must be numbers.');
        return false;
      }
    }

    if (form.offerType === 'buy-x-get-y-free') {
      if (form.buyQuantity === '' || form.freeQuantity === '') {
        toast.warning('Buy quantity and free quantity are required.');
        return false;
      }
      if (Number.isNaN(Number(form.buyQuantity)) || Number.isNaN(Number(form.freeQuantity))) {
        toast.warning('Buy quantity and free quantity must be numbers.');
        return false;
      }
    }

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    try {
      setSubmitting(true);

      const payload = {
        menuItemId: String(form.menuItemId).trim(),
        title: form.title.trim(),
        description: form.description?.trim() || '',
        offerType: form.offerType,
        ...(form.offerType === 'bulk-price'
          ? {
              purchaseQuantity: Number(form.purchaseQuantity),
              discountedPrice: Number(form.discountedPrice),
            }
          : {
              buyQuantity: Number(form.buyQuantity),
              freeQuantity: Number(form.freeQuantity),
            }),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isActive: !!form.isActive,
      };

      if (selectedOfferId) {
        await updateOffer(selectedOfferId, payload);
        toast.success('Offer updated successfully');
      } else {
        await createOffer(payload);
        toast.success('Offer created successfully');
      }

      // refresh list and reset/create mode
      await loadOffersForItem(form.menuItemId);
      setSelectedOfferId(null);
      setForm((prev) => ({
        ...initialOfferState,
        menuItemId: prev.menuItemId,
      }));
      onHide?.(); // close if you prefer; or remove this to keep modal open
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.errors?.join(', ') ||
        err?.response?.data?.message ||
        'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOffer = (offer) => {
    setSelectedOfferId(offer._id);
    setForm({
      menuItemId: resolveMenuItemId(offer) || resolveMenuItemId(item) || '',
      title: offer.title || '',
      description: offer.description || '',
      offerType: offer.offerType || 'bulk-price',
      purchaseQuantity: offer.purchaseQuantity ?? '',
      discountedPrice: offer.discountedPrice ?? '',
      buyQuantity: offer.buyQuantity ?? '',
      freeQuantity: offer.freeQuantity ?? '',
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
      isActive: offer.isActive ?? true,
    });
  };

  const handleNewOfferMode = () => {
    setSelectedOfferId(null);
    setForm((prev) => ({
      ...initialOfferState,
      menuItemId: prev.menuItemId,
    }));
  };

  const handleToggleStatus = async (offer) => {
    try {
      await toggleOfferStatus(offer._id);
      await loadOffersForItem(form.menuItemId);
      toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully`);
      // if we were editing this offer, update form state to mirror latest status
      if (selectedOfferId === offer._id) {
        setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteOffer = async (offer) => {
    if (!window.confirm('Delete this offer? This cannot be undone.')) return;
    try {
      await deleteOffer(offer._id);
      await loadOffersForItem(form.menuItemId);
      toast.success('Offer deleted');
      // if we were editing this offer, reset to create mode
      if (selectedOfferId === offer._id) {
        handleNewOfferMode();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to delete offer');
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-white border rounded-lg shadow-md p-6 mt-4 w-full max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Offers for this item</h2>

      {/* Existing offers list */}
      <div className="mb-5">
        {loadingOffers ? (
          <div className="text-sm text-gray-500">Loading offers…</div>
        ) : offerList.length === 0 ? (
          <div className="text-sm text-gray-500">No active offers yet.</div>
        ) : (
          <div className="space-y-2">
            {offerList.map((off) => (
              <div
                key={off._id}
                className={`flex items-center justify-between border rounded p-2 ${
                  selectedOfferId === off._id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {off.title} <span className="text-xs text-gray-500">({off.offerType})</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {off.offerType === 'bulk-price'
                      ? `Buy ${off.purchaseQuantity} for ₹${off.discountedPrice}`
                      : `Buy ${off.buyQuantity} get ${off.freeQuantity} free`}
                    {off.startDate && ` · From ${off.startDate.slice(0, 10)}`}
                    {off.endDate && ` to ${off.endDate.slice(0, 10)}`}
                    {off.isActive ? ' · Active' : ' · Inactive'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                    onClick={() => handleEditOffer(off)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                    onClick={() => handleToggleStatus(off)}
                  >
                    {off.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteOffer(off)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold">{selectedOfferId ? 'Edit Offer' : 'Create Offer'}</h3>
        <button
          className="text-sm border rounded px-2 py-1 hover:bg-gray-50"
          onClick={handleNewOfferMode}
          disabled={submitting}
        >
          New Offer
        </button>
      </div>

      {/* Offer form */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate={false}>
        <label className="block text-xs text-gray-500 mb-1">Menu Item ID</label>
        <input
          type="text"
          name="menuItemId"
          className="border p-2 rounded w-full mb-3 bg-gray-100 text-gray-500"
          value={form.menuItemId}
          readOnly
          required
        />

        <label className="block text-xs text-gray-700 mb-1">Offer Title *</label>
        <input
          type="text"
          name="title"
          placeholder="Offer Title"
          className="border p-2 rounded w-full mb-3"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label className="block text-xs text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded w-full mb-3"
          value={form.description}
          onChange={handleChange}
        />

        <label className="block text-xs text-gray-700 mb-1">Offer Type</label>
        <select
          name="offerType"
          className="border p-2 rounded w-full mb-3"
          value={form.offerType}
          onChange={handleChange}
        >
          <option value="bulk-price">Bulk Price</option>
          <option value="buy-x-get-y-free">Buy X Get Y Free</option>
        </select>

        {form.offerType === 'bulk-price' && (
          <>
            <label className="block text-xs text-gray-700 mb-1">Purchase Quantity *</label>
            <input
              type="number"
              name="purchaseQuantity"
              placeholder="Purchase Quantity"
              className="border p-2 rounded w-full mb-3"
              value={form.purchaseQuantity}
              onChange={handleChange}
              required
              min="1"
              step="1"
            />
            <label className="block text-xs text-gray-700 mb-1">Discounted Price *</label>
            <input
              type="number"
              name="discountedPrice"
              placeholder="Discounted Price"
              className="border p-2 rounded w-full mb-3"
              value={form.discountedPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </>
        )}

        {form.offerType === 'buy-x-get-y-free' && (
          <>
            <label className="block text-xs text-gray-700 mb-1">Buy Quantity *</label>
            <input
              type="number"
              name="buyQuantity"
              placeholder="Buy Quantity"
              className="border p-2 rounded w-full mb-3"
              value={form.buyQuantity}
              onChange={handleChange}
              required
              min="1"
              step="1"
            />
            <label className="block text-xs text-gray-700 mb-1">Free Quantity *</label>
            <input
              type="number"
              name="freeQuantity"
              placeholder="Free Quantity"
              className="border p-2 rounded w-full mb-3"
              value={form.freeQuantity}
              onChange={handleChange}
              required
              min="1"
              step="1"
            />
          </>
        )}

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="border p-2 rounded w-full"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              className="border p-2 rounded w-full"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={onHide}
            disabled={submitting}
          >
            Close
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : selectedOfferId ? 'Update Offer' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Offers;

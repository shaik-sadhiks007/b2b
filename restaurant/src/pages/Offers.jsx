import React, { useContext, useEffect, useState } from 'react';
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
  const { createOffer, updateOffer } = useContext(OfferContext);
  const [form, setForm] = useState(initialOfferState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (item && (item.menuItemId || item._id)) {
        const resolvedMenuItemId =
          typeof item.menuItemId === 'object'
            ? item.menuItemId._id
            : item.menuItemId || item._id || '';

        setForm({
          menuItemId: resolvedMenuItemId,
          title: item.title || '',
          description: item.description || '',
          offerType: item.offerType || 'bulk-price',
          purchaseQuantity: item.purchaseQuantity ?? '',
          discountedPrice: item.discountedPrice ?? '',
          buyQuantity: item.buyQuantity ?? '',
          freeQuantity: item.freeQuantity ?? '',
          startDate: item.startDate?.slice(0, 10) || '',
          endDate: item.endDate?.slice(0, 10) || '',
          isActive: item.isActive ?? true,
        });
      } else {
        setForm({
          ...initialOfferState,
          menuItemId: item?.menuItemId || '', // populate from props even if creating new
        });
      }
    }
  }, [visible, item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isValidForm = () => {
    const requiredBaseFields = form.menuItemId?.trim() && form.title?.trim();

    if (!requiredBaseFields) return false;

    if (form.offerType === 'bulk-price') {
      return (
        form.purchaseQuantity !== '' &&
        form.discountedPrice !== '' &&
        !isNaN(form.purchaseQuantity) &&
        !isNaN(form.discountedPrice)
      );
    }

    if (form.offerType === 'buy-x-get-y-free') {
      return (
        form.buyQuantity !== '' &&
        form.freeQuantity !== '' &&
        !isNaN(form.buyQuantity) &&
        !isNaN(form.freeQuantity)
      );
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) {
      toast.warning('Please fill all required fields');
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim(),
        menuItemId: form.menuItemId,
        isActive: form.isActive,
      };

      // Remove unused fields
      if (form.offerType === 'bulk-price') {
        delete payload.buyQuantity;
        delete payload.freeQuantity;
      } else if (form.offerType === 'buy-x-get-y-free') {
        delete payload.purchaseQuantity;
        delete payload.discountedPrice;
      }

      if (item && item._id) {
        await updateOffer(item._id, payload);
        toast.success('Offer updated successfully');
      } else {
        await createOffer(payload);
        toast.success('Offer created successfully');
      }

      onHide?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg shadow-md p-6 mt-4 w-full max-w-2xl mx-auto"
    >
      <h2 className="text-lg font-semibold mb-4">
        {item && item._id ? 'Edit Offer' : 'Create Offer'}
      </h2>

      <input
        type="text"
        name="menuItemId"
        className="border p-2 rounded w-full mb-2 bg-gray-100 text-gray-500"
        value={form.menuItemId}
        readOnly
      />

      <input
        type="text"
        name="title"
        placeholder="Offer Title"
        className="border p-2 rounded w-full mb-2"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        className="border p-2 rounded w-full mb-2"
        value={form.description}
        onChange={handleChange}
      />

      <select
        name="offerType"
        className="border p-2 rounded w-full mb-2"
        value={form.offerType}
        onChange={handleChange}
      >
        <option value="bulk-price">Bulk Price</option>
        <option value="buy-x-get-y-free">Buy X Get Y Free</option>
      </select>

      {form.offerType === 'bulk-price' && (
        <>
          <input
            type="number"
            name="purchaseQuantity"
            placeholder="Purchase Quantity"
            className="border p-2 rounded w-full mb-2"
            value={form.purchaseQuantity}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="discountedPrice"
            placeholder="Discounted Price"
            className="border p-2 rounded w-full mb-2"
            value={form.discountedPrice}
            onChange={handleChange}
            required
          />
        </>
      )}

      {form.offerType === 'buy-x-get-y-free' && (
        <>
          <input
            type="number"
            name="buyQuantity"
            placeholder="Buy Quantity"
            className="border p-2 rounded w-full mb-2"
            value={form.buyQuantity}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="freeQuantity"
            placeholder="Free Quantity"
            className="border p-2 rounded w-full mb-2"
            value={form.freeQuantity}
            onChange={handleChange}
            required
          />
        </>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="date"
          name="startDate"
          className="border p-2 rounded w-full"
          value={form.startDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endDate"
          className="border p-2 rounded w-full"
          value={form.endDate}
          onChange={handleChange}
        />
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        Active
      </label>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={onHide}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : item && item._id ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
};

export default Offers;

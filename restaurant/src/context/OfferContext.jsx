import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_URL as RAW_API_URL } from '../api/api';
import { toast } from 'react-toastify';

const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

// If using cookie auth/JWT via cookies, keep this on:
axios.defaults.withCredentials = true;

export const OfferContext = createContext();

export const useOffer = () => useContext(OfferContext);

export const OfferProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Track the last-used filters so CRUD refresh respects current view
  const [currentStatus, setCurrentStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);

  const handleErrorToast = (err, fallback = 'Something went wrong') => {
    const data = err?.response?.data;
    const msg =
      (Array.isArray(data?.errors) && data.errors.join(', ')) ||
      data?.message ||
      err?.message ||
      fallback;
    toast.error(msg);
  };

  // Fetch Offers (Business)
  const fetchBusinessOffers = async (status = currentStatus, page = currentPage, limit = currentLimit) => {
    try {
      setLoading(true);
      setCurrentStatus(status);
      setCurrentPage(page);
      setCurrentLimit(limit);

      const res = await axios.get(`${API_URL}/offers/business`, {
        params: { status, page, limit },
      });

      const list = res?.data?.data || [];
      setOffers(list);

      // Return pagination for UI if needed
      return {
        success: !!res?.data?.success,
        data: list,
        pagination: res?.data?.pagination || {
          total: list.length,
          page,
          limit,
          totalPages: 1,
          hasMore: false,
        },
      };
    } catch (err) {
      console.error('Fetch business offers error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to fetch offers');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create Offer
  const createOffer = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/offers/business`, payload);
      // Refresh with current filters
      await fetchBusinessOffers();
      toast.success('Offer created successfully');
      return res.data;
    } catch (err) {
      console.error('Create offer error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to create offer');
      throw err;
    }
  };

  // Update Offer
  const updateOffer = async (offerId, payload) => {
    try {
      const res = await axios.put(`${API_URL}/offers/business/${offerId}`, payload);
      await fetchBusinessOffers();
      toast.success('Offer updated successfully');
      return res.data;
    } catch (err) {
      console.error('Update offer error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to update offer');
      throw err;
    }
  };

  // Toggle Offer Status
  const toggleOfferStatus = async (offerId) => {
    try {
      const res = await axios.patch(`${API_URL}/offers/business/${offerId}/status`);
      await fetchBusinessOffers();
      const active = res?.data?.data?.isActive;
      toast.success(`Offer ${active ? 'activated' : 'deactivated'} successfully`);
      return res.data;
    } catch (err) {
      console.error('Toggle status error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to toggle offer status');
      throw err;
    }
  };

  // Delete Offer
  const deleteOffer = async (offerId) => {
    try {
      const res = await axios.delete(`${API_URL}/offers/business/${offerId}`);
      await fetchBusinessOffers();
      toast.success('Offer deleted successfully');
      return res.data;
    } catch (err) {
      console.error('Delete offer error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to delete offer');
      throw err;
    }
  };

  // Public: Get Offers for Menu Item
  const getActiveOffersForItem = async (menuItemId) => {
    try {
      const res = await axios.get(`${API_URL}/offers/public/item/${menuItemId}`);
      return res.data.data || [];
    } catch (err) {
      console.error('Get item offers error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to fetch item offers');
      throw err;
    }
  };

  // Public: Get Active Offers for Business
  const getActiveOffersForBusiness = async (businessId, category, limit = 10) => {
    try {
      const params = { limit };
      if (category) params.category = category; // don't send null
      const res = await axios.get(`${API_URL}/offers/public/business/${businessId}`, { params });
      return res.data;
    } catch (err) {
      console.error('Get business offers error:', err?.response?.data || err?.message);
      handleErrorToast(err, 'Failed to fetch business offers');
      throw err;
    }
  };

  return (
    <OfferContext.Provider
      value={{
        offers,
        loading,
        // current filters (handy for pagination controls)
        currentStatus,
        currentPage,
        currentLimit,

        fetchBusinessOffers,
        createOffer,
        updateOffer,
        toggleOfferStatus,
        deleteOffer,
        getActiveOffersForItem,
        getActiveOffersForBusiness,
        setOffers, // expose if you need local UI tweaks
      }}
    >
      {children}
    </OfferContext.Provider>
  );
};

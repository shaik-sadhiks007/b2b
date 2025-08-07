import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_URL as RAW_API_URL } from '../api/api'; // Keep original import
import { toast } from 'react-toastify';


const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

export const OfferContext = createContext();

export const useOffer = () => useContext(OfferContext);

export const OfferProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

 
  // Fetch Offers
  const fetchBusinessOffers = async (status = 'active', page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/offers/business`, {
        params: { status, page, limit }
      });
      setOffers(res.data.data || []);
      return res.data;
    } catch (err) {
      console.error('Fetch business offers error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to fetch offers');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create Offer
  const createOffer = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/offers/business`, payload);
      await fetchBusinessOffers();
      toast.success('Offer created successfully');
      return res.data;
    } catch (err) {
      console.error('Create offer error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to create offer');
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
      console.error('Update offer error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to update offer');
      throw err;
    }
  };

  // Toggle Offer Status
  const toggleOfferStatus = async (offerId) => {
    try {
      const res = await axios.patch(`${API_URL}/offers/business/${offerId}/status`);
      await fetchBusinessOffers();
      toast.success(`Offer ${res.data.data?.isActive ? 'activated' : 'deactivated'} successfully`);
      return res.data;
    } catch (err) {
      console.error('Toggle status error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to toggle offer status');
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
      console.error('Delete offer error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete offer');
      throw err;
    }
  };

  // Get Offers for Menu Item
  const getActiveOffersForItem = async (menuItemId) => {
    try {
      const res = await axios.get(`${API_URL}/offers/public/item/${menuItemId}`);
      return res.data;
    } catch (err) {
      console.error('Get item offers error:', err.response?.data || err.message);
      throw err;
    }
  };

  // Get Active Offers for Business (Public)
  const getActiveOffersForBusiness = async (businessId, category = null, limit = 10) => {
    try {
      const res = await axios.get(`${API_URL}/offers/public/business/${businessId}`, {
        params: { category, limit }
      });
      return res.data;
    } catch (err) {
      console.error('Get business offers error:', err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <OfferContext.Provider
      value={{
        offers,
        loading,
        fetchBusinessOffers,
        createOffer,
        updateOffer,
        toggleOfferStatus,
        deleteOffer,
        getActiveOffersForItem,
        getActiveOffersForBusiness,
      }}
    >
      {children}
    </OfferContext.Provider>
  );
};

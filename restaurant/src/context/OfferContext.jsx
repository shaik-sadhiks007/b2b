import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL as RAW_API_URL } from '../api/api';
import { toast } from 'react-toastify';
// import { io } from 'socket.io-client'; // uncomment if you want realtime updates

const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

export const OfferContext = createContext();
export const useOffer = () => useContext(OfferContext);

export const OfferProvider = ({ children }) => {
  // ================== State ==================
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentStatus, setCurrentStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasMore: false,
  });

  // prevent duplicate toasts for same error burst
  const lastErrorRef = useRef('');

  // ================== Axios instance ==================
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      // headers: { 'X-Company-ID': '...' }, // add if you use multi-tenant headers
    });

    instance.interceptors.response.use(
      (r) => r,
      (err) => {
        // central 401 handling (optional)
        if (err?.response?.status === 401) {
          // e.g. redirect to login or show a toast
          // window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
    return instance;
  }, []);

  const errorToast = useCallback((err, fallback = 'Something went wrong') => {
    const data = err?.response?.data;
    const msg =
      (Array.isArray(data?.errors) && data.errors.join(', ')) ||
      data?.message ||
      err?.message ||
      fallback;

    if (msg && lastErrorRef.current !== msg) {
      lastErrorRef.current = msg;
      toast.error(msg, { onClose: () => { lastErrorRef.current = ''; } });
    }
  }, []);

  // ================== CRUD ==================
  const fetchBusinessOffers = useCallback(
    async (status = currentStatus, page = currentPage, limit = currentLimit) => {
      try {
        setLoading(true);
        setCurrentStatus(status);
        setCurrentPage(page);
        setCurrentLimit(limit);

        const res = await api.get('/offers/business', { params: { status, page, limit } });

        const list = res?.data?.data ?? [];
        setOffers(list);

        const pg =
          res?.data?.pagination ?? {
            total: list.length,
            page,
            limit,
            totalPages: 1,
            hasMore: false,
          };
        setPagination(pg);

        return { success: !!res?.data?.success, data: list, pagination: pg };
      } catch (err) {
        console.error('Fetch business offers error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to fetch offers');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, currentLimit, currentPage, currentStatus, errorToast]
  );

  const createOffer = useCallback(
    async (payload) => {
      try {
        const res = await api.post('/offers/business', payload);
        await fetchBusinessOffers(); // respects current filters
       
        return res.data;
      } catch (err) {
        console.error('Create offer error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to create offer');
        throw err;
      }
    },
    [api, fetchBusinessOffers, errorToast]
  );

  const updateOffer = useCallback(
    async (offerId, payload) => {
      try {
        const res = await api.put(`/offers/business/${offerId}`, payload);
        await fetchBusinessOffers();
        
        return res.data;
      } catch (err) {
        console.error('Update offer error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to update offer');
        throw err;
      }
    },
    [api, fetchBusinessOffers, errorToast]
  );

  const toggleOfferStatus = useCallback(
    async (offerId) => {
      try {
        const res = await api.patch(`/offers/business/${offerId}/status`);
        await fetchBusinessOffers();
        const active = res?.data?.data?.isActive;
       
        return res.data;
      } catch (err) {
        console.error('Toggle status error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to toggle offer status');
        throw err;
      }
    },
    [api, fetchBusinessOffers, errorToast]
  );

  const deleteOffer = useCallback(
    async (offerId) => {
      try {
        const res = await api.delete(`/offers/business/${offerId}`);
        await fetchBusinessOffers();
       
        return res.data;
      } catch (err) {
        console.error('Delete offer error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to delete offer');
        throw err;
      }
    },
    [api, fetchBusinessOffers, errorToast]
  );

  // ================== Public ==================
  const getActiveOffersForItem = useCallback(
    async (menuItemId) => {
      try {
        const res = await api.get(`/offers/public/item/${menuItemId}`);
        return res.data;
      } catch (err) {
        console.error('Get item offers error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to fetch item offers');
        throw err;
      }
    },
    [api, errorToast]
  );

  const getActiveOffersForBusiness = useCallback(
    async (businessId, category, limit = 10) => {
      try {
        const params = { limit };
        if (category) params.category = category;
        const res = await api.get(`/offers/public/business/${businessId}`, { params });
        return res.data;
      } catch (err) {
        console.error('Get business offers error:', err?.response?.data || err?.message);
        errorToast(err, 'Failed to fetch business offers');
        throw err;
      }
    },
    [api, errorToast]
  );

  // ================== Optional: realtime refresh ==================
  // If your server emits offer_* events and your page knows businessId,
  // you can auto-refresh current list when something changes.
  // useEffect(() => {
  //   const socket = io(API_URL.replace('/api', ''), { withCredentials: true });
  //   socket.on('offer_created', () => fetchBusinessOffers());
  //   socket.on('offer_updated', () => fetchBusinessOffers());
  //   socket.on('offer_activated', () => fetchBusinessOffers());
  //   socket.on('offer_deactivated', () => fetchBusinessOffers());
  //   socket.on('offer_deleted', () => fetchBusinessOffers());
  //   return () => socket.disconnect();
  // }, [fetchBusinessOffers]);

  const value = useMemo(
    () => ({
      offers,
      loading,

      // current filters + pagination (useful for pagination UI)
      currentStatus,
      currentPage,
      currentLimit,
      pagination,

      fetchBusinessOffers,
      createOffer,
      updateOffer,
      toggleOfferStatus,
      deleteOffer,
      getActiveOffersForItem,
      getActiveOffersForBusiness,

      setOffers, // in case you need local tweaks
      setCurrentStatus,
      setCurrentPage,
      setCurrentLimit,
    }),
    [
      offers,
      loading,
      currentStatus,
      currentPage,
      currentLimit,
      pagination,
      fetchBusinessOffers,
      createOffer,
      updateOffer,
      toggleOfferStatus,
      deleteOffer,
      getActiveOffersForItem,
      getActiveOffersForBusiness,
    ]
  );

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
};

// src/context/OfferContext.jsx
import React, { createContext, useContext, useMemo, useRef } from 'react';
import axios from 'axios';
import { API_URL as RAW_API_URL } from '../api/api';

// --- Build the correct base: ensure it ends with /api
const base = (RAW_API_URL || window.location.origin).replace(/\/+$/, '');
const API_BASE = base.endsWith('/api') ? base : `${base}/api`;

// Single axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // ok even for public endpoints; keep consistent with server CORS
});

const OfferContext = createContext(null);
export const useOffer = () => useContext(OfferContext);

// tiny cache + cancellation so we don’t spam the server
export const OfferProvider = ({ children }) => {
  const cacheRef = useRef(new Map());         // key -> { time, data }
  const controllersRef = useRef(new Map());   // key -> AbortController
  const TTL_MS = 60_000;

  const getCached = (k) => {
    const v = cacheRef.current.get(k);
    if (!v) return null;
    if (Date.now() - v.time > TTL_MS) { cacheRef.current.delete(k); return null; }
    return v.data;
  };
  const setCache = (k, d) => cacheRef.current.set(k, { time: Date.now(), data: d });
  const cancelPrev = (k) => { controllersRef.current.get(k)?.abort(); const c = new AbortController(); controllersRef.current.set(k, c); return c.signal; };

  // GET /api/offers/public/item/:menuItemId
  const getActiveOffersForItem = async (menuItemId, { force = false } = {}) => {
    const key = `item|${menuItemId}`;
    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
    }
    const signal = cancelPrev(key);
    const res = await api.get(`/offers/public/item/${menuItemId}`, { signal });
    const data = res?.data?.data || [];
    setCache(key, data);
    return data;
  };

  // GET /api/offers/public/business/:businessId?category=&limit=
  const getActiveOffersForBusiness = async (businessId, category, limit = 200, { force = false } = {}) => {
    const key = `biz|${businessId}|${category || ''}|${limit}`;
    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
    }
    const signal = cancelPrev(key);
    const params = { limit };
    if (category) params.category = category;
    const res = await api.get(`/offers/public/business/${businessId}`, { params, signal });
    // controller returns { success, count, data } — but we also handle raw arrays just in case
    const data = res?.data?.data || res?.data || [];
    setCache(key, data);
    return data;
  };

  const value = useMemo(() => ({
    getActiveOffersForItem,
    getActiveOffersForBusiness,
    _clearOfferCache: () => cacheRef.current.clear(),
    _base: API_BASE, // handy for debugging
  }), []);

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
};

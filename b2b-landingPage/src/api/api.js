// for local

// Use environment variables and fallback to localhost/production based on location

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000'
    : 'https://api.shopatb2b.com');

export const RESTAURANT_URL =
  import.meta.env.VITE_RESTAURANT_URL ||
  (isLocalhost
    ? 'http://localhost:5174'
    : 'https://business.shopatb2b.com');

export const ORIGIN_URL =
  import.meta.env.VITE_ORIGIN_URL ||
  (isLocalhost
    ? 'http://localhost:5173'
    : 'https://business.shopatb2b.com');
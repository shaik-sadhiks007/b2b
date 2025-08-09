// for local

// Use environment variables and fallback to localhost/production based on location

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isTestDomain = typeof window !== 'undefined' && window.location.hostname.includes('test.shopatb2b.com');

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000'
    : isTestDomain
    ? 'https://api.shopatb2b.com'
    : 'https://api.shopatb2b.com');

export const RESTAURANT_URL =
  import.meta.env.VITE_RESTAURANT_URL ||
  (isLocalhost
    ? 'http://localhost:5174'
    : isTestDomain
    ? 'https://business.test.shopatb2b.com'
    : 'https://business.shopatb2b.com');

export const DELIVERY_URL =
  import.meta.env.VITE_DELIVERY_URL ||
  (isLocalhost
    ? 'http://localhost:5175'
    : isTestDomain
    ? 'https://delivery.test.shopatb2b.com'
    : 'https://delivery.shopatb2b.com');


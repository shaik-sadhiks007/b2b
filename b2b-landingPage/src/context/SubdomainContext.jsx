import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { getSubdomain } from '../utils/getSubdomain';

const SubdomainContext = createContext(null);

export function useSubdomain() {
  return useContext(SubdomainContext);
}

export default function SubdomainProvider({ children }) {
  const [subdomain, setSubdomain] = useState(null);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detect subdomain on mount
  useEffect(() => {
    const sd = getSubdomain();
    setSubdomain(sd);
    setIsSubdomain(!!sd && sd !== 'shopatb2b');
  }, []);

  // Fetch business data for subdomain
  useEffect(() => {
    if (!isSubdomain || !subdomain) {
      setBusinessData(null);
      setRestaurantName(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_URL}/api/subdomain/business/${subdomain}`)
      .then((response) => {
        if (isCancelled) return;
        const data = response?.data || null;
        setBusinessData(data);
        setRestaurantName(data?.restaurantName || null);
      })
      .catch((err) => {
        if (isCancelled) return;
        setBusinessData(null);
        setRestaurantName(null);
        setError(err);
      })
      .finally(() => {
        if (isCancelled) return;
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isSubdomain, subdomain]);

  const value = useMemo(
    () => ({
      isSubdomain,
      subdomain,
      businessData,
      restaurantName,
      loading,
      error,
    }),
    [isSubdomain, subdomain, businessData, restaurantName, loading, error]
  );

  return (
    <SubdomainContext.Provider value={value}>{children}</SubdomainContext.Provider>
  );
}



import { useEffect, useState } from 'react';
import { getSubdomain } from '../utils/getSubdomain';
import { API_URL } from '../api/api';
import axios from 'axios';
import Home from './Home';
import HotelDetails from './HotelDetails';
import { useQuery } from '@tanstack/react-query';

function HomeOrHotelDetails() {
  const subdomain = getSubdomain();

  // Only fetch if subdomain exists
  const {
    data: hotelData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['subdomain-mapping', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;
      const res = await axios.get(`${API_URL}/api/subdomain/${subdomain}`);
      if (res.data && res.data.id && res.data.category) {
        return { id: res.data.id, category: res.data.category };
      } else {
        throw new Error('Restaurant not found');
      }
    },
    enabled: !!subdomain,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  if (!subdomain) {
    // Main domain, show Home
    return <Home />;
  }

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-[40vh] text-red-500">{error.message || 'Restaurant not found'}</div>;
  if (hotelData) {
    // Render HotelDetails for subdomain
    return <HotelDetails id={hotelData.id} category={hotelData.category} />;
  }
  // Main domain: render Home
  return <Home />;
}

export default HomeOrHotelDetails; 
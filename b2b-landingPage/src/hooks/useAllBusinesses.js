import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../api/api';

export const useAllBusinesses = () => {
  const savedLocation = localStorage.getItem('userLocation');
  let url = `${API_URL}/api/restaurants/public/all`;

  if (savedLocation) {
    const { coordinates } = JSON.parse(savedLocation);
    url += `?lat=${coordinates.lat}&lng=${coordinates.lng}`;
  }

  return useQuery({
    queryKey: ['allBusinesses', savedLocation],
    queryFn: async () => {
      const response = await axios.get(url);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Always enabled
  });
}; 
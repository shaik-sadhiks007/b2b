import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../api/api';

export const useRestaurantDetails = (restaurantId) => {
  const savedLocation = localStorage.getItem('userLocation');
  let url = `${API_URL}/api/restaurants/public/${restaurantId}`;

  if (savedLocation) {
    const { coordinates } = JSON.parse(savedLocation);
    url += `?lat=${coordinates.lat}&lng=${coordinates.lng}`;
  }

  const { data: restaurantData, isLoading: isRestaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', restaurantId, savedLocation],
    queryFn: async () => {
      const response = await axios.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!restaurantId,
  });

  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/menu/public/${restaurantId}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!restaurantId,
  });

  return {
    restaurant: restaurantData,
    menu: menuData,
    isLoading: isRestaurantLoading || isMenuLoading,
    error: restaurantError || menuError,
  };
}; 
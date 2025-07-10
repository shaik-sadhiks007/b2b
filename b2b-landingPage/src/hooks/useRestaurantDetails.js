import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../api/api';

export const useRestaurantDetails = (restaurantId, menuRefresh = 0) => {
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
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantId,
  });

  // 👇 Add menuRefresh to the queryKey so that when it changes, query refetches
  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ['menu', restaurantId, menuRefresh], // <- This triggers re-fetch
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/menu/public/${restaurantId}`);
      return response.data;
    },
    enabled: !!restaurantId,
  });

  return {
    restaurant: restaurantData,
    menu: menuData,
    isLoading: isRestaurantLoading || isMenuLoading,
    error: restaurantError || menuError,
  };
};

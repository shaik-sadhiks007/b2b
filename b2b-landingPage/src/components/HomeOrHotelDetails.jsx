import { useEffect, useState } from 'react';
import { getSubdomain } from '../utils/getSubdomain';
import { API_URL } from '../api/api';
import axios from 'axios';
import Home from './Home';
import HotelDetails from './HotelDetails';

function HomeOrHotelDetails() {
  const [loading, setLoading] = useState(false);
  const [hotelData, setHotelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // getSubdomain now handles test and prod logic
    const subdomain = getSubdomain();
    if (!subdomain) {
      // Main domain, show Home
      setHotelData(null);
      setLoading(false);
      setError(null);
      return;
    }
    // Subdomain: fetch mapping
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/api/subdomain/${subdomain}`)
      .then(res => {
        if (res.data && res.data.id && res.data.category) {
          setHotelData({ id: res.data.id, category: res.data.category });
        } else {
          setError('Restaurant not found');
        }
      })
      .catch(() => setError('Restaurant not found'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-[40vh] text-red-500">{error}</div>;
  if (hotelData) {
    // Render HotelDetails for subdomain
    // You may need to pass props or use context depending on HotelDetails implementation
    return <HotelDetails id={hotelData.id} category={hotelData.category} />;
  }
  // Main domain: render Home
  return <Home />;
}

export default HomeOrHotelDetails; 
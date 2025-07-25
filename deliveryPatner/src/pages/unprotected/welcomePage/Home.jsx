import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getDeliveryPartnerProfile, setStep } from '../../../redux/slices/deliveryPartnerRegSlice';

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.deliveryPartnerReg.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegisterClick = async () => {
    if (isAuthenticated) {
      // Try to fetch profile
      const result = await dispatch(getDeliveryPartnerProfile());
      if (result.meta.requestStatus === 'fulfilled' && result.payload) {
        const { step, status } = result.payload;
        if (status === 'active') {
          navigate('/dashboard');
          return;
        } else if (status === 'review') {
          navigate('/review');
          return;
        }
        // Continue from saved step
        if (step) {
          dispatch(setStep(step));
        } else {
          dispatch(setStep(1));
        }
      } else {
        // Start from step 1
        dispatch(setStep(1));
      }
      navigate('/delivery-partner-registration');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Delivery Home</h1>
      <p className="text-lg">Welcome to the Delivery App!</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={handleRegisterClick}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Register as delivery partner'}
      </button>
    </div>
  );
};

export default Home; 
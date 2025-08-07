import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getDeliveryPartnerProfile, setStep } from '../../../redux/slices/deliveryPartnerRegSlice';
import { Truck, Clock, MapPin, DollarSign, Shield, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.deliveryPartnerReg.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

  // Don't render the home page content if user is authenticated
  if (isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
      
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Join Our
                <span className="text-blue-400 block">Delivery Network</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
                Earn money on your own schedule. Deliver orders to customers and be part of our growing community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRegisterClick}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Loading...' : 'Start Earning Today'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white bg-opacity-20 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30"
                >
                  Already a Partner? Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                Why Choose Us?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Earn More</h3>
                  <p className="text-gray-600">Competitive pay rates and bonuses for top performers</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Hours</h3>
                  <p className="text-gray-600">Work when you want, as much or as little as you prefer</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Local Delivery</h3>
                  <p className="text-gray-600">Deliver in your own neighborhood and surrounding areas</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe & Secure</h3>
                  <p className="text-gray-600">Insurance coverage and safety protocols in place</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Setup</h3>
                  <p className="text-gray-600">Quick registration process and instant access to orders</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
                  <p className="text-gray-600">Join thousands of delivery partners across the country</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-blue-100">Active Partners</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">₹50,000+</div>
                  <div className="text-blue-100">Average Monthly Earnings</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-blue-100">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of delivery partners who are already earning with us
            </p>
            <button
              onClick={handleRegisterClick}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Become a Delivery Partner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
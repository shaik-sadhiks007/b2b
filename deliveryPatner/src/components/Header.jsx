import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk, fetchProfileThunk } from '../redux/slices/authSlice';
import { toggleOnlineStatus, getDeliveryPartnerProfile } from '../redux/slices/deliveryPartnerRegSlice';
import { useEffect, useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const deliveryPartner = useSelector((state) => state.deliveryPartnerReg);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfileThunk());
    }
    // Fetch delivery partner profile for online status
    if (isAuthenticated && !deliveryPartner.id) {
      dispatch(getDeliveryPartnerProfile());
    }
    // eslint-disable-next-line
  }, [isAuthenticated, user, deliveryPartner.id, dispatch]);

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };

    if (showProfilePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfilePopup]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
    setShowProfilePopup(false);
  };

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
    setShowProfilePopup(false);
  };

  // Toggle online status handler
  const handleToggleOnline = () => {
    if (deliveryPartner.id) {
      const newOnline = !deliveryPartner.form.online;
      dispatch(toggleOnlineStatus({ id: deliveryPartner.id, online: newOnline }));
    }
  };

  // Toggle sidebar handler
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && !event.target.closest('.sidebar-container')) {
        setShowSidebar(false);
      }
    };

    if (showSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  return (
    <>
      <nav className="w-full bg-white shadow-md z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Left Section with Menu Icon */}
          <div className="flex items-center space-x-4">
            {/* Menu Icon for Small and Medium Devices */}
            {isAuthenticated && user && (
              <button
                onClick={handleToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="https://res.cloudinary.com/dcd6oz2pi/image/upload/f_auto,q_auto/v1/logo/xwdu2f0zjbsscuo0q2kq"
                alt="logo"
                className="w-10 h-10"
              />
              <span className="hidden md:block md:text-xl text-sm font-bold text-gray-800">Delivery Partner</span>
              <span className="md:hidden text-sm font-bold text-gray-800">B2B</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* Online/Offline Toggle */}
              {deliveryPartner.id && (
                <label className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={!!deliveryPartner.form.online}
                      onChange={handleToggleOnline}
                      className="sr-only"
                    />
                    <div
                      className={`block w-10 h-6 rounded-full ${deliveryPartner.form.online ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${deliveryPartner.form.online ? 'translate-x-4' : ''}`}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {deliveryPartner.form.online ? 'Online' : 'Offline'}
                  </span>
                </label>
              )}
              {/* Profile Section */}
              <div className="relative" ref={profileRef}>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={handleProfileClick}>
                  <div
                    className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                    title={user.mobileNumber || user.email}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'D'}
                  </div>
                  <span className="text-gray-700 font-medium hidden md:block">
                    {user.name || 'Delivery Partner'}
                  </span>
                </div>
                
                {/* Profile Popup */}
                {showProfilePopup && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleNavigateToProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login">
              <button className="px-4 py-1.5 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>

    {/* Offcanvas Sidebar for Small and Medium Devices */}
    {showSidebar && (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30"
          onClick={() => setShowSidebar(false)}
        ></div>
        
        {/* Sidebar */}
        <div className="sidebar-container absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
          <Sidebar onItemClick={() => setShowSidebar(false)} />
        </div>
      </div>
    )}
    </>
  );
}

export default Header;

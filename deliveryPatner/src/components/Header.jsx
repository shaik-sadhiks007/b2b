import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk, fetchProfileThunk } from '../redux/slices/authSlice';
import { useEffect } from 'react';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfileThunk());
    }
    // eslint-disable-next-line
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-md z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://res.cloudinary.com/dcd6oz2pi/image/upload/f_auto,q_auto/v1/logo/xwdu2f0zjbsscuo0q2kq"
            alt="logo"
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-gray-800">Delivery Partner</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* Avatar Circle */}
              <div
                className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                title={user.email}
              >
                {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium">
                {user.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition"
              >
                Logout
              </button>
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
  );
}

export default Header;

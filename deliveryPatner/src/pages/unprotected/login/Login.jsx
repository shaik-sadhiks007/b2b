import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from '../../../utils/commonFunction';
import { loginThunk, googleLoginThunk } from '../../../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      // Firebase sign in
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      // Dispatch login thunk to backend
      const resultAction = await dispatch(loginThunk({ email: user.email, firebaseUid: user.uid }));
      if (loginThunk.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      } else {
        setLocalError(resultAction.payload || 'Login failed!');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed!');
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Dispatch google login thunk to backend
      const resultAction = await dispatch(googleLoginThunk({ email: user.email, name: user.displayName, firebaseUid: user.uid }));
      if (googleLoginThunk.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      } else {
        setLocalError(resultAction.payload || 'Google Login failed!');
      }
    } catch (err) {
      setLocalError(err.message || 'Google Login failed!');
    }
  };

  // Helper to check if error should be shown
  const shouldShowError = (err) => {
    if (!err) return false;
    if (typeof err === 'string') {
      const lower = err.toLowerCase();
      if (lower.includes('401')) return false;
      if (lower.includes('no token provided')) return false;
      if (lower.includes('access denied')) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        {shouldShowError(localError) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{localError}</div>}
        {shouldShowError(error) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <Link to="/" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Go to Home
          </Link>
          <Link to="/register" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '../../../utils/commonFunction';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk } from '../../../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showVerification, setShowVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && showVerification) {
        await reload(user);
        if (user.emailVerified) {
          try {
            // Register user in backend via Redux thunk
            const resultAction = await dispatch(registerThunk({
              username: formData.username,
              email: formData.email,
              firebaseUid: user.uid,
            }));
            if (registerThunk.fulfilled.match(resultAction)) {
              alert('Registration Successful!');
              navigate('/login');
            } else {
              setLocalError(resultAction.payload || 'Registration failed');
            }
          } catch (error) {
            setLocalError(error.message || 'Registration failed!');
          }
        }
      }
    });
    return () => unsubscribe();
  }, [showVerification, formData, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      // Send email verification
      await sendEmailVerification(user);
      setVerificationSent(true);
      setShowVerification(true);
    } catch (error) {
      setLocalError(error.message || 'Registration failed!');
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    setLocalError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found. Please try logging in again.');
      await reload(user);
      if (user.emailVerified) {
        try {
          const resultAction = await dispatch(registerThunk({
            username: formData.username,
            email: formData.email,
            firebaseUid: user.uid,
          }));
          if (registerThunk.fulfilled.match(resultAction)) {
            alert('Registration Successful!');
            navigate('/login');
          } else {
            setLocalError(resultAction.payload || 'Registration failed');
          }
        } catch (error) {
          setLocalError(error.message || 'Registration failed!');
        }
      } else {
        setLocalError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      setLocalError(error.message || 'Failed to verify email');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setLocalError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found. Please try logging in again.');
      await sendEmailVerification(user);
      alert('Verification email resent! Please check your inbox.');
    } catch (error) {
      setLocalError(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
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

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Verify Your Email</h2>
          {shouldShowError(localError) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{localError}</div>}
          {shouldShowError(error) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              We've sent a verification email to {formData.email}. Please check your inbox and click the verification link.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleVerifyEmail}
              disabled={verifying || loading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {verifying || loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Register</h2>
        {shouldShowError(localError) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{localError}</div>}
        {shouldShowError(error) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
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
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between">
          <Link to="/" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Go to Home
          </Link>
          <Link to="/login" className="text-lg text-indigo-600 hover:text-indigo-500 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 
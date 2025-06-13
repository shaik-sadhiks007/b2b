import { useState, useEffect, useContext } from 'react';
import { HotelContext } from '../contextApi/HotelContextProvider';
import axios from 'axios';
import { auth } from '../firebase/FIrebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { API_URL } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const { user: contextUser, setUser: setContextUser } = useContext(HotelContext);
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        isDefault: false
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (!contextUser) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchAddresses();
    }, [contextUser, navigate]);


    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/profile`);
            setUser(response.data);
        } catch (error) {
            setError('Failed to fetch user data');
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/customer-address`);
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to fetch addresses');
        }
    };

    const validateAddressForm = () => {
        const errors = {};
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        const zipRegex = /^\d{5}(-\d{4})?$/;

        if (!addressForm.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!addressForm.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(addressForm.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (!addressForm.street.trim()) {
            errors.street = 'Street address is required';
        }

        if (!addressForm.city.trim()) {
            errors.city = 'City is required';
        }

        if (!addressForm.state.trim()) {
            errors.state = 'State is required';
        }

        if (!addressForm.zip.trim()) {
            errors.zip = 'ZIP code is required';
        }

        if (!addressForm.country.trim()) {
            errors.country = 'Country is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors = {};
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (!passwordRegex.test(passwordData.newPassword)) {
            errors.newPassword = 'Password must be at least 8 characters long and contain both letters and numbers';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!validateAddressForm()) {
            toast.error('Please fix the form errors before submitting');
            return;
        }

        try {
            if (editingAddress) {
                await axios.put(
                    `${API_URL}/api/customer-address/${editingAddress._id}`,
                    addressForm
                );
                toast.success('Address updated successfully');
            } else {
                await axios.post(
                    `${API_URL}/api/customer-address`,
                    addressForm
                );
                toast.success('Address added successfully');
            }
            setShowAddressForm(false);
            setEditingAddress(null);
            setAddressForm({
                fullName: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                phone: '',
                isDefault: false
            });
            fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            fullName: address.fullName,
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
            phone: address.phone,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
    };

    const handleDeleteClick = (addressId) => {
        setAddressToDelete(addressId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(
                `${API_URL}/api/customer-address/${addressToDelete}`
            );
            toast.success('Address deleted successfully');
            fetchAddresses();
            setShowDeleteModal(false);
            setAddressToDelete(null);
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    const handleSetDefault = async (addressId) => {
        try {
            await axios.put(
                `${API_URL}/api/customer-address/${addressId}/set-default`,
                {}
            );
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) {
            toast.error('Please fix the password form errors before submitting');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user found');
            }

            await updatePassword(user, passwordData.newPassword);

            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
        } catch (error) {
            console.error('Password update error:', error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Please login again to change your password');
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                toast.error(error.message || 'Failed to update password');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 mt-5">
            <div className="max-w-4xl mx-auto px-4 mt-5">
                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-6 mb-6">
                        <img
                            src={user?.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-bold capitalize">{user?.username}</h2>
                            <p className="text-gray-600">{user?.email}</p>
                            <p className="text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="mt-6">
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </button>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value="********"
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm New Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Update Password
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Your Addresses</h3>
                        <button
                            onClick={() => {
                                setShowAddressForm(!showAddressForm);
                                setEditingAddress(null);
                                setAddressForm({
                                    fullName: '',
                                    street: '',
                                    city: '',
                                    state: '',
                                    zip: '',
                                    country: '',
                                    phone: '',
                                    isDefault: false
                                });
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            {showAddressForm ? 'Cancel' : 'Add New Address'}
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddressSubmit} className="mb-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.fullName}
                                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.fullName && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.street ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.street && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.city ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.city && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.state ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.state && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.zip}
                                        onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.zip ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.zip && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.zip}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.country ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {formErrors.country && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={addressForm.isDefault}
                                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Set as default address</span>
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                {editingAddress ? 'Update Address' : 'Add Address'}
                            </button>
                        </form>
                    )}

                    {addresses.length === 0 ? (
                        <p className="text-gray-500">No addresses found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`border rounded-lg p-4 ${address.isDefault ? 'border-indigo-500 bg-indigo-50' : ''
                                        }`}
                                >
                                    {address.isDefault && (
                                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-2">
                                            Default Address
                                        </span>
                                    )}
                                    <h4 className="font-semibold">{address.fullName}</h4>
                                    <p className="text-gray-600">{address.street}</p>
                                    <p className="text-gray-600">
                                        {address.city}, {address.state} {address.zip}
                                    </p>
                                    <p className="text-gray-600">{address.country}</p>
                                    <p className="text-gray-600">Phone: {address.phone}</p>
                                    <div className="mt-4 flex space-x-2">
                                        <button
                                            onClick={() => handleEditAddress(address)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(address._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(address._id)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Address"
                message="Are you sure you want to delete this address? This action cannot be undone."
            />
        </div>
    );
};

export default Profile;

import { useState, useEffect, useContext } from 'react';
import { HotelContext } from '../contextApi/HotelContextProvider';
import axios from 'axios';
import { auth } from '../firebase/FIrebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Profile = () => {
    const { token } = useContext(HotelContext);
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

    useEffect(() => {
        fetchUserData();
        fetchAddresses();
    }, [token]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
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
            const response = await axios.get('http://localhost:5000/api/customer-address', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to fetch addresses');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axios.put(
                    `http://localhost:5000/api/customer-address/${editingAddress._id}`,
                    addressForm,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setSuccess('Address updated successfully');
            } else {
                await axios.post(
                    'http://localhost:5000/api/customer-address',
                    addressForm,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setSuccess('Address added successfully');
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
            setError(error.response?.data?.message || 'Failed to save address');
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

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await axios.delete(
                    `http://localhost:5000/api/customer-address/${addressId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setSuccess('Address deleted successfully');
                fetchAddresses();
            } catch (error) {
                setError('Failed to delete address');
            }
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/customer-address/${addressId}/set-default`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setSuccess('Default address updated');
            fetchAddresses();
        } catch (error) {
            setError('Failed to update default address');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user found');
            }

            // Update password directly without reauthentication
            await updatePassword(user, passwordData.newPassword);

            setSuccess('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
        } catch (error) {
            console.error('Password update error:', error);
            if (error.code === 'auth/requires-recent-login') {
                setError('Please login again to change your password');
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(error.message || 'Failed to update password');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-6 mb-6">
                        <img
                            src={user?.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-bold">{user?.username}</h2>
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
                                        Current Password
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
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
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
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={addressForm.fullName}
                                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                    <input
                                        type="text"
                                        value={addressForm.zip}
                                        onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Country</label>
                                    <input
                                        type="text"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
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
                                    className={`border rounded-lg p-4 ${
                                        address.isDefault ? 'border-indigo-500 bg-indigo-50' : ''
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
                                            onClick={() => handleDeleteAddress(address._id)}
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

                {/* Error and Success Messages */}
                {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

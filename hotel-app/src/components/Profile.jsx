import React, { useEffect, useState, useContext } from 'react';
import { HotelContext } from '../contextApi/HotelContextProvider';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useContext(HotelContext);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        image: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfileData(data);
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phone: data.phone || '',
                password: '',
                image: data.image || ''
            });
            setImagePreview(data.image || '');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload an image file (jpeg, jpg, or png)');
            return;
        }

        // Create a preview URL for the selected image
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Create FormData and append the file
        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                image: data.imageUrl
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
            // Revert to previous image if upload fails
            setImagePreview(formData.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            setProfileData(prev => ({
                ...prev,
                user: updatedUser
            }));
            setIsEditing(false);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;
    if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="card-title text-center mb-4">Profile</h2>
                                {isEditing ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="text-center mb-4">
                                            <div className="position-relative d-inline-block">
                                                <img
                                                    src={imagePreview || 'https://via.placeholder.com/150'}
                                                    alt="Profile"
                                                    className="rounded-circle"
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                />
                                                <div className="position-absolute bottom-0 end-0">
                                                    <label htmlFor="imageUpload" className="btn btn-sm btn-primary rounded-circle">
                                                        <i className="bi bi-camera"></i>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="imageUpload"
                                                        className="d-none"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploading}
                                                    />
                                                </div>
                                            </div>
                                            {uploading && <div className="mt-2">Uploading...</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                            <small className="text-muted">Email cannot be changed</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">New Password (optional)</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Leave blank to keep current password"
                                            />
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="submit" className="btn btn-primary" disabled={uploading}>
                                                Save Changes
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary" 
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setImagePreview(profileData.image || '');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <div className="text-center mb-4">
                                            <img
                                                src={profileData.image || 'https://via.placeholder.com/150'}
                                                alt="Profile"
                                                className="rounded-circle"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <h5>Personal Information</h5>
                                            <p><strong>Name:</strong> {profileData.username}</p>
                                            <p><strong>Email:</strong> {profileData.email}</p>
                                            <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
                                            <p><strong>Role:</strong> {profileData.role}</p>
                                        </div>
                                        
                                        {profileData.shippingDetails && (
                                            <div className="mb-4">
                                                <h5>Latest Shipping Address</h5>
                                                <p><strong>Address:</strong> {profileData.shippingDetails.address}</p>
                                                <p><strong>City:</strong> {profileData.shippingDetails.city}</p>
                                                <p><strong>State:</strong> {profileData.shippingDetails.state}</p>
                                                <p><strong>Pincode:</strong> {profileData.shippingDetails.pincode}</p>
                                            </div>
                                        )}
                                        
                                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile; 
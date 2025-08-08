import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Clock, Image as ImageIcon, CloudCog } from 'lucide-react';
import { API_URL } from '../api/api';
import { useOutletContext } from 'react-router-dom';

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const BusinessProfile = () => {
    const { user } = useContext(AuthContext);
    const outletContext = useOutletContext();
    // Always admin context
    const { business, ownerId } = outletContext || {};

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(([16.5062, 80.6480])); // Default to bza
    const [isSearching, setIsSearching] = useState(false);
    const [isCoordinateMode, setIsCoordinateMode] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [editingTimes, setEditingTimes] = useState({ openTime: '', closeTime: '' });

    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        serviceType: '',
        description: '',
        subdomain: '',
        contact: {
            primaryPhone: '',
            whatsappNumber: '',
            email: '',
            website: ''
        },
        address: {
            streetAddress: '',
            city: '',
            state: '',
            country: 'india',
            pinCode: ''
        },
        location: {
            lat: 0,
            lng: 0
        },
        operatingHours: {
            defaultOpenTime: '',
            defaultCloseTime: '',
            timeSlots: {
                monday: { isOpen: false, openTime: '', closeTime: '' },
                tuesday: { isOpen: false, openTime: '', closeTime: '' },
                wednesday: { isOpen: false, openTime: '', closeTime: '' },
                thursday: { isOpen: false, openTime: '', closeTime: '' },
                friday: { isOpen: false, openTime: '', closeTime: '' },
                saturday: { isOpen: false, openTime: '', closeTime: '' },
                sunday: { isOpen: false, openTime: '', closeTime: '' }
            }
        },
        images: {
            profileImage: '',
            panCardImage: '',
            gstImage: '',
            fssaiImage: ''
        },
        panDetails: {
            panNumber: '',
            name: '',
            dateOfBirth: '',
            address: ''
        },
        sameAsOwnerPhone: false,
        whatsappUpdates: false,
        status: '',
        category: ''
    });

    // Helper function to format time to HH:mm
    const formatTime = (time) => {
        if (!time) return '';
        // Split the time string into hours and minutes
        const [hours, minutes] = time.split(':');
        // Pad hours with leading zero if needed
        const formattedHours = hours.padStart(2, '0');
        // Return formatted time
        return `${formattedHours}:${minutes}`;
    };

    // Helper function to format operating hours
    const formatOperatingHours = (hours) => {
        if (!hours) return {
            defaultOpenTime: '09:00',
            defaultCloseTime: '22:00',
            timeSlots: {
                monday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                tuesday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                wednesday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                thursday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                friday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                saturday: { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                sunday: { isOpen: false, openTime: '09:00', closeTime: '22:00' }
            }
        };

        const formattedTimeSlots = {};
        Object.entries(hours.timeSlots || {}).forEach(([day, slot]) => {
            formattedTimeSlots[day] = {
                isOpen: slot.isOpen || false,
                openTime: formatTime(slot.openTime) || '09:00',
                closeTime: formatTime(slot.closeTime) || '22:00'
            };
        });

        return {
            defaultOpenTime: formatTime(hours.defaultOpenTime) || '09:00',
            defaultCloseTime: formatTime(hours.defaultCloseTime) || '22:00',
            timeSlots: formattedTimeSlots
        };
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId;
            return (query) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(async () => {
                    if (query.length < 3) return;
                    setIsSearching(true);
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                                query
                            )}&limit=5&addressdetails=1`
                        );
                        if (!response.ok) {
                            throw new Error('Failed to fetch location data');
                        }
                        const data = await response.json();
                        setSearchResults(data);
                    } catch (error) {
                        console.error('Error searching location:', error);
                        setSearchResults([]);
                    } finally {
                        setIsSearching(false);
                    }
                }, 500);
            };
        })(),
        []
    );

    // Update search handler
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length >= 3) {
            debouncedSearch(value);
        } else {
            setSearchResults([]);
        }
    };

    // Add image upload handler
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Update location select handler to auto-fill address
    const handleLocationSelect = (result) => {
        setSelectedLocation(result);
        const newCenter = [parseFloat(result.lat), parseFloat(result.lon)];
        setMapCenter(newCenter);
        // Auto-fill address fields based on location data
        const address = result.address || {};
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                streetAddress: address.road || address.pedestrian || '',
                city: address.city || address.state_district || address.state || '',
                state: address.state || '',
                country: address.country || 'india',
                pinCode: address.pincode || address.pinCode || address.postcode || ''
            },
            location: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            }
        }));
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    // MapComponent to handle marker updates
    const MapComponent = () => {
        const map = useMap();

        useEffect(() => {
            if (selectedLocation) {
                const center = [parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)];
                map.setView(center, 15);
            }
        }, [selectedLocation, map]);

        const handleMarkerDrag = (e) => {
            const marker = e.target;
            const position = marker.getLatLng();

            // Reverse geocode the new position
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
                .then(response => response.json())
                .then(data => {
                    setSelectedLocation({
                        ...selectedLocation,
                        lat: position.lat.toString(),
                        lon: position.lng.toString(),
                        display_name: data.display_name,
                        address: data.address
                    });
                    setMapCenter([position.lat, position.lng]);
                    setFormData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            streetAddress: data.address?.road || data.address?.pedestrian || '',
                            city: data.address?.city || data.address?.state_district || data.address?.state || '',
                            state: data.address?.state || '',
                            country: data.address?.country || 'india',
                            pinCode: data.address?.pincode || data.address?.pinCode || data.address?.postcode || ''
                        },
                        location: {
                            lat: parseFloat(position.lat),
                            lng: parseFloat(position.lng)
                        }
                    }));
                })
                .catch(error => console.error('Error reverse geocoding:', error));
        };

        return selectedLocation ? (
            <Marker
                position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]}
                icon={customIcon}
                draggable={true}
                eventHandlers={{
                    dragend: handleMarkerDrag
                }}
            />
        ) : null;
    };

    // Handle coordinate search
    const handleCoordinateSearch = async () => {
        if (!coordinates.lat || !coordinates.lng) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            const data = await response.json();
            handleLocationSelect({
                lat: coordinates.lat,
                lon: coordinates.lng,
                display_name: data.display_name,
                address: data.address
            });
        } catch (error) {
            console.error('Error searching coordinates:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle coordinate change
    const handleCoordinateChange = (e) => {
        const { name, value } = e.target;
        // Only allow numbers and decimal point
        if (!/^-?\d*\.?\d*$/.test(value)) return;

        setCoordinates(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        // Always admin: set from outletContext
        setRestaurant(business);
        setFormData({
            ...business,
            subdomain: business?.subdomain || '',
        });
        if (business?.images?.profileImage) {
            setImagePreview(business.images.profileImage);
        }
        setLoading(false);
    }, [business]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Only send changed fields
            const changedData = {};
            Object.keys(formData).forEach(key => {
                if (JSON.stringify(formData[key]) !== JSON.stringify(restaurant[key])) {
                    changedData[key] = formData[key];
                }
            });
            if (imagePreview && imagePreview !== restaurant.images?.profileImage) {
                changedData.images = {
                    profileImage: imagePreview
                };
            }
            if (Object.keys(changedData).length === 0) {
                toast.info('No changes to save');
                setIsEditing(false);
                return;
            }
            const response = await axios.patch(`${API_URL}/api/restaurants/admin/profile-by-owner`, changedData, { params: { ownerId } });
            if (response.data && response.data._id) {
                setRestaurant(prev => ({ ...prev, ...response.data }));
                setFormData(prev => ({ ...prev, ...response.data }));
                if (response.data.images?.profileImage) {
                    setImagePreview(response.data.images.profileImage);
                }
            }
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            // Check for duplicate subdomain error
            const errMsg = error.response?.data?.error || error.response?.data?.message || '';
            if (errMsg.includes('duplicate key error') && errMsg.includes('subdomain')) {
                toast.error('Subdomain already exists');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        }
    };

    const handleEditTime = (day, slot) => {
        setEditingDay(day);
        setEditingTimes({
            openTime: slot.openTime,
            closeTime: slot.closeTime
        });
    };

    const handleSaveTime = () => {
        if (editingDay) {
            setFormData(prev => ({
                ...prev,
                operatingHours: {
                    ...prev.operatingHours,
                    timeSlots: {
                        ...prev.operatingHours.timeSlots,
                        [editingDay]: {
                            ...prev.operatingHours.timeSlots[editingDay],
                            openTime: editingTimes.openTime,
                            closeTime: editingTimes.closeTime
                        }
                    }
                }
            }));
            setEditingDay(null);
        }
    };

    if (!user) {
        return <div>Please login to view profile</div>;
    }

    return (
        <div className="container-fluid px-0">
            <div className="col-lg-12 ms-auto" style={{ marginTop: '0px' }}>
                <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white py-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Business Profile</h5>
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={() => {
                                            setIsEditing(!isEditing);
                                            if (!imagePreview && restaurant?.images?.profileImage) {
                                                setImagePreview(restaurant.images.profileImage);
                                            }
                                        }}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary mb-3" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <h6 className="text-muted">Loading profile information...</h6>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                        <h6 className="text-danger mb-2">{error}</h6>
                                        <p className="text-muted small">Please try refreshing the page</p>
                                    </div>
                                ) : isEditing ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            {/* Restaurant Image Section */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Business Image</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center justify-content-center"
                                                                    style={{ height: '200px', border: '2px dashed #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                                                                    {imagePreview ? (
                                                                        <img
                                                                            src={imagePreview}
                                                                            alt="Restaurant"
                                                                            className="img-fluid"
                                                                            style={{
                                                                                maxHeight: '100%',
                                                                                width: '100%',
                                                                                objectFit: 'cover'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <ImageIcon size={48} className="text-muted mb-2" />
                                                                            <p className="mb-0">Upload Business Image</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    className="form-control mt-3"
                                                                    accept="image/*"
                                                                    onChange={handleImageUpload}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Basic Info Section */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Basic Information</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Business Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="restaurantName"
                                                            value={formData.restaurantName}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Owner Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="ownerName"
                                                            value={formData.ownerName}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Service Type</label>
                                                        <select
                                                            className="form-select"
                                                            name="serviceType"
                                                            value={formData.serviceType}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select Service Type</option>
                                                            <option value="both">Both</option>
                                                            <option value="delivery">Delivery</option>
                                                            <option value="pickup">Pickup</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Subdomain</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="subdomain"
                                                            value={formData.subdomain}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter unique subdomain"
                                                        />
                                                        {formData.subdomain && (
                                                            <div className="form-text">
                                                                You can access your business at: <strong>{formData.subdomain}.shopatb2b.com</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label fw-medium">Description <span className="text-muted">(max 100 characters)</span></label>
                                                        <textarea
                                                            className="form-control"
                                                            name="description"
                                                            value={formData.description || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="Best business in Hyderabad or varieties or specials etc..."
                                                            rows="3"
                                                            maxLength={100}
                                                        />
                                                        <small className="text-muted">
                                                            {formData.description ? `${formData.description.length}/100 characters` : '0/100 characters'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Operating Hours Section */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Operating Hours</h6>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row g-3">
                                                            <div className="col-12 mb-3">
                                                                <div className="alert alert-info">
                                                                    <Clock size={18} className="me-2" />
                                                                    Set your default operating hours. These will apply to all days you mark as open.
                                                                    You can customize individual day timings directly.
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label">Default Opening Time</label>
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    name="operatingHours.defaultOpenTime"
                                                                    value={formData.operatingHours?.defaultOpenTime || '09:00'}
                                                                    onChange={(e) => {
                                                                        const newTime = e.target.value;
                                                                        setFormData(prev => {
                                                                            const newTimeSlots = {};
                                                                            Object.entries(prev.operatingHours.timeSlots).forEach(([day, slot]) => {
                                                                                newTimeSlots[day] = {
                                                                                    ...slot,
                                                                                    openTime: slot.isOpen ? newTime : slot.openTime
                                                                                };
                                                                            });
                                                                            return {
                                                                                ...prev,
                                                                                operatingHours: {
                                                                                    ...prev.operatingHours,
                                                                                    defaultOpenTime: newTime,
                                                                                    timeSlots: newTimeSlots
                                                                                }
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label">Default Closing Time</label>
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    name="operatingHours.defaultCloseTime"
                                                                    value={formData.operatingHours?.defaultCloseTime || '22:00'}
                                                                    onChange={(e) => {
                                                                        const newTime = e.target.value;
                                                                        setFormData(prev => {
                                                                            const newTimeSlots = {};
                                                                            Object.entries(prev.operatingHours.timeSlots).forEach(([day, slot]) => {
                                                                                newTimeSlots[day] = {
                                                                                    ...slot,
                                                                                    closeTime: slot.isOpen ? newTime : slot.closeTime
                                                                                };
                                                                            });
                                                                            return {
                                                                                ...prev,
                                                                                operatingHours: {
                                                                                    ...prev.operatingHours,
                                                                                    defaultCloseTime: newTime,
                                                                                    timeSlots: newTimeSlots
                                                                                }
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="col-12">
                                                                <div className="row g-2">
                                                                    {Object.entries(formData.operatingHours.timeSlots).map(([day, slot]) => (
                                                                        <div key={day} className="col-md-6 col-lg-4">
                                                                            <div className="card h-100">
                                                                                <div className="card-body">
                                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                        <div className="form-check form-switch">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                className="form-check-input"
                                                                                                checked={slot.isOpen}
                                                                                                onChange={(e) => {
                                                                                                    setFormData(prev => ({
                                                                                                        ...prev,
                                                                                                        operatingHours: {
                                                                                                            ...prev.operatingHours,
                                                                                                            timeSlots: {
                                                                                                                ...prev.operatingHours.timeSlots,
                                                                                                                [day]: {
                                                                                                                    ...slot,
                                                                                                                    isOpen: e.target.checked,
                                                                                                                    openTime: e.target.checked ? prev.operatingHours.defaultOpenTime : slot.openTime,
                                                                                                                    closeTime: e.target.checked ? prev.operatingHours.defaultCloseTime : slot.closeTime
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }));
                                                                                                }}
                                                                                            />
                                                                                            <label className="form-check-label text-capitalize fw-medium">{day}</label>
                                                                                        </div>
                                                                                    </div>
                                                                                    {slot.isOpen ? (
                                                                                        <div className="row g-2">
                                                                                            <div className="col-6">
                                                                                                <label className="form-label small">Opening Time</label>
                                                                                                <input
                                                                                                    type="time"
                                                                                                    className="form-control form-control-sm"
                                                                                                    value={slot.openTime}
                                                                                                    onChange={(e) => {
                                                                                                        setFormData(prev => ({
                                                                                                            ...prev,
                                                                                                            operatingHours: {
                                                                                                                ...prev.operatingHours,
                                                                                                                timeSlots: {
                                                                                                                    ...prev.operatingHours.timeSlots,
                                                                                                                    [day]: {
                                                                                                                        ...slot,
                                                                                                                        openTime: e.target.value
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }));
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="col-6">
                                                                                                <label className="form-label small">Closing Time</label>
                                                                                                <input
                                                                                                    type="time"
                                                                                                    className="form-control form-control-sm"
                                                                                                    value={slot.closeTime}
                                                                                                    onChange={(e) => {
                                                                                                        setFormData(prev => ({
                                                                                                            ...prev,
                                                                                                            operatingHours: {
                                                                                                                ...prev.operatingHours,
                                                                                                                timeSlots: {
                                                                                                                    ...prev.operatingHours.timeSlots,
                                                                                                                    [day]: {
                                                                                                                        ...slot,
                                                                                                                        closeTime: e.target.value
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }));
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="text-danger small">
                                                                                            Business Closed
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location Search and Map Section */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Location</h6>
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <div className="input-group">
                                                            <span className="input-group-text bg-white">
                                                                <Search size={18} className="text-muted" />
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={searchQuery}
                                                                onChange={handleSearchChange}
                                                                placeholder="Search for a location or click on the map to set your location..."
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onClick={() => setIsCoordinateMode(!isCoordinateMode)}
                                                            >
                                                                {isCoordinateMode ? 'Hide Coordinates' : 'Show Coordinates'}
                                                            </button>
                                                        </div>
                                                        {isSearching && (
                                                            <div className="mt-2">
                                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <span className="ms-2">Searching...</span>
                                                            </div>
                                                        )}
                                                        {searchResults.length > 0 && (
                                                            <div className="list-group mt-2">
                                                                {searchResults.map((result, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                                                        onClick={() => handleLocationSelect(result)}
                                                                    >
                                                                        <MapPin size={16} className="me-2 text-primary" />
                                                                        {result.display_name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isCoordinateMode && (
                                                        <div className="col-12">
                                                            <div className="card">
                                                                <div className="card-body">
                                                                    <div className="row g-2">
                                                                        <div className="col-md-6">
                                                                            <label className="form-label">Latitude</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="lat"
                                                                                value={coordinates.lat}
                                                                                onChange={handleCoordinateChange}
                                                                                placeholder="Enter latitude"
                                                                            />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <label className="form-label">Longitude</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="lng"
                                                                                value={coordinates.lng}
                                                                                onChange={handleCoordinateChange}
                                                                                placeholder="Enter longitude"
                                                                            />
                                                                        </div>
                                                                        <div className="col-12">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-secondary"
                                                                                onClick={handleCoordinateSearch}
                                                                                disabled={!coordinates.lat || !coordinates.lng}
                                                                            >
                                                                                Search Coordinates
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="col-12">
                                                        <div className="card">
                                                            <div className="card-body p-0">
                                                                <div className="map-container" style={{ height: '400px', width: '100%' }}>
                                                                    <MapContainer
                                                                        center={mapCenter}
                                                                        zoom={13}
                                                                        style={{ height: '100%', width: '100%' }}
                                                                        onClick={(e) => {
                                                                            const { lat, lng } = e.latlng;
                                                                            // Reverse geocode the clicked location
                                                                            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                                                                                .then(response => response.json())
                                                                                .then(data => {
                                                                                    setSelectedLocation({
                                                                                        lat: lat.toString(),
                                                                                        lon: lng.toString(),
                                                                                        display_name: data.display_name,
                                                                                        address: data.address
                                                                                    });
                                                                                    setMapCenter([lat, lng]);
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        address: {
                                                                                            ...prev.address,
                                                                                            streetAddress: data.address?.road || data.address?.pedestrian || '',
                                                                                            city: data.address?.city || data.address?.state_district || data.address?.state || '',
                                                                                            state: data.address?.state || '',
                                                                                            country: data.address?.country || 'india',
                                                                                            pinCode: data.address?.pincode || data.address?.pinCode || data.address?.postcode || ''
                                                                                        },
                                                                                        location: {
                                                                                            lat: parseFloat(lat),
                                                                                            lng: parseFloat(lng)
                                                                                        }
                                                                                    }));
                                                                                    setSearchQuery(data.display_name);
                                                                                })
                                                                                .catch(error => console.error('Error reverse geocoding:', error));
                                                                        }}
                                                                    >
                                                                        <TileLayer
                                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                                        />
                                                                        <MapComponent />
                                                                    </MapContainer>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {selectedLocation && (
                                                            <div className="mt-2">
                                                                <small className="text-muted">
                                                                    Selected Location: {selectedLocation.display_name}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Fields - Now auto-filled based on location */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Address Details</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Street Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.streetAddress"
                                                            value={formData.address.streetAddress}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">City</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.city"
                                                            value={formData.address.city}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">State</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.state"
                                                            value={formData.address.state}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Country</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.country"
                                                            value={formData.address.country}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Pin Code</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.pinCode"
                                                            value={formData.address.pinCode}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Fields */}
                                            <div className="col-12">
                                                <h6 className="fw-medium mb-3">Contact Information</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-3">
                                                        <label className="form-label">Primary Phone</label>
                                                        <input type="text" className="form-control" name="contact.primaryPhone" value={formData.contact.primaryPhone} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">WhatsApp Number</label>
                                                        <input type="text" className="form-control" name="contact.whatsappNumber" value={formData.contact.whatsappNumber} onChange={handleInputChange} disabled={formData.sameAsOwnerPhone} />
                                                    </div>
                                                    <div className="col-md-3 d-flex align-items-end">
                                                        <div className="form-check">
                                                            <input type="checkbox" className="form-check-input" id="sameAsPrimaryPhone" name="sameAsOwnerPhone" checked={formData.sameAsOwnerPhone} onChange={e => {
                                                                const checked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    sameAsOwnerPhone: checked,
                                                                    contact: {
                                                                        ...prev.contact,
                                                                        whatsappNumber: checked ? prev.contact.primaryPhone : ''
                                                                    }
                                                                }));
                                                            }} />
                                                            <label className="form-check-label ms-2" htmlFor="sameAsPrimaryPhone">Same as Primary Phone</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Email</label>
                                                        <input type="email" className="form-control" name="contact.email" value={formData.contact.email} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Website</label>
                                                        <input type="text" className="form-control" name="contact.website" value={formData.contact.website} onChange={handleInputChange} />
                                                    </div>
                                                    {/* Image Uploads (except profileImage) */}
                                                    <div className="col-md-3">
                                                        <label className="form-label">PAN Card Image</label>
                                                        <input type="file" className="form-control" accept="image/*" onChange={e => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        images: {
                                                                            ...prev.images,
                                                                            panCardImage: reader.result
                                                                        }
                                                                    }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
                                                        {formData.images.panCardImage && <img src={formData.images.panCardImage} alt="PAN Card" className="img-fluid mt-2" style={{maxHeight: 80}} />}
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">GST Image</label>
                                                        <input type="file" className="form-control" accept="image/*" onChange={e => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        images: {
                                                                            ...prev.images,
                                                                            gstImage: reader.result
                                                                        }
                                                                    }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
                                                        {formData.images.gstImage && <img src={formData.images.gstImage} alt="GST" className="img-fluid mt-2" style={{maxHeight: 80}} />}
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">FSSAI Image</label>
                                                        <input type="file" className="form-control" accept="image/*" onChange={e => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        images: {
                                                                            ...prev.images,
                                                                            fssaiImage: reader.result
                                                                        }
                                                                    }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
                                                        {formData.images.fssaiImage && <img src={formData.images.fssaiImage} alt="FSSAI" className="img-fluid mt-2" style={{maxHeight: 80}} />}
                                                    </div>
                                                    {/* PAN Details Fields */}
                                                    <div className="col-md-3">
                                                        <label className="form-label">PAN Number</label>
                                                        <input type="text" className="form-control" name="panDetails.panNumber" value={formData.panDetails.panNumber} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Name on PAN</label>
                                                        <input type="text" className="form-control" name="panDetails.name" value={formData.panDetails.name} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Date of Birth</label>
                                                        <input type="date" className="form-control" name="panDetails.dateOfBirth" value={formData.panDetails.dateOfBirth} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">PAN Address</label>
                                                        <input type="text" className="form-control" name="panDetails.address" value={formData.panDetails.address} onChange={handleInputChange} />
                                                    </div>
                                                    {/* Other Fields */}
                                                    <div className="col-md-3">
                                                        <label className="form-label">WhatsApp Updates</label>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input ms-2"
                                                            name="whatsappUpdates"
                                                            checked={formData.whatsappUpdates}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                            <option value="draft">Draft</option>
                                                            <option value="review">Review</option>
                                                            <option value="published">Published</option>
                                                            <option value="rejected">Rejected</option>
                                                            <option value="disabled">Disabled</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Category</label>
                                                        <select className="form-select" name="category" value={formData.category} onChange={handleInputChange}>
                                                            <option value="restaurant">Restaurant</option>
                                                            <option value="grocery">Grocery</option>
                                                            <option value="pharmacy">Pharmacy</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end mt-4">
                                            <button type="submit" className="btn btn-primary px-4">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="row g-3">
                                        {/* Restaurant Image Display */}
                                        <div className="col-12 mb-4">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="position-relative" style={{ width: '200px', height: '200px' }}>
                                                        {restaurant?.images?.profileImage ? (
                                                            <img
                                                                src={restaurant.images.profileImage}
                                                                alt="Restaurant"
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    border: '4px solid #fff',
                                                                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    border: '4px solid #fff',
                                                                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                                                                }}>
                                                                <div className="text-center">
                                                                    <ImageIcon size={64} className="text-muted mb-2" />
                                                                    <p className="mb-0 text-muted small">No image</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-9">
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Business Name</h6>
                                                            <p className="mb-0">{restaurant?.restaurantName}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Owner Name</h6>
                                                            <p className="mb-0">{restaurant?.ownerName}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Service Type</h6>
                                                            <p className="mb-0">{restaurant?.serviceType}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Subdomain</h6>
                                                            <p className="mb-0">{restaurant?.subdomain || 'Not set'}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Description</h6>
                                                            <p className="mb-0">{restaurant?.description || 'Not provided'}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Primary Phone</h6>
                                                            <p className="mb-0">{restaurant?.contact?.primaryPhone}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">WhatsApp Number</h6>
                                                            <p className="mb-0">{restaurant?.contact?.whatsappNumber}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Email</h6>
                                                            <p className="mb-0">{restaurant?.contact?.email}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-muted mb-2 fw-medium">Website</h6>
                                                            <p className="mb-0">{restaurant?.contact?.website || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <h6 className="text-muted mb-2 fw-medium">Address</h6>
                                            <p className="mb-0">
                                                {restaurant?.address?.streetAddress && `${restaurant.address.streetAddress}, `}
                                                {restaurant?.address?.city && `${restaurant.address.city}, `}
                                                {restaurant?.address?.state && `${restaurant.address.state}, `}
                                                {restaurant?.address?.country && `${restaurant.address.country}, `}
                                                {restaurant?.address?.pinCode}
                                            </p>
                                        </div>
                                        {restaurant?.location && (
                                            <div className="col-12">
                                                <h6 className="text-muted mb-2 fw-medium">Location</h6>
                                                <div className="map-container" style={{ height: '400px', width: '100%' }}>
                                                    <MapContainer
                                                        center={[restaurant.location.lat, restaurant.location.lng]}
                                                        zoom={13}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        />
                                                        <Marker
                                                            position={[restaurant.location.lat, restaurant.location.lng]}
                                                            icon={customIcon}
                                                        />
                                                    </MapContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {editingDay && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit {editingDay.charAt(0).toUpperCase() + editingDay.slice(1)} Hours</h5>
                                <button type="button" className="btn-close" onClick={() => setEditingDay(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Opening Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={editingTimes.openTime}
                                            onChange={(e) => setEditingTimes(prev => ({ ...prev, openTime: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Closing Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={editingTimes.closeTime}
                                            onChange={(e) => setEditingTimes(prev => ({ ...prev, closeTime: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingDay(null)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveTime}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessProfile;

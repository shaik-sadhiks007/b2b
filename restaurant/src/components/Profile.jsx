import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Search, MapPin, Clock, Image as ImageIcon, CloudCog } from 'lucide-react';
import { API_URL } from '../api/api';

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Profile = () => {
    const { token } = useContext(AuthContext);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
    const [isSearching, setIsSearching] = useState(false);
    const [isCoordinateMode, setIsCoordinateMode] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        serviceType: '',
        contact: {
            primaryPhone: '',
            whatsappNumber: '',
            email: '',
            website: ''
        },
        address: {
            shopNo: '',
            floor: '',
            locality: '',
            landmark: '',
            city: '',
            fullAddress: ''
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
        }
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
                fullAddress: result.display_name,
                locality: address.suburb || address.neighbourhood || '',
                city: address.village || address.county || '',
                landmark: address.amenity || '',
                shopNo: address.house_number || '',
                floor: ''
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
                            fullAddress: data.display_name,
                            locality: data.address?.suburb || data.address?.neighbourhood || '',
                            city: data.address?.city || data.address?.state || ''
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
        fetchRestaurantProfile();
    }, [token]);

    const fetchRestaurantProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/restaurants/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRestaurant(response.data);
            
            // Set image preview if profile image exists
            if (response.data.images?.profileImage) {
                setImagePreview(response.data.images.profileImage);
            }

            console.log(response.data.operatingHours,"response hours");

            setFormData({
                restaurantName: response.data.restaurantName || '',
                ownerName: response.data.ownerName || '',
                serviceType: response.data.serviceType || '',
                contact: response.data.contact || {
                    primaryPhone: '',
                    whatsappNumber: '',
                    email: '',
                    website: ''
                },
                address: response.data.address || {
                    shopNo: '',
                    floor: '',
                    locality: '',
                    landmark: '',
                    city: '',
                    fullAddress: ''
                },
                location: response.data.location || { lat: 0, lng: 0 },
                operatingHours: formatOperatingHours(response.data.operatingHours)
            });

            // Set location if available
            if (response.data.location && response.data.location.lat && response.data.location.lng) {
                setMapCenter([response.data.location.lat, response.data.location.lng]);
                setSelectedLocation({
                    lat: response.data.location.lat.toString(),
                    lon: response.data.location.lng.toString(),
                    display_name: response.data.address?.fullAddress || '',
                    address: {
                        suburb: response.data.address?.locality || '',
                        city: response.data.address?.city || ''
                    }
                });
                if (response.data.address?.fullAddress) {
                    setSearchQuery(response.data.address.fullAddress);
                }
            }

            setLoading(false);
        } catch (error) {
            setError('Error fetching restaurant profile');
            setLoading(false);
            toast.error('Failed to load restaurant profile');
        }
    };


    console.log(formData.operatingHours,"hours");
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create an object to store only changed fields
            const changedData = {};

            // Compare each field with the original restaurant data
            Object.keys(formData).forEach(key => {
                if (JSON.stringify(formData[key]) !== JSON.stringify(restaurant[key])) {
                    changedData[key] = formData[key];
                }
            });

            // Add image if it's changed
            if (imagePreview && imagePreview !== restaurant.images?.profileImage) {
                changedData.images = {
                    profileImage: imagePreview
                };
            }

            // Only proceed if there are changes
            if (Object.keys(changedData).length === 0) {
                toast.info('No changes to save');
                setIsEditing(false);
                return;
            }
            
            const response = await axios.patch(`${API_URL}/api/restaurants/profile`, changedData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update the restaurant state with the response
            setRestaurant(prev => ({
                ...prev,
                ...response.data
            }));
            
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <Navbar />
            <div className="row" style={{ marginTop: '48px' }}>
                <div className="d-none d-lg-block col-lg-2 px-0">
                    <Sidebar />
                </div>
                <div className="col-12 col-lg-10 px-0 ms-auto">
                    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold">Business Profile</h5>
                                        <button 
                                            className="btn btn-primary px-4"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    {isEditing ? (
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
                                                                <option value="BOTH">BOTH</option>
                                                                <option value="DELIVERY">Delivery</option>
                                                                <option value="PICKUP">Pickup</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Operating Hours Section */}
                                                <div className="col-12">
                                                    <h6 className="fw-medium mb-3">Operating Hours</h6>
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div className="row g-3">
                                                                <div className="col-md-6">
                                                                    <label className="form-label">Default Opening Time</label>
                                                                    <input
                                                                        type="time"
                                                                        className="form-control"
                                                                        name="operatingHours.defaultOpenTime"
                                                                        value={formData.operatingHours?.defaultOpenTime || '09:00'}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label className="form-label">Default Closing Time</label>
                                                                    <input
                                                                        type="time"
                                                                        className="form-control"
                                                                        name="operatingHours.defaultCloseTime"
                                                                        value={formData.operatingHours?.defaultCloseTime}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                                {Object.entries(formData.operatingHours.timeSlots).map(([day, slot]) => (
                                                                    <div key={day} className="col-md-6">
                                                                        <div className="card">
                                                                            <div className="card-body">
                                                                                <div className="form-check mb-2">
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
                                                                                    <label className="form-check-label text-capitalize">{day}</label>
                                                                                </div>
                                                                                <div className="row g-2">
                                                                                    <div className="col-6">
                                                                                        <input
                                                                                            type="time"
                                                                                            className="form-control"
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
                                                                                            disabled={!slot.isOpen}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="col-6">
                                                                                        <input
                                                                                            type="time"
                                                                                            className="form-control"
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
                                                                                            disabled={!slot.isOpen}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
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
                                                                                                fullAddress: data.display_name,
                                                                                                locality: data.address?.suburb || data.address?.neighbourhood || '',
                                                                                                city: data.address?.city || data.address?.state || ''
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
                                                            <label className="form-label">Shop No</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="address.shopNo"
                                                                value={formData.address.shopNo}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Floor</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="address.floor"
                                                                value={formData.address.floor}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Locality</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="address.locality"
                                                                value={formData.address.locality}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Landmark</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="address.landmark"
                                                                value={formData.address.landmark}
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
                                                    {restaurant?.address?.shopNo && `${restaurant.address.shopNo}, `}
                                                    {restaurant?.address?.floor && `${restaurant.address.floor}, `}
                                                    {restaurant?.address?.locality && `${restaurant.address.locality}, `}
                                                    {restaurant?.address?.landmark && `${restaurant.address.landmark}, `}
                                                    {restaurant?.address?.city && `${restaurant.address.city}, `}
                                                    {restaurant?.address?.fullAddress}
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
            </div>
        </div>
    );
};

export default Profile;
    
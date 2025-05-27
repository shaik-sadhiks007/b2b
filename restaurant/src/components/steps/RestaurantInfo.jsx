import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { toast } from 'react-toastify';

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapComponent = ({ selectedLocation, setSelectedLocation, setMapCenter, handleChange }) => {
    const map = useMap();
    
    React.useEffect(() => {
        if (selectedLocation) {
            const center = [parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)];
            map.setView(center, 15);
        }
    }, [selectedLocation, map]);

    const handleMarkerDrag = (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
            .then(response => response.json())
            .then(data => {
                const newLocation = {
                    ...selectedLocation,
                    lat: position.lat.toString(),
                    lon: position.lng.toString(),
                    display_name: data.display_name,
                    address: data.address
                };
                setSelectedLocation(newLocation);
                setMapCenter([position.lat, position.lng]);
                
                // Update form data using handleChange
                handleChange({
                    target: {
                        name: 'address.locality',
                        value: data.address?.suburb || data.address?.neighbourhood || ''
                    }
                });
                handleChange({
                    target: {
                        name: 'address.city',
                        value: data.address?.city || data.address?.state || ''
                    }
                });
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

const RestaurantInfo = ({
    formData,
    handleChange,
    searchQuery,
    handleSearchChange,
    isSearching,
    searchResults,
    handleLocationSelect,
    selectedLocation,
    mapCenter,
    setMapCenter,
    setSelectedLocation,
    isCoordinateMode,
    setIsCoordinateMode,
    coordinates,
    handleCoordinateChange,
    handleCoordinateSearch,
    isFormValid,
    onNext
}) => {
    const validatePhoneNumber = (phone) => {
        // Remove any non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');
        // Check if the number is 10 digits
        return digitsOnly.length === 10;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        const errors = [];
        if (!formData.restaurantName) errors.push('Business Name is required');
        if (!formData.ownerName) errors.push('Owner Name is required');
        
        // Description validation
        if (formData.description && formData.description.length > 100) {
            errors.push('Description should not exceed 100 characters');
        }
        
        // Phone number validation
        if (!formData.contact?.primaryPhone) {
            errors.push('Primary Phone Number is required');
        } else if (!validatePhoneNumber(formData.contact.primaryPhone)) {
            errors.push('Primary Phone Number must be 10 digits');
        }

        // WhatsApp number validation (optional)
        if (formData.contact?.whatsappNumber && !validatePhoneNumber(formData.contact.whatsappNumber)) {
            errors.push('WhatsApp Number must be 10 digits');
        }

        if (!formData.address?.shopNo) errors.push('Shop No. / Building No. is required');
        if (!formData.address?.locality) errors.push('Area / Sector / Locality is required');
        if (!selectedLocation) errors.push('Please select a location on the map');


        console.log(errors,"errors")
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        // Create the step data with the exact structure needed
        const stepData = {
            restaurantName: formData.restaurantName,
            serviceType: formData.serviceType,
            ownerName: formData.ownerName,
            description: formData.description,
            sameAsOwnerPhone: formData.sameAsOwnerPhone,
            whatsappUpdates: formData.whatsappUpdates,
            contact: {
                primaryPhone: formData.contact?.primaryPhone || '',
                whatsappNumber: formData.contact?.whatsappNumber || '',
                email: formData.contact?.email || '',
                website: formData.contact?.website || ''
            },
            address: {
                shopNo: formData.address?.shopNo || '',
                floor: formData.address?.floor || '',
                locality: formData.address?.locality || '',
                landmark: formData.address?.landmark || '',
                city: formData.address?.city || '',
                fullAddress: selectedLocation ? selectedLocation.display_name : ''
            },
            location: {
                lat: selectedLocation ? parseFloat(selectedLocation.lat) : null,
                lng: selectedLocation ? parseFloat(selectedLocation.lon) : null
            }
        };

        onNext(stepData);
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        // Remove any non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        // Limit to 10 digits
        const truncatedValue = digitsOnly.slice(0, 10);
        
        handleChange({
            target: {
                name,
                value: truncatedValue
            }
        });
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        handleChange({
            target: {
                name: `address.${name}`,
                value: value
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="restaurant-info-form">
            <div className="mb-3">
                <label className="form-label">Business Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Description <span className="text-muted">(Optional, max 100 characters)</span></label>
                <textarea
                    className="form-control"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Best business in Hyderabad or varieties or specials etc..."
                    rows="3"
                    maxLength={100}
                />
                <small className="text-muted">
                    {formData.description ? `${formData.description.length}/100 characters` : '0/100 characters'}
                </small>
            </div>

            <div className="mb-3">
                <label className="form-label">Owner Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <input
                    type="email"
                    className="form-control"
                    name="contact.email"
                    value={formData.contact?.email || ''}
                    onChange={handleChange}
                    required
                    disabled
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Primary Phone Number <span className="text-danger">*</span></label>
                <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                        type="tel"
                        className="form-control"
                        name="contact.primaryPhone"
                        value={formData.contact?.primaryPhone || ''}
                        onChange={handlePhoneChange}
                        placeholder="Enter 10 digit mobile number"
                        maxLength="10"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">WhatsApp Number <span className="text-muted">(Optional)</span></label>
                <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                        type="tel"
                        className="form-control"
                        name="contact.whatsappNumber"
                        value={formData.contact?.whatsappNumber || ''}
                        onChange={handlePhoneChange}
                        placeholder="Enter 10 digit mobile number"
                        maxLength="10"
                    />
                </div>
            </div>

            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="sameAsOwnerPhone"
                        name="sameAsOwnerPhone"
                        checked={formData.sameAsOwnerPhone}
                        onChange={(e) => {
                            handleChange(e);
                            if (e.target.checked) {
                                handleChange({
                                    target: {
                                        name: 'contact.whatsappNumber',
                                        value: formData.contact?.primaryPhone
                                    }
                                });
                            }
                        }}
                    />
                    <label className="form-check-label" htmlFor="sameAsOwnerPhone">
                        Same as Primary Phone
                    </label>
                </div>
            </div>

            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="whatsappUpdates"
                        name="whatsappUpdates"
                        checked={formData.whatsappUpdates}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="whatsappUpdates">
                        Receive updates on WhatsApp
                    </label>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Website <span className="text-muted">(Optional)</span></label>
                <input
                    type="url"
                    className="form-control"
                    name="contact.website"
                    value={formData.contact?.website || ''}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Shop No. / Building No. <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="shopNo"
                    value={formData.address?.shopNo || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Floor / Tower <span className="text-muted">(Optional)</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="floor"
                    value={formData.address?.floor || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Area / Sector / Locality <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="locality"
                    value={formData.address?.locality || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Landmark <span className="text-muted">(Optional)</span></label>
                <input
                    type="text"
                    className="form-control"
                    name="landmark"
                    value={formData.address?.landmark || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Search Location <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for your location..."
                />
                {isSearching && <div className="spinner-border spinner-border-sm" role="status" />}
                {searchResults.length > 0 && (
                    <ul className="list-group mt-2">
                        {searchResults.map((result) => (
                            <li
                                key={result.place_id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handleLocationSelect(result)}
                            >
                                {result.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="coordinateMode"
                        checked={isCoordinateMode}
                        onChange={(e) => setIsCoordinateMode(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="coordinateMode">
                        Enter Coordinates Manually
                    </label>
                </div>
            </div>

            {isCoordinateMode && (
                <div className="row mb-3">
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Latitude"
                            name="lat"
                            value={coordinates.lat}
                            onChange={handleCoordinateChange}
                        />
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Longitude"
                            name="lng"
                            value={coordinates.lng}
                            onChange={handleCoordinateChange}
                        />
                    </div>
                    <div className="col-auto">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleCoordinateSearch}
                        >
                            Search
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-3" style={{ height: '400px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapComponent
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        setMapCenter={setMapCenter}
                        handleChange={handleChange}
                    />
                </MapContainer>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
            >
                Next
            </button>
        </form>
    );
};

export default RestaurantInfo; 
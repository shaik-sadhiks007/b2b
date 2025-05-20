import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Ensure address object exists
        const address = formData.address || {};

        // Create the step data with the exact structure needed
        const stepData = {
            restaurantName: formData.restaurantName,
            serviceType: formData.serviceType,
            ownerName: formData.ownerName,
            sameAsOwnerPhone: formData.sameAsOwnerPhone,
            whatsappUpdates: formData.whatsappUpdates,
            contact: {
                primaryPhone: formData.contact?.primaryPhone || '',
                whatsappNumber: formData.contact?.whatsappNumber || '',
                email: formData.contact?.email || '',
                website: formData.contact?.website || ''
            },
            address: {
                shopNo: address.shopNo || '',
                floor: address.floor || '',
                locality: address.locality || '',
                landmark: address.landmark || '',
                city: address.city || '',
                fullAddress: selectedLocation ? selectedLocation.display_name : ''
            },
            location: {
                lat: selectedLocation ? parseFloat(selectedLocation.lat) : null,
                lng: selectedLocation ? parseFloat(selectedLocation.lon) : null
            }
        };

        onNext(stepData);
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
                <label className="form-label">Business Name</label>
                <input
                    type="text"
                    className="form-control"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Owner Name</label>
                <input
                    type="text"
                    className="form-control"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Email</label>
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
                <label className="form-label">Primary Phone Number</label>
                <input
                    type="tel"
                    className="form-control"
                    name="contact.primaryPhone"
                    value={formData.contact?.primaryPhone || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">WhatsApp Number</label>
                <input
                    type="tel"
                    className="form-control"
                    name="contact.whatsappNumber"
                    value={formData.contact?.whatsappNumber || ''}
                    onChange={handleChange}
                    required
                />
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
                <label className="form-label">Website (Optional)</label>
                <input
                    type="url"
                    className="form-control"
                    name="contact.website"
                    value={formData.contact?.website || ''}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Shop No. / Building No.</label>
                <input
                    type="text"
                    className="form-control"
                    name="shopNo"
                    value={formData.address?.shopNo || ''}
                    onChange={handleAddressChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Floor / Tower (optional)</label>
                <input
                    type="text"
                    className="form-control"
                    name="floor"
                    value={formData.address?.floor || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Area / Sector / Locality</label>
                <input
                    type="text"
                    className="form-control"
                    name="locality"
                    value={formData.address?.locality || ''}
                    onChange={handleAddressChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Landmark (optional)</label>
                <input
                    type="text"
                    className="form-control"
                    name="landmark"
                    value={formData.address?.landmark || ''}
                    onChange={handleAddressChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Search Location</label>
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
                disabled={!isFormValid}
            >
                Next
            </button>
        </form>
    );
};

export default RestaurantInfo; 
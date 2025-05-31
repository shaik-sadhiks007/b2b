import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import RestaurantInfo from '../components/steps/RestaurantInfo';
import MenuDetails from '../components/steps/MenuDetails';
import PanCardDetails from '../components/steps/PanCardDetails';
import TermsAndConditions from '../components/steps/TermsAndConditions';
import RegistrationSidebar from '../components/RegistrationSidebar';
import Header from '../components/Header';
import axios from 'axios';
import restaurantService from '../services/restaurantService';
import { AuthContext } from '../context/AuthContext';
import { CloudCog } from 'lucide-react';
import { API_URL } from '../api/api';

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

const AddRestaurant = () => {
    const location = useLocation();
    const { serviceType } = location.state || {};
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isCoordinateMode, setIsCoordinateMode] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [categorySearch, setCategorySearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [restaurantImages, setRestaurantImages] = useState([]);
    const [foodImages, setFoodImages] = useState([]);
    const [deliveryMenuImages, setDeliveryMenuImages] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        serviceType: serviceType || '',
        description : '',
        address: {
            shopNo: '',
            floor: '',
            locality: '',
            landmark: '',
            city: '',
            fullAddress: ''
        },
        contact: {
            primaryPhone: '',
            whatsappNumber: '',
            email: '',  // Initialize as empty string
            website: ''
        },
        sameAsOwnerPhone: false,
        whatsappUpdates: false,
        location: {
            lat: null,
            lng: null
        },
        category: '',
        operatingHours: {
            defaultOpenTime: '9:00',
            defaultCloseTime: '22:00',
            timeSlots: {
                monday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                tuesday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                wednesday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                thursday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                friday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                saturday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                sunday: { isOpen: false, openTime: '9:00', closeTime: '22:00' }
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
        }
    });
    // Validation state for each step
    const [stepValidation, setStepValidation] = useState({
        step1: false,
        step2: false,
        step3: false,
        step4: false
    });

    const categories = [
        { id: 'restaurant', name: 'Restaurant', icon: 'bi-building' },
        { id: 'grocery', name: 'Grocery Store', icon: 'bi-cart4' },
        { id: 'pharmacy', name: 'Pharmacy', icon: 'bi-capsule' },
        // { id: 'bakery', name: 'Bakery', icon: 'bi-cup-hot' },
        // { id: 'fruits', name: 'Fruits & Vegetables', icon: 'bi-apple' },
        // { id: 'meat', name: 'Meat & Fish', icon: 'bi-egg-fried' },
        // { id: 'dairy', name: 'Dairy Products', icon: 'bi-cup-straw' },
        // { id: 'stationery', name: 'Stationery', icon: 'bi-pencil' }
    ];

    const handleChange = (e) => {
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
        validateForm();
    };

    const validateForm = () => {
        const isValid = formData.restaurantName &&
            formData.ownerName &&
            formData.contact?.email &&
            formData.contact?.primaryPhone &&
            formData.contact?.whatsappNumber &&
            formData.address?.shopNo &&
            formData.address?.locality &&
            selectedLocation;
        setIsFormValid(isValid);
    };

    useEffect(() => {
        validateForm();
    }, [formData, selectedLocation]);

    // Add useEffect to update email when user data is loaded
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    email: user.email
                }
            }));
        }
    }, [user]);

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

    const handleLocationSelect = (result) => {
        setSelectedLocation(result);
        const newCenter = [parseFloat(result.lat), parseFloat(result.lon)];
        setMapCenter(newCenter);
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                fullAddress: result.display_name,
                locality: result?.address?.suburb || result?.address?.neighbourhood || '',
                city: result?.address?.city || result?.address?.state || ''
            },
            location: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            }
        }));
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    // Update MapComponent to handle marker updates
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

    // Add new function to handle coordinate search
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

    // Add coordinate change handler
    const handleCoordinateChange = (e) => {
        const { name, value } = e.target;
        // Only allow numbers and decimal point
        if (!/^-?\d*\.?\d*$/.test(value)) return;

        setCoordinates(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Image upload handler
    const handleImageUpload = async (file, type) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            // Use the restaurant service to upload the image
            const response = await restaurantService.uploadImage(formData);

            // Update the images object in formData
            setFormData(prev => ({
                ...prev,
                images: {
                    ...prev.images,
                    [type]: response.url
                }
            }));

            return response.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleStepSubmit = async (step) => {
        try {
            setLoading(true);
            setError(null);

            // Allow going back to any previous step
            if (step < currentStep) {
                setCurrentStep(step);
                return;
            }

            // For next step, validate current step
            if (step === currentStep + 1 || step === 5) { // Add check for step 5
                if (validateStep(currentStep)) {
                    // Prepare form data based on current step
                    const formDataToSend = new FormData();

                    switch (currentStep) {
                        case 1:
                            // Step 1: Basic Information
                            formDataToSend.append('formData', JSON.stringify({
                                restaurantName: formData.restaurantName,
                                serviceType: formData.serviceType,
                                ownerName: formData.ownerName,
                                description : formData.description,
                                sameAsOwnerPhone: formData.sameAsOwnerPhone || false,
                                whatsappUpdates: formData.whatsappUpdates || false,
                                contact: formData.contact || {
                                    primaryPhone: '',
                                    whatsappNumber: '',
                                    email: '',
                                    website: ''
                                },
                                address: formData.address || {
                                    shopNo: '',
                                    floor: '',
                                    locality: '',
                                    landmark: '',
                                    city: '',
                                    fullAddress: ''
                                },
                                location: formData.location || {
                                    lat: null,
                                    lng: null
                                },
                                operatingHours: formData.operatingHours || {
                                    defaultOpenTime: '9:00',
                                    defaultCloseTime: '22:00',
                                    timeSlots: {
                                        monday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        tuesday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        wednesday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        thursday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        friday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        saturday: { isOpen: false, openTime: '9:00', closeTime: '22:00' },
                                        sunday: { isOpen: false, openTime: '9:00', closeTime: '22:00' }
                                    }
                                }
                            }));

                            // Handle profile image
                            if (formData.images && formData.images.profileImage) {
                                if (formData.images.profileImage instanceof File) {
                                    formDataToSend.append('profileImage', formData.images.profileImage);
                                } else if (typeof formData.images.profileImage === 'string' && formData.images.profileImage.startsWith('http')) {
                                    formDataToSend.append('imageUrls.profileImage', formData.images.profileImage);
                                }
                            }
                            break;

                        case 2:
                            // Step 2: Menu & Operations

                            formDataToSend.append('formData', JSON.stringify({
                                category: formData.category || '',
                                operatingHours: {
                                    defaultOpenTime: formData.operatingHours?.defaultOpenTime || '09:00',
                                    defaultCloseTime: formData.operatingHours?.defaultCloseTime || '22:00',
                                    timeSlots: {
                                        monday: formData.operatingHours?.timeSlots?.monday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        tuesday: formData.operatingHours?.timeSlots?.tuesday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        wednesday: formData.operatingHours?.timeSlots?.wednesday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        thursday: formData.operatingHours?.timeSlots?.thursday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        friday: formData.operatingHours?.timeSlots?.friday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        saturday: formData.operatingHours?.timeSlots?.saturday || { isOpen: false, openTime: '09:00', closeTime: '22:00' },
                                        sunday: formData.operatingHours?.timeSlots?.sunday || { isOpen: false, openTime: '09:00', closeTime: '22:00' }
                                    }
                                }
                            }));
                            break;

                        case 3:
                            // Step 3: Documents
                            formDataToSend.append('formData', JSON.stringify({
                                panDetails: formData.panDetails || {
                                    panNumber: '',
                                    name: '',
                                    dateOfBirth: '',
                                    address: ''
                                },
                                images: {
                                    profileImage: formData.images?.profileImage || '',
                                    panCardImage: formData.images?.panCardImage || '',
                                    gstImage: formData.images?.gstImage || '',
                                    fssaiImage: formData.images?.fssaiImage || ''
                                }
                            }));
                            // Handle profile image
                            if (formData.images?.profileImage instanceof File) {
                                formDataToSend.append('profileImage', formData.images.profileImage);
                            }

                            // Handle PAN card image
                            if (formData.images?.panCardImage instanceof File) {
                                formDataToSend.append('panCardImage', formData.images.panCardImage);
                            }
                            break;

                        case 4:
                            // Step 4: Terms and Conditions
                            formDataToSend.append('formData', JSON.stringify({
                                termsAccepted: true,
                                status: 'review'
                            }));
                            break;
                    }

                    let restaurant;
                    if (formData._id) {
                        restaurant = await restaurantService.updateStep(formData._id, currentStep, formDataToSend);
                    } else if (!restaurantId) {
                        restaurant = await restaurantService.saveRestaurantInfo(formDataToSend);
                        setRestaurantId(restaurant._id);
                    } else {
                        restaurant = await restaurantService.updateStep(restaurantId, currentStep, formDataToSend);
                    }

                    setFormData(prev => ({
                        ...prev,
                        ...restaurant
                    }));

                    if (currentStep === 4 || step === 5) {
                        // Redirect to home page after completing step 4
                        navigate('/');
                    } else {
                        setCurrentStep(step);
                    }
                } else {
                    setError('Please complete all required fields before proceeding to the next step.');
                }
            }
        } catch (error) {
            console.error('Error saving step:', error);
            setError(error.message || 'Failed to save step data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);

        setFormData(prev => ({
            ...prev,
            category: category.id
        }));
        setCategorySearch('');
        setIsMenuOpen(false);
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            deliveryTiming: {
                ...prev.deliveryTiming,
                selectedDays: prev.deliveryTiming.selectedDays.includes(day)
                    ? prev.deliveryTiming.selectedDays.filter(d => d !== day)
                    : [...prev.deliveryTiming.selectedDays, day]
            }
        }));
    };

    const handleTimeChange = (day, type, value) => {
        setFormData(prev => ({
            ...prev,
            deliveryTiming: {
                ...prev.deliveryTiming,
                timeSlots: {
                    ...prev.deliveryTiming.timeSlots,
                    [day]: {
                        ...prev.deliveryTiming.timeSlots[day],
                        [type]: value
                    }
                }
            }
        }));
    };

    const handleCopyToAll = () => {
        const defaultTiming = formData.deliveryTiming.timeSlots.default;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        setFormData(prev => ({
            ...prev,
            deliveryTiming: {
                ...prev.deliveryTiming,
                timeSlots: {
                    ...prev.deliveryTiming.timeSlots,
                    ...days.reduce((acc, day) => ({
                        ...acc,
                        [day]: { ...defaultTiming }
                    }), {})
                }
            }
        }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.restaurantName &&
                    formData.ownerName &&
                    formData.contact?.email &&
                    formData.contact?.primaryPhone &&
                    formData.address?.shopNo &&
                    formData.address?.locality &&
                    formData.location?.lat &&
                    formData.location?.lng;
            case 2:
                // Check if a category is selected and at least one day is open
                return formData.category &&
                    formData.operatingHours?.timeSlots
            case 3:
                // All fields are optional for step 3
                return true;
            case 4:
                return document.getElementById('termsCheck')?.checked;
            default:
                return false;
        }
    };

    const [operatingHours, setOperatingHours] = useState({
        defaultOpenTime: '09:00',
        defaultCloseTime: '22:00',
        monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        sunday: { isOpen: true, openTime: '09:00', closeTime: '22:00' }
    });

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <RestaurantInfo
                        formData={formData}
                        handleChange={handleChange}
                        searchQuery={searchQuery}
                        handleSearchChange={handleSearchChange}
                        isSearching={isSearching}
                        searchResults={searchResults}
                        handleLocationSelect={handleLocationSelect}
                        selectedLocation={selectedLocation}
                        mapCenter={mapCenter}
                        setMapCenter={setMapCenter}
                        setSelectedLocation={setSelectedLocation}
                        setFormData={setFormData}
                        isCoordinateMode={isCoordinateMode}
                        setIsCoordinateMode={setIsCoordinateMode}
                        coordinates={coordinates}
                        handleCoordinateChange={handleCoordinateChange}
                        handleCoordinateSearch={handleCoordinateSearch}
                        isFormValid={validateStep(1)}
                        onNext={(stepData) => {
                            // Update formData with the step data
                            setFormData(prev => ({
                                ...prev,
                                ...stepData
                            }));
                            handleStepSubmit(2);
                        }}
                    />
                );
            case 2:
                return (
                    <MenuDetails
                        formData={formData}
                        setFormData={setFormData}
                        categories={categories}
                        selectedCategory={categories.find(c => c.id === formData.category) || ''}
                        setSelectedCategory={handleCategorySelect}
                        operatingHours={operatingHours}
                        setOperatingHours={setOperatingHours}
                        isFormValid={validateStep(2)}
                        onNext={(stepData) => {
                            // Update formData with the step data
                            setFormData(prev => ({
                                ...prev,
                                ...stepData
                            }));
                            handleStepSubmit(3);
                        }}
                    />
                );
            case 3:
                return (
                    <PanCardDetails
                        panDetails={formData.panDetails || {}}
                        formData={formData}
                        setFormData={setFormData}
                        setPanDetails={(details) => setFormData(prev => ({ ...prev, panDetails: details }))}
                        panCardImage={formData.images?.panCardImage}
                        setPanCardImage={(image) => setFormData(prev => ({ ...prev, images: { ...prev.images, panCardImage: image } }))}
                        fileInputRef={fileInputRef}
                        handleImageUpload={handleImageUpload}
                        isFormValid={validateStep(3)}
                        onNext={(stepData) => {
                            // Update formData with the step data
                            setFormData(prev => ({
                                ...prev,
                                ...stepData
                            }));
                            handleStepSubmit(4);
                        }}
                    />
                );
            case 4:
                return (
                    <TermsAndConditions
                        onSubmit={handleStepSubmit}
                        isFormValid={validateStep(4)}
                    />
                );
            default:
                return null;
        }
    };

    // Update validation state for step 1
    useEffect(() => {
        const isStep1Valid = formData.restaurantName &&
            formData.ownerName &&
            formData.contact?.email &&
            formData.contact?.primaryPhone &&
            formData.address?.shopNo &&
            formData.address?.locality &&
            formData.location?.lat &&
            formData.location?.lng;
        setStepValidation(prev => ({ ...prev, step1: isStep1Valid }));
    }, [formData.restaurantName, formData.ownerName, formData.contact, formData.address, formData.location]);

    // Update validation state for step 2
    useEffect(() => {
        const isStep2Valid = formData.category &&
            formData.operatingHours?.timeSlots &&
            Object.values(formData.operatingHours.timeSlots || {}).some(day => day.isOpen);
        setStepValidation(prev => ({ ...prev, step2: isStep2Valid }));
    }, [formData.category, formData.operatingHours]);

    // Update validation state for step 3
    useEffect(() => {
        // All fields are optional for step 3
        setStepValidation(prev => ({ ...prev, step3: true }));
    }, []);

    // Update validation state for step 4
    useEffect(() => {
        const isStep4Valid = document.getElementById('termsCheck')?.checked;
        setStepValidation(prev => ({ ...prev, step4: isStep4Valid }));
    }, []);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/restaurants`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data && response.data.length > 0) {
                    const restaurantData = response.data[0];

                    // Check if restaurant is published
                    if (restaurantData.status === 'published') {
                        navigate('/dashboard');
                        return;
                    }

                    // If restaurant is in draft, continue with the current flow
                    setFormData(restaurantData);

                    // Set current step based on the response
                    if (restaurantData.currentStep) {
                        // If currentStep is 1, directly open the second step
                        if (restaurantData.currentStep === 1) {
                            setCurrentStep(2);
                        } else {
                            setCurrentStep(restaurantData.currentStep);
                        }
                    }

                    // Set location if available
                    if (restaurantData.location && restaurantData.location.lat && restaurantData.location.lng) {
                        // Set the map center
                        setMapCenter([restaurantData.location.lat, restaurantData.location.lng]);

                        // Set the selected location for the map marker
                        setSelectedLocation({
                            lat: restaurantData.location.lat.toString(),
                            lon: restaurantData.location.lng.toString(),
                            display_name: restaurantData.address?.fullAddress || '',
                            address: {
                                suburb: restaurantData.address?.locality || '',
                                city: restaurantData.address?.city || ''
                            }
                        });

                        // Set the search query to the full address
                        if (restaurantData.address?.fullAddress) {
                            setSearchQuery(restaurantData.address.fullAddress);
                        }
                    }

                    // Set operating hours if available
                    if (restaurantData.operatingHours) {
                        setOperatingHours(restaurantData.operatingHours);
                    }

                    // Set pan details if available
                    if (restaurantData.panDetails) {
                        setFormData(prev => ({
                            ...prev,
                            panDetails: restaurantData.panDetails
                        }));
                    }

                    // Set images if available
                    if (restaurantData.images) {
                        setFormData(prev => ({
                            ...prev,
                            images: restaurantData.images
                        }));
                    }

                    // Set terms accepted if available
                    if (restaurantData.termsAccepted) {
                        setFormData(prev => ({
                            ...prev,
                            termsAccepted: restaurantData.termsAccepted
                        }));
                    }

                    // Set status if available
                    if (restaurantData.status) {
                        setFormData(prev => ({
                            ...prev,
                            status: restaurantData.status
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching restaurant data:", error);
            }
        };

        fetchRestaurant();
    }, [navigate]);

    return (
        <div className="container-fluid p-0">
            <Header />
            <div className="container mt-5 pt-5">
                <h2>Add Your Business</h2>
                <p>Selected service type: {formData.serviceType == "BOTH" ? "Both delivery and pickup" : formData.serviceType} </p>
                <div className="row">
                    <div className="col-md-3">
                        <RegistrationSidebar
                            currentStep={currentStep}
                            onStepClick={handleStepSubmit}
                        />
                    </div>
                    <div className="col-md-9 p-4">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRestaurant; 
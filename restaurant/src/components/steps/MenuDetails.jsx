import React, { useState, useEffect } from 'react';
import { FaClock, FaChevronDown, FaChevronUp, FaCheck, FaHotel, FaShoppingCart, FaPrescriptionBottleAlt, FaCoffee, FaAppleAlt, FaFish, FaGlassWhiskey, FaPencilAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../api/api';

const MenuDetails = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    formData,
    setFormData,
    isFormValid,
    onNext
}) => {
    const [showTimeSlots, setShowTimeSlots] = useState(true);
    const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
    const [subdomainStatus, setSubdomainStatus] = useState(null); // null, 'available', 'taken', 'invalid'

    // Generate default subdomain from business name
    const generateDefaultSubdomain = (businessName) => {
        if (!businessName) return '';
        return businessName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '') // Remove spaces
            .substring(0, 20); // Limit to 20 characters
    };

    // Set default subdomain when business name changes
    useEffect(() => {
        if (!formData.subdomain && formData.restaurantName) {
            const defaultSubdomain = generateDefaultSubdomain(formData.restaurantName);
            setFormData(prev => ({
                ...prev,
                subdomain: defaultSubdomain
            }));
        }
    }, [formData.restaurantName, formData.subdomain, setFormData]);

    // Check subdomain availability
    const checkSubdomainAvailability = async () => {
        if (!formData.subdomain) {
            toast.error('Please enter a subdomain first');
            return;
        }

        setIsCheckingSubdomain(true);
        setSubdomainStatus(null);

        try {
            const response = await axios.get(`${API_URL}/api/restaurants/check-subdomain`, {
                params: { subdomain: formData.subdomain }
            });

            if (response.data.available) {
                setSubdomainStatus('available');
                toast.success('Subdomain is available!');
            } else {
                setSubdomainStatus('taken');
                toast.error(response.data.message || 'Subdomain is already taken');
            }
        } catch (error) {
            console.error('Error checking subdomain:', error);
            if (error.response?.status === 400) {
                setSubdomainStatus('invalid');
                toast.error(error.response.data.message || 'Invalid subdomain format');
            } else {
                toast.error('Error checking subdomain availability');
            }
        } finally {
            setIsCheckingSubdomain(false);
        }
    };

    const getCategoryIcon = (categoryName) => {
        switch (categoryName.toLowerCase()) {
            case 'hotel/restaurant':
                return <FaHotel size={32} />;
            case 'grocery store':
                return <FaShoppingCart size={32} />;
            case 'pharmacy':
                return <FaPrescriptionBottleAlt size={32} />;
            // case 'bakery':
            //     return <FaCoffee size={32} />;
            // case 'fruits & vegetables':
            //     return <FaAppleAlt size={32} />;
            // case 'meat & fish':
            //     return <FaFish size={32} />;
            // case 'dairy products':
            //     return <FaGlassWhiskey size={32} />;
            // case 'stationery':
            //     return <FaPencilAlt size={32} />;
            default:
                return <FaHotel size={32} />;
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            return;
        }

        // Check and set default times for open days with empty time slots
        const updatedTimeSlots = {};
        Object.entries(formData.operatingHours.timeSlots).forEach(([day, slot]) => {
            if (slot.isOpen) {
                updatedTimeSlots[day] = {
                    ...slot,
                    openTime: slot.openTime || '09:00',
                    closeTime: slot.closeTime || '22:00'
                };
            } else {
                updatedTimeSlots[day] = slot;
            }
        });

        const updatedOperatingHours = {
            ...formData.operatingHours,
            timeSlots: updatedTimeSlots
        };

        const stepData = {
            category: selectedCategory?.id || '',
            subdomain: formData.subdomain || '',
            operatingHours: updatedOperatingHours
        };

        console.log(stepData, 'stepdata');

        try {
            await onNext(stepData);
        } catch (error) {
            // Handle subdomain validation error
            if (error?.response?.status === 400 && error?.response?.data?.message?.includes('Subdomain already taken')) {
                toast.error('Subdomain already taken. Please choose a different one.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        }
    };

    const handleOperatingHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                timeSlots: {
                    ...prev.operatingHours.timeSlots,
                    [day]: {
                        ...prev.operatingHours.timeSlots[day],
                        [field]: value
                    }
                }
            }
        }));
    };

    const handleDefaultTimeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                defaultOpenTime: field === 'openTime' ? value : prev.operatingHours.defaultOpenTime,
                defaultCloseTime: field === 'closeTime' ? value : prev.operatingHours.defaultCloseTime,
                timeSlots: Object.keys(prev.operatingHours.timeSlots).reduce((acc, day) => {
                    if (prev.operatingHours.timeSlots[day].isOpen) {
                        acc[day] = {
                            ...prev.operatingHours.timeSlots[day],
                            [field]: value
                        };
                    } else {
                        acc[day] = prev.operatingHours.timeSlots[day];
                    }
                    return acc;
                }, {})
            }
        }));
    };

    const toggleTimeSlots = () => {
        setShowTimeSlots(!showTimeSlots);
    };

    const days = [
        { id: 'monday', name: 'Monday' },
        { id: 'tuesday', name: 'Tuesday' },
        { id: 'wednesday', name: 'Wednesday' },
        { id: 'thursday', name: 'Thursday' },
        { id: 'friday', name: 'Friday' },
        { id: 'saturday', name: 'Saturday' },
        { id: 'sunday', name: 'Sunday' }
    ];

    // Check if all days are open
    const allDaysOpen = days.every(day => formData.operatingHours.timeSlots[day.id]?.isOpen !== false);

    // Handler for select all
    const handleSelectAllDays = (checked) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                timeSlots: days.reduce((acc, day) => {
                    acc[day.id] = {
                        ...prev.operatingHours.timeSlots[day.id],
                        isOpen: checked
                    };
                    return acc;
                }, {})
            }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="menu-details-form">
            <div className="mb-4">
                <h5 className="mb-3">Select Business Category</h5>
                <div className="category-grid">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className={`category-card ${selectedCategory?.id === category.id ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(category)}
                        >
                            {selectedCategory?.id === category.id && (
                                <div className="category-check">
                                    <FaCheck />
                                </div>
                            )}
                            <div className="category-icon">
                                {getCategoryIcon(category.name)}
                            </div>
                            <div className="category-name">{category.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <h5 className="mb-3">Business Subdomain</h5>
                <div className="row">
                    <div className="col-md-9">
                        <label className="form-label">Subdomain *</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className={`form-control ${subdomainStatus === 'available' ? 'is-valid' : subdomainStatus === 'taken' || subdomainStatus === 'invalid' ? 'is-invalid' : ''}`}
                                name="subdomain"
                                value={formData.subdomain || ''}
                                onChange={(e) => {
                                    const { name, value } = e.target;
                                    setFormData(prev => ({
                                        ...prev,
                                        [name]: value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                    }));
                                    // Reset status when user starts typing
                                    setSubdomainStatus(null);
                                }}
                                placeholder="Enter unique subdomain"
                                required
                            />
                            <span className="input-group-text">.shopatb2b.com</span>
                            <button
                                type="button"
                                className="btn btn-outline-primary d-flex align-items-center"
                                onClick={checkSubdomainAvailability}
                                disabled={isCheckingSubdomain || !formData.subdomain}
                            >
                                {isCheckingSubdomain ? (
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                ) : (
                                    <FaSearch />
                                )}
                                {isCheckingSubdomain ? 'Checking...' : 'Check'}
                            </button>
                        </div>

                        {/* Status indicators */}
                        {subdomainStatus === 'available' && (
                            <div className="valid-feedback d-block">
                                ✅ Subdomain is available!
                            </div>
                        )}
                        {subdomainStatus === 'taken' && (
                            <div className="invalid-feedback d-block">
                                ❌ Subdomain is already taken
                            </div>
                        )}
                        {subdomainStatus === 'invalid' && (
                            <div className="invalid-feedback d-block">
                                ❌ Invalid subdomain format
                            </div>
                        )}

                        {formData.subdomain && (
                            <div className="form-text">
                                Your business will be accessible at: <strong>{formData.subdomain}.shopatb2b.com</strong>
                            </div>
                        )}

                        <small className="text-muted">
                            Only lowercase letters, numbers, and hyphens are allowed
                        </small>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <h5 className="mb-3">Operating Hours</h5>
                <div className="default-hours mb-4">
                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label">Opening Time</label>
                            <div className="input-group">
                                <span className="input-group-text"><FaClock /></span>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.operatingHours.defaultOpenTime}
                                    onChange={(e) => handleDefaultTimeChange('openTime', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Closing Time</label>
                            <div className="input-group">
                                <span className="input-group-text"><FaClock /></span>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.operatingHours.defaultCloseTime}
                                    onChange={(e) => handleDefaultTimeChange('closeTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="days-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Days Open</h6>
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={toggleTimeSlots}
                        >
                            {showTimeSlots ? (
                                <span>Hide Time Slots <FaChevronUp /></span>
                            ) : (
                                <span>Show Time Slots <FaChevronDown /></span>
                            )}
                        </button>
                    </div>

                    {/* Select All Checkbox */}
                    <div className="form-check mb-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="select-all-days"
                            checked={allDaysOpen}
                            onChange={e => handleSelectAllDays(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="select-all-days">
                            Select All
                        </label>
                    </div>

                    <div className="days-list">
                        {days.map((day) => (
                            <div key={day.id} className="day-item">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`${day.id}-open`}
                                        checked={formData.operatingHours.timeSlots[day.id]?.isOpen !== false}
                                        onChange={(e) => handleOperatingHoursChange(day.id, 'isOpen', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={`${day.id}-open`}>
                                        {day.name}
                                    </label>
                                </div>
                                {showTimeSlots && formData.operatingHours.timeSlots[day.id]?.isOpen !== false && (
                                    <div className="time-slots mt-2">
                                        <div className="row">
                                            <div className="col-6">
                                                <input
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    value={formData.operatingHours.timeSlots[day.id]?.openTime || formData.operatingHours.defaultOpenTime}
                                                    onChange={(e) => handleOperatingHoursChange(day.id, 'openTime', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <input
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    value={formData.operatingHours.timeSlots[day.id]?.closeTime || formData.operatingHours.defaultCloseTime}
                                                    onChange={(e) => handleOperatingHoursChange(day.id, 'closeTime', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid}
            >
                Next
            </button>

            <style jsx>{`
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .category-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    background: white;
                    border: 2px solid #dee2e6;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .category-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .category-card.active {
                    border-color: #0d6efd;
                    background-color: #f8f9ff;
                }
                .category-check {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0d6efd;
                    color: white;
                    border-radius: 50%;
                    font-size: 12px;
                }
                .category-icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 64px;
                    height: 64px;
                    margin-bottom: 12px;
                    color: #212529;
                }
                .category-name {
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                    color: #212529;
                }
                .days-list {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                }
                .day-item {
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .day-item:last-child {
                    border-bottom: none;
                }
                .time-slots {
                    padding-left: 25px;
                }
            `}</style>
        </form>
    );
};

export default MenuDetails; 
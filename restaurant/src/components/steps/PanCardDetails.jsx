import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PanCardDetails = ({
    panDetails,
    setPanDetails,
    formData,
    setFormData,
    isFormValid,
    onNext,
}) => {
    const [previewImages, setPreviewImages] = useState({
        profileImage: null,
        panCardImage: null,
        gstImage: null,
        fssaiImage: null
    });

    // Initialize preview images from formData if they exist
    useEffect(() => {
        if (formData?.images) {
            setPreviewImages(prev => ({
                ...prev,
                profileImage: formData.images.profileImage || null,
                panCardImage: formData.images.panCardImage || null,
                gstImage: formData.images.gstImage || null,
                fssaiImage: formData.images.fssaiImage || null
            }));
        }
    }, [formData]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    const validateFileSize = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size should not exceed 5MB');
            return false;
        }
        return true;
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size
            if (!validateFileSize(file)) {
                e.target.value = ''; // Clear the input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages(prev => ({
                    ...prev,
                    [type]: reader.result
                }));
                
                // Update formData with the image
                setFormData(prev => ({
                    ...prev,
                    images: {
                        ...prev.images,
                        [type]: reader.result // Store base64 image
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate profile image
        if (!previewImages.profileImage) {
            toast.error('Profile Image is required');
            return;
        }

        // Validate PAN Card Number
        if (!panDetails.panNumber?.trim()) {
            toast.error('PAN Card Number is required');
            return;
        }

        // Validate Name on PAN
        if (!panDetails.name?.trim()) {
            toast.error('Name on PAN is required');
            return;
        }

        // Validate Date of Birth and Age
        if (!panDetails.dateOfBirth) {
            toast.error('Date of Birth is required');
            return;
        }

        // Calculate age
        const birthDate = new Date(panDetails.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            toast.error('Age must be at least 18 years');
            return;
        }

        // Validate Address
        if (!panDetails.address?.trim()) {
            toast.error('Address is required');
            return;
        }

        const stepData = {
            panDetails: {
                panNumber: panDetails.panNumber.trim(),
                name: panDetails.name.trim(),
                dateOfBirth: panDetails.dateOfBirth,
                address: panDetails.address.trim(),
            },
            images: {
                profileImage: previewImages.profileImage,
                panCardImage: previewImages.panCardImage,
                gstImage: previewImages.gstImage,
                fssaiImage: previewImages.fssaiImage
            }
        };

        onNext(stepData);
    };

    const renderImageUpload = (type, label, isRequired = false) => (
        <div className="col-md-6 mb-4">
            <div className="card h-100">
                <div className="card-body">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        {label} {isRequired && <span className="text-danger">*</span>}
                    </label>
                    <div className="d-flex align-items-center justify-content-center" 
                         style={{ height: '200px', border: '2px dashed #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                        {previewImages[type] ? (
                            <div className="position-relative w-100 h-100">
                                <img 
                                    src={previewImages[type]} 
                                    alt={`${label} Preview`} 
                                    className="img-fluid" 
                                    style={{ 
                                        maxHeight: '100%', 
                                        width: '100%', 
                                        objectFit: 'cover' 
                                    }} 
                                />
                                {!previewImages[type].startsWith('data:image') && (
                                    <div className="position-absolute top-0 end-0 p-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                                setPreviewImages(prev => ({
                                                    ...prev,
                                                    [type]: null
                                                }));
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: {
                                                        ...prev.images,
                                                        [type]: null
                                                    }
                                                }));
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="text-muted mb-2">Upload Image</span>
                                {isRequired && <div className="text-danger small mt-1">Required</div>}
                                <div className="text-muted small mt-1">Max size: 5MB</div>
                            </div>
                        )}
                    </div>
                    {(!previewImages[type] || previewImages[type].startsWith('data:image')) && (
                        <input
                            type="file"
                            className="form-control mt-3"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, type)}
                            required={isRequired}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="pan-card-details-form">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">Business Documents</h2>
                    
                    {/* Image Uploads */}
                    <div className="row">
                        {renderImageUpload('profileImage', 'Profile Image Of Business', true)}
                        {renderImageUpload('panCardImage', 'PAN Card Image')}
                        {renderImageUpload('gstImage', 'GST Certificate')}
                        {renderImageUpload('fssaiImage', 'FSSAI Certificate')}
                    </div>

                    {/* PAN Card Details */}
                    <div className="mt-4">
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                PAN Card Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={panDetails.panNumber || ''}
                                onChange={(e) => setPanDetails({ ...panDetails, panNumber: e.target.value })}
                                className="form-control"
                                placeholder="Enter PAN Card Number"
                                
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Name on PAN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={panDetails.name || ''}
                                onChange={(e) => setPanDetails({ ...panDetails, name: e.target.value })}
                                
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={panDetails.dateOfBirth || ''}
                                onChange={(e) => setPanDetails({ ...panDetails, dateOfBirth: e.target.value })}
                                
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                value={panDetails.address || ''}
                                onChange={(e) => setPanDetails({ ...panDetails, address: e.target.value })}
                                rows="3"
                                
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PanCardDetails; 
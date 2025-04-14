import React, { useState } from 'react';

const PanCardDetails = ({
    panDetails,
    setPanDetails,
    panCardImage,
    setPanCardImage,
    fileInputRef,
    handleImageUpload,
    isFormValid,
    onNext
}) => {
    const [previewImage, setPreviewImage] = useState(null);

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            handleImageUpload(file, 'profileImage');
        }
    };

    const handlePanCardImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, 'panCardImage');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const stepData = {
            panDetails: {
                panNumber: panDetails.panNumber || '',
                name: panDetails.name || '',
                dateOfBirth: panDetails.dateOfBirth || '',
                address: panDetails.address || '',
            },
            images: {
                profileImage: previewImage ? panCardImage : null,
                panCardImage: panCardImage
            }
        };

        onNext(stepData);
    };

    return (
        <form onSubmit={handleSubmit} className="pan-card-details-form">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">PAN Card Details</h2>
                    
                    {/* Profile Image Upload */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Profile Image
                        </label>
                        <div className="flex items-center space-x-4">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                {previewImage ? (
                                    <img 
                                        src={previewImage} 
                                        alt="Profile Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400">Upload Image</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                className="hidden"
                                id="profile-image"
                            />
                            <label 
                                htmlFor="profile-image"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                            >
                                Choose Image
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Upload a clear, recent photo of yourself
                        </p>
                    </div>

                    {/* Existing PAN Card fields */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            PAN Card Number
                        </label>
                        <input
                            type="text"
                            value={panDetails.panNumber || ''}
                            onChange={(e) => setPanDetails({ ...panDetails, panNumber: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter PAN Card Number"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Name on PAN</label>
                        <input
                            type="text"
                            className="form-control"
                            value={panDetails.name || ''}
                            onChange={(e) => setPanDetails({ ...panDetails, name: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                            type="date"
                            className="form-control"
                            value={panDetails.dateOfBirth || ''}
                            onChange={(e) => setPanDetails({ ...panDetails, dateOfBirth: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-control"
                            value={panDetails.address || ''}
                            onChange={(e) => setPanDetails({ ...panDetails, address: e.target.value })}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Upload PAN Card Image</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePanCardImageChange}
                        />
                        {panCardImage && typeof panCardImage === 'string' && (
                            <div className="mt-2">
                                <img src={panCardImage} alt="PAN Card" className="img-thumbnail" style={{ maxHeight: '200px' }} />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Next
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PanCardDetails; 
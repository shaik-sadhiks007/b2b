import React from 'react';

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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Create the step data with the exact structure needed
        const stepData = {
            panDetails: {
                panNumber: panDetails.panNumber || '',
                name: panDetails.name || '',
                dateOfBirth: panDetails.dateOfBirth || '',
                address: panDetails.address || '',
            }
        };

        onNext(stepData);
    };

    return (
        <form onSubmit={handleSubmit} className="pan-card-details-form">
            <div className="mb-3">
                <label className="form-label">PAN Card Number</label>
                <input
                    type="text"
                    className="form-control"
                    value={panDetails.panNumber || ''}
                    onChange={(e) => setPanDetails({ ...panDetails, panNumber: e.target.value })}
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
                    onChange={(e) => {
                        if (e.target.files[0]) {
                            handleImageUpload(e.target.files[0], 'panCardImage');
                        }
                    }}
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
        </form>
    );
};

export default PanCardDetails; 
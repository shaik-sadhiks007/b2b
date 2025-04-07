import React from 'react';

const GSTDetails = ({
    gstDetails,
    setGstDetails,
    gstCertificateImage,
    handleImageUpload,
    isFormValid,
    onNext
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const formData = new FormData();
        formData.append('gstNumber', gstDetails.gstNumber);
        formData.append('registrationDate', gstDetails.registrationDate);
        formData.append('legalBusinessName', gstDetails.legalBusinessName);
        formData.append('businessType', gstDetails.businessType);
        formData.append('principalPlaceAddress', gstDetails.principalPlaceAddress);
        
        if (gstCertificateImage) {
            formData.append('gstCertificateImage', gstCertificateImage);
        }

        onNext(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="gst-details-form">
            <div className="mb-3">
                <label className="form-label">GST Number</label>
                <input
                    type="text"
                    className="form-control"
                    value={gstDetails.gstNumber}
                    onChange={(e) => setGstDetails({ ...gstDetails, gstNumber: e.target.value })}
                    placeholder="15-digit GST number"
                    maxLength="15"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Registration Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={gstDetails.registrationDate}
                    onChange={(e) => setGstDetails({ ...gstDetails, registrationDate: e.target.value })}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Legal Business Name</label>
                <input
                    type="text"
                    className="form-control"
                    value={gstDetails.legalBusinessName}
                    onChange={(e) => setGstDetails({ ...gstDetails, legalBusinessName: e.target.value })}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Business Type</label>
                <select
                    className="form-select"
                    value={gstDetails.businessType}
                    onChange={(e) => setGstDetails({ ...gstDetails, businessType: e.target.value })}
                    required
                >
                    <option value="">Select Business Type</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Limited Company</option>
                    <option value="public_limited">Public Limited Company</option>
                    <option value="llp">Limited Liability Partnership</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Principal Place of Business Address</label>
                <textarea
                    className="form-control"
                    value={gstDetails.principalPlaceAddress}
                    onChange={(e) => setGstDetails({ ...gstDetails, principalPlaceAddress: e.target.value })}
                    rows="3"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Upload GST Certificate</label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'gst')}
                    required={!gstCertificateImage}
                />
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

export default GSTDetails; 
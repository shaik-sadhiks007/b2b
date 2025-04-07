import React from 'react';

const FssaiDetails = ({
    fssaiDetails,
    setFssaiDetails,
    fssaiCertificateImage,
    handleImageUpload,
    isFormValid,
    onNext
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const formData = new FormData();
        formData.append('licenseNumber', fssaiDetails.licenseNumber);
        formData.append('issueDate', fssaiDetails.issueDate);
        formData.append('expiryDate', fssaiDetails.expiryDate);
        formData.append('applicantName', fssaiDetails.applicantName);
        formData.append('premisesAddress', fssaiDetails.premisesAddress);
        formData.append('kindOfBusiness', fssaiDetails.kindOfBusiness);
        
        if (fssaiCertificateImage) {
            formData.append('fssaiCertificateImage', fssaiCertificateImage);
        }

        onNext(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="fssai-details-form">
            <div className="mb-3">
                <label className="form-label">FSSAI License Number</label>
                <input
                    type="text"
                    className="form-control"
                    value={fssaiDetails.licenseNumber}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, licenseNumber: e.target.value })}
                    placeholder="14-digit FSSAI number"
                    maxLength="14"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Issue Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={fssaiDetails.issueDate}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, issueDate: e.target.value })}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={fssaiDetails.expiryDate}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, expiryDate: e.target.value })}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Applicant Name</label>
                <input
                    type="text"
                    className="form-control"
                    value={fssaiDetails.applicantName}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, applicantName: e.target.value })}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Premises Address</label>
                <textarea
                    className="form-control"
                    value={fssaiDetails.premisesAddress}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, premisesAddress: e.target.value })}
                    rows="3"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Kind of Business</label>
                <select
                    className="form-select"
                    value={fssaiDetails.kindOfBusiness}
                    onChange={(e) => setFssaiDetails({ ...fssaiDetails, kindOfBusiness: e.target.value })}
                    required
                >
                    <option value="">Select Business Type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="food_stall">Food Stall</option>
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="food_truck">Food Truck</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Upload FSSAI Certificate</label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'fssai')}
                    required={!fssaiCertificateImage}
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

export default FssaiDetails; 
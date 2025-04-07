import React, { useState } from 'react';

const TermsAndConditions = ({
    onSubmit,
    isFormValid
}) => {
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSubmit = () => {
        if (termsAccepted) {
            onSubmit(5); // Pass step 5 to indicate completion
        }
    };

    return (
        <>
            <h4 className="mb-4">Terms and Conditions</h4>
            
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Terms of Service</h5>
                    <div className="terms-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <p>By accepting these terms, you agree to:</p>
                        <ol>
                            <li>Provide accurate and complete information about your restaurant</li>
                            <li>Maintain the quality and safety of your food products</li>
                            <li>Comply with all local health and safety regulations</li>
                            <li>Keep your menu and prices up to date</li>
                            <li>Handle customer orders promptly and professionally</li>
                            <li>Maintain proper hygiene standards in your kitchen</li>
                            <li>Respond to customer feedback and complaints appropriately</li>
                            <li>Keep your restaurant profile and information current</li>
                            <li>Follow our platform's guidelines and policies</li>
                            <li>Pay all applicable fees and charges on time</li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="termsCheck"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="termsCheck">
                        I have read and agree to the Terms and Conditions
                    </label>
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button 
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={handleSubmit}
                    disabled={!termsAccepted}
                >
                    Submit
                </button>
            </div>
        </>
    );
};

export default TermsAndConditions; 
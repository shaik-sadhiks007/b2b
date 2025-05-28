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
                            <p>By registering or using the Platform, you acknowledge
                                 that you have read, understood, and agree to be bound by 
                                 these Terms and Conditions and our Privacy Policy. If you do not agree,
                                  you may not use the Platform.</p>
                                  <li>You must be at least 18 years old to register.</li>
                            <li>Provide accurate and complete information about your restaurant</li>
                            <li>Maintain the quality and safety of your food products</li>
                            <li>Comply with all local health and safety regulations</li>
                            <li>Keep your menu and prices up to date</li>
                            <li>Handle customer orders promptly and professionally</li>
                            <li>Maintain proper hygiene standards in your kitchen</li>
                            <li>You are responsible for maintaining the confidentiality of your login credentials
                                 and for all activities under your account.</li>
                            <li>Keep your restaurant profile and information current</li>
                            <li>Follow our platform's guidelines and policies</li>
                            <li>Pay all applicable fees and charges on time</li>

                        </ol>

                        <p>We act as an intermediary and are not liable for the quality,
                             pricing, or delivery of services/products offered by third-party vendors.</p>

                             <h6>You agree not to:</h6>
                             <ol>
                                <li>Violate any laws, regulations, or third-party rights;</li>
                                <li>Attempt unauthorized access to the Platform or its data;</li>
                                <li>Post false, misleading, or inappropriate content;</li>
                                <li>Engage in fraudulent activity or misuse services.</li>
                             </ol>
                                <p>All content, trademarks, and service marks on the Platform are owned by or licensed to us. 
                                    Unauthorized use is prohibited.</p>
                             <h4>Disclaimer & Limitation of Liability</h4>
                             <ol>
                                <li>We do not guarantee uninterrupted or error-free service.</li>
                                <li>We are not liable for any direct, indirect, incidental, or consequential damages
                                     resulting from the use of or inability to use the Platform.</li>
                             </ol>
                             <p>We may modify these Terms at any time. Your continued use of the Platform signifies your acceptance of the updated terms.
These Terms are governed by the laws of the State of Andhra Pradesh, India without regard to its conflict of laws principles.
If you have questions or concerns, please contact us at supportteam@b2binfotech.
</p>
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
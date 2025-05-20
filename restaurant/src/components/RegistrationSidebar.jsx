import React from 'react';

const RegistrationSidebar = ({ currentStep, onStepClick }) => {
    const steps = [
        {
            number: 1,
            title: 'Business Information',
            icon: 'bi-shop'
        },
        {
            number: 2,
            title: 'Menu & Operations',
            icon: 'bi-menu-button-wide'
        },
        {
            number: 3,
            title: 'PAN Card Details',
            icon: 'bi-file-earmark-text'
        },
        {
            number: 4,
            title: 'Terms & Conditions',
            icon: 'bi-check-circle'
        }
    ];

    return (
        <div className="registration-sidebar">
            <div className="d-flex flex-column">
                {steps.map((step, index) => (
                    <div
                        key={step.number}
                        className={`step-item d-flex align-items-center mb-3 ${
                            currentStep === step.number ? 'active' : ''
                        } ${currentStep > step.number ? 'completed' : ''}`}
                        onClick={() => onStepClick(step.number)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="step-number me-3">
                            <i className={`bi ${step.icon}`}></i>
                        </div>
                        <div className="step-content">
                            <div className="step-title">{step.title}</div>
                            <div className="step-subtitle">
                                {currentStep === step.number ? 'Current Step' : 
                                 currentStep > step.number ? 'Completed' : 'Pending'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegistrationSidebar; 
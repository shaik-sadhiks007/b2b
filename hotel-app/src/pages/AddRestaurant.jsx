import axios from 'axios';
import { toast } from 'react-toastify';

const handleStepClick = async (step) => {
    // Allow going back to any previous step
    if (step < currentStep) {
        setCurrentStep(step);
        return;
    }

    // For next step, validate current step
    if (step === currentStep + 1) {
        if (validateStep(currentStep)) {
            try {
                let response;
                const formData = new FormData();

                switch (currentStep) {
                    case 1:
                        // Add restaurant info
                        Object.keys(formData).forEach(key => {
                            if (key !== 'images') {
                                formData.append(key, formData[key]);
                            }
                        });
                        // Add restaurant images
                        if (formData.images?.restaurant) {
                            formData.images.restaurant.forEach(image => {
                                formData.append('images', image);
                            });
                        }
                        response = await axios.post('/api/restaurant/info', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        break;

                    case 2:
                        // Add menu details
                        formData.append('category', formData.category);
                        formData.append('deliveryTiming', JSON.stringify(formData.deliveryTiming));
                        // Add food images
                        if (formData.images?.food) {
                            formData.images.food.forEach(image => {
                                formData.append('images', image);
                            });
                        }
                        response = await axios.post('/api/restaurant/menu', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        break;

                    case 3:
                        // Add PAN card details
                        formData.append('panDetails', JSON.stringify(formData.panDetails));
                        if (formData.panCardImage) {
                            formData.append('panCardImage', formData.panCardImage);
                        }
                        response = await axios.post('/api/restaurant/pan-card', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        break;

                    case 4:
                        response = await axios.post('/api/restaurant/terms', {
                            termsAccepted: true
                        });
                        break;
                }

                if (response.data.success) {
                    toast.success(`Step ${currentStep} completed successfully`);
                    setCurrentStep(step);
                } else {
                    toast.error('Failed to save data. Please try again.');
                }
            } catch (error) {
                console.error('Error saving step data:', error);
                toast.error(error.response?.data?.message || 'Failed to save data. Please try again.');
            }
        } else {
            toast.error('Please complete all required fields before proceeding to the next step.');
        }
    }
}; 
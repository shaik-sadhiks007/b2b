import React from 'react';
import Header from "./Header";
import { FaClipboardCheck, FaClock, FaEnvelope, FaPhone } from 'react-icons/fa';

const Review = () => {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4 py-12 mt-5">
                    <div className="max-w-5xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl shadow-lg mb-6 transform rotate-3">
                                <FaClock className="text-white text-3xl" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-3">Your Business is Under Review</h1>
                            <p className="text-xl text-gray-600">We're currently reviewing your business details</p>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column - Timeline */}
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-8">Review Timeline</h2>
                                <div className="space-y-8">
                                    <div className="flex items-start group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                            <span className="text-xl font-bold text-green-500 group-hover:text-white">1</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Submission Received</h3>
                                            <p className="text-gray-600">Your business details have been submitted successfully</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                            <span className="text-xl font-bold text-yellow-500 group-hover:text-white">2</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Under Review</h3>
                                            <p className="text-gray-600">Our team is currently reviewing your application</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-gray-500 group-hover:text-white transition-all duration-300">
                                            <span className="text-xl font-bold text-gray-500 group-hover:text-white">3</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Approval</h3>
                                            <p className="text-gray-600">Your business will be published upon approval</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Next Steps & Support */}
                            <div className="space-y-8">
                                {/* Next Steps Card */}
                                <div className="bg-white rounded-2xl shadow-xl p-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">What happens next?</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-start p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                                                <FaClipboardCheck className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Document Verification</h3>
                                                <p className="text-gray-600">Our team is reviewing your submitted documents and business details</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                                            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                                                <FaEnvelope className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Email Notification</h3>
                                                <p className="text-gray-600">You'll receive an email once the review is complete</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300">
                                            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                                                <FaPhone className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Contact Support</h3>
                                                <p className="text-gray-600">Need help? Our support team is available 24/7</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support Card */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
                                    <h2 className="text-2xl font-bold mb-4">Need Assistance?</h2>
                                    <p className="text-blue-100 mb-6">
                                        Our support team is here to help you with any questions or concerns about your business review process.
                                    </p>
                                    <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Review;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';

const Footer = () => {
    const navigate = useNavigate();

    const handleRestaurantClick = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        const targetWindow = openWindowWithToken("http://localhost:5174", "http://localhost:5174");
        
        if (!targetWindow) {
            navigate('/login');
        }
    };

    const handleDeliveryPartnerClick = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        // Add your delivery partner URL here
        const targetWindow = openWindowWithToken("http://localhost:5175", "http://localhost:5175");
        
        if (!targetWindow) {
            navigate('/login');
        }
    };

    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">B2B</h3>
                        <p className="text-gray-400">Your one-stop platform for business services.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Partner With Us */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Partner With Us</h3>
                        <ul className="space-y-2">
                            <li>
                                <a 
                                    href="http://localhost:5175/" 
                                    onClick={handleRestaurantClick}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Add your Business
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    onClick={handleDeliveryPartnerClick}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Become a delivery partner
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: support@b2b.com</li>
                            <li>Phone: +1 234 567 890</li>
                            <li>Address: 123 Business Street, City, Country</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} B2B. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 
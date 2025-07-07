import React from 'react';
import { useNavigate } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
import { ORIGIN_URL, RESTAURANT_URL } from '../api/api';
import { Link } from 'react-router-dom';

console.log('ORIGIN_URL in Footer:', ORIGIN_URL);

const Footer = () => {
    const navigate = useNavigate();

    const handleRestaurantClick = (e) => {
        console.log('Restaurant click handler called');
        e.preventDefault();
        console.log('Opening window with URL:', RESTAURANT_URL);
        const targetWindow = openWindowWithToken(RESTAURANT_URL, ORIGIN_URL);

        if (!targetWindow) {
            console.log('Failed to open window, navigating to login');
            navigate('/login');
        } else {
            console.log('Window opened successfully');
        }
    };



    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">B2B</h3>
                        <p className="text-gray-400">one-stop solution for online shopping.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li> <Link to="/aboutb2b" className="text-gray-400 hover:text-white">
                                About B2B
                            </Link></li>
                            {/* <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li> */}
                            {/* <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li> */}
                        </ul>
                    </div>

                    {/* Partner With Us */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Partner With Us</h3>
                        <ul className="space-y-2">
                            <li>
                                <a

                                    // onClick={handleRestaurantClick}
                                    href={RESTAURANT_URL}
                                    target='_blank'
                                    className="text-gray-400 hover:text-white cursor-pointer"
                                >
                                    Add your Business
                                </a>
                            </li>
                            <li>
                                {/* <a 
                                    href="#" 
                                    onClick={handleDeliveryPartnerClick}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Become a delivery partner
                                </a> */}
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a href="mailto:info@shopatb2b.com">
                                    Email: info@shopatb2b.com

                                </a>
                            </li>
                            <li>Phone: +1 234 567 890</li>
                            <li>Address: Vijayawada, Andhra Pradesh</li>
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
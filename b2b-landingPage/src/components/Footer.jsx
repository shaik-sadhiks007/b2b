import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
import { ORIGIN_URL, RESTAURANT_URL, API_URL } from '../api/api';
import { Link } from 'react-router-dom';
import { getSubdomain } from '../utils/getSubdomain';
import axios from 'axios';

const Footer = () => {
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(false);
    const subdomain = getSubdomain();
    const isSubdomain = subdomain && subdomain !== "shopatb2b";
    // Fetch business data if it's a subdomain
    
    useEffect(() => {
        if (isSubdomain) {
            setLoading(true);
            axios.get(`${API_URL}/api/subdomain/business/${subdomain}`)
                .then(response => {
                    setBusinessData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching business data:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isSubdomain, subdomain]);



    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company/Business Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {isSubdomain ? (businessData?.restaurantName || 'Restaurant') : 'B2B'}
                        </h3>
                        <p className="text-gray-400">
                            {isSubdomain 
                                ? (businessData?.description || 'Delicious food at your doorstep')
                                : 'one-stop solution for online shopping.'
                            }
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {!isSubdomain && (
                                <li>
                                    <Link to="/aboutb2b" className="text-gray-400 hover:text-white">
                                        About B2B
                                    </Link>
                                </li>
                            )}
                            {isSubdomain && businessData && (
                                <li>
                                    <span className="text-gray-400">
                                        Service Type: {businessData.serviceType || 'Delivery'}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Partner With Us / Business Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            {isSubdomain ? 'Business Info' : 'Partner With Us'}
                        </h3>
                        <ul className="space-y-2">
                            {!isSubdomain ? (
                                <li>
                                    <a
                                        href={RESTAURANT_URL}
                                        target='_blank'
                                        className="text-gray-400 hover:text-white cursor-pointer"
                                    >
                                        Add your Business
                                    </a>
                                </li>
                            ) : (
                                businessData && (
                                    <>
                                        {businessData.address?.streetAddress && (
                                            <li className="text-gray-400">
                                                {businessData.address.streetAddress}
                                            </li>
                                        )}
                                        {businessData.address?.city && (
                                            <li className="text-gray-400">
                                                {businessData.address.city}
                                            </li>
                                        )}
                                        {businessData.address?.state && (
                                            <li className="text-gray-400">
                                                {businessData.address.state}
                                            </li>
                                        )}
                                    </>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-400">
                            {isSubdomain && businessData?.contact?.email ? (
                                <li>
                                    <a href={`mailto:${businessData.contact.email}`}>
                                        Email: {businessData.contact.email}
                                    </a>
                                </li>
                            ) : (
                                <li>
                                    <a href="mailto:info@shopatb2b.com">
                                        Email: info@shopatb2b.com
                                    </a>
                                </li>
                            )}
                            {isSubdomain && businessData?.contact?.primaryPhone ? (
                                <li>Phone: {businessData.contact.primaryPhone}</li>
                            ) : (
                                <li>Phone: +1 234 567 890</li>
                            )}
                            {isSubdomain && businessData?.address ? (
                                <li>
                                    {businessData.address.city && `${businessData.address.city}, `}
                                    {businessData.address.state && `${businessData.address.state}`}
                                </li>
                            ) : (
                                <li>Address: Vijayawada, Andhra Pradesh</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} {isSubdomain ? (businessData?.restaurantName || 'Restaurant') : 'B2B'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 
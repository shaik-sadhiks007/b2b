import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
import { RESTAURANT_URL, API_URL, DELIVERY_URL } from '../api/api';
import { Link } from 'react-router-dom';
import { getSubdomain } from '../utils/getSubdomain';
import axios from 'axios';
import { MapPin } from 'lucide-react';

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



    // Map component
    const MapComponent = ({ coordinates }) => {
        if (!coordinates || !coordinates.lat || !coordinates.lng) {
            return (
                <div className="bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-400 text-sm">Location not available</p>
                    </div>
                </div>
            );
        }

        // const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwRg0hVdCx7SXjSY&q=${coordinates.lat},${coordinates.lng}&zoom=15`;

        // Use OpenStreetMap which doesn't require an API key
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;

        return (
            <div className="bg-gray-800 rounded-lg overflow-hidden h-48">
                <iframe
                    title="Business Location"
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        );
    };

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

                                <>
                                    <li>
                                        <Link to="/aboutb2b" className="text-gray-400 hover:text-white">
                                            About B2B
                                        </Link>
                                    </li>

                                    <li>
                                        <a
                                            href={RESTAURANT_URL}
                                            target='_blank'
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Add your Business
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href={DELIVERY_URL}
                                            target='_blank'
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Delivery Partner
                                        </a>
                                    </li>
                                </>

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
                                <>
                                    <li>
                                        <a
                                            href={RESTAURANT_URL}
                                            target='_blank'
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Add your Business
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href={DELIVERY_URL}
                                            target='_blank'
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Delivery Partner
                                        </a>
                                    </li>
                                </>
                            ) : (
                                businessData && (
                                    <MapComponent coordinates={businessData.location} />
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
                    {/* <p>&copy; {new Date().getFullYear()} {isSubdomain ? (businessData?.restaurantName || 'Restaurant') : 'B2B'}. All rights reserved.</p> */}

                    <p>&copy; {new Date().getFullYear()} B2B. All rights reserved.</p>

                </div>
            </div>
        </footer>
    );
};

export default Footer; 
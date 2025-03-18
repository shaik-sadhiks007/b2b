import { useState, useEffect } from 'react';

function Footer() {
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAddress();
    }, []);

    const fetchAddress = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/api/address');
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            const data = await response.json();
            setAddress(data);
        } catch (error) {
            console.error('Error fetching address:', error);
            setError('Failed to load contact information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5>Contact Us</h5>
                        {loading ? (
                            <p>Loading contact information...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : address ? (
                            <div>
                                <p className="mb-1">{address.streetAddress}</p>
                                <p className="mb-1">{address.city}, {address.state} {address.postalCode}</p>
                                <p className="mb-1">{address.country}</p>
                                <p className="mb-1">
                                    <i className="bi bi-telephone me-2"></i>
                                    {address.phone}
                                </p>
                                <p className="mb-1">
                                    <i className="bi bi-envelope me-2"></i>
                                    {address.email}
                                </p>
                                <p className="mb-1">
                                    <i className="bi bi-clock me-2"></i>
                                    {address.businessHours?.open} - {address.businessHours?.close}
                                </p>
                            </div>
                        ) : (
                            <p>Contact information not available</p>
                        )}
                    </div>
                    <div className="col-md-4">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-light">Home</a></li>
                            <li><a href="/menu" className="text-light">Menu</a></li>
                            <li><a href="/about" className="text-light">About Us</a></li>
                            <li><a href="/contact" className="text-light">Contact</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h5>Follow Us</h5>
                        <div className="d-flex gap-3">
                            {address?.socialMedia?.facebook && (
                                <a href={address.socialMedia.facebook} className="text-light" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-facebook fs-5"></i>
                                </a>
                            )}
                            {address?.socialMedia?.twitter && (
                                <a href={address.socialMedia.twitter} className="text-light" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-twitter fs-5"></i>
                                </a>
                            )}
                            {address?.socialMedia?.instagram && (
                                <a href={address.socialMedia.instagram} className="text-light" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-instagram fs-5"></i>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

import { FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

function Footer() {
    return (
        <footer className="bg-black text-white py-5">
            <div className="container">
                <div className="row">
                    {/* Newsletter Section */}
                    <div className="col-md-4">
                        <h5 className="mb-3">SIGN UP FOR OUR NEWSLETTER</h5>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-white border border-white rounded-circle p-2">
                                <FaFacebookF size={25} />
                            </a>
                            <a href="#" className="text-white border border-white rounded-circle p-2">
                                <FaInstagram size={25} />
                            </a>
                            <a href="#" className="text-white border border-white rounded-circle p-2">
                                <FaTwitter size={25} />
                            </a>
                        </div>
                    </div>

                    {/* Pages Section */}
                    <div className="col-md-4 text-center">
                        <h5 className="mb-3">Pages</h5>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-white text-decoration-none">Home</a></li>
                            <li><a href="#" className="text-white text-decoration-none">About</a></li>
                            <li><a href="#" className="text-white text-decoration-none">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="col-md-4 text-start">
                        <h5 className="mb-3">CONTACT US</h5>
                        <p><FaMapMarkerAlt className="me-2" /> 12345 Street name, California</p>
                        <p><FaEnvelope className="me-2" /> test@gmail.com</p>
                        <p><FaPhone className="me-2" /> 0595951689</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

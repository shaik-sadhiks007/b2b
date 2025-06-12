import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '../assets/b2bupdate.png';
import Contactus from '../components/Contactus';
const Footer = () => {
    return (
        <footer className="bg-gray-800 py-5">
            <div className="container">
                <div className="row mb-4">
                    <div className="col-md-4 mb-5">
                        <img src={logo} alt="B2B" style={{ height: '30px', width: '30px' }} className="mb-3" />
                        <h6 className="text-uppercase text-white fw-bold mb-3">
                            Your one-stop platform for business services.
                        </h6>
                    </div>

                    <div className="col-md-4 mb-4">
                        <h6 className="text-uppercase text-white fw-bold mb-3">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><a href="/aboutus" className="text-gray-400 hover:text-white">About Us</a></li>
                            <li><a href="/contactus" className="text-gray-400 hover:text-white">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="col-md-4 mb-4">
                        <h6 className="text-uppercase fw-bold mb-3">Contact Us</h6>
                        <ul className="list-unstyled text-white">
                            <li>Email: <a href="mailto:support@b2b.com">support@b2b.com</a></li>
                            <li>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></li>
                            <li>Address: Vijayawada, India</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 
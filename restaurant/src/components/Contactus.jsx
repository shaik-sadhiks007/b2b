import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Contactus = () => {
    return (

        <>
            <div style={{ marginTop: '30px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

                <div className="max-w-2xl w-full bg-white shadow-md rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Contact Us</h1>
                    <div className="space-y-6 text-gray-700">
                        <div className="flex items-start gap-4">
                            <i className="bi bi-geo-alt-fill text-xl text-blue-600"></i>
                            <div>
                                <h2 className="font-semibold">Address</h2>
                                <p>Satyanarayana puram,<br />Vijayawada, Andhra Pradesh - 520011, India</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <i className="bi bi-telephone-fill text-xl text-green-600"></i>
                            <div>
                                <h2 className="font-semibold">Phone</h2>
                                <p>+91 98765 43210</p>
                            </div>

                        </div>
                        <div className="flex items-start gap-4">
                            <i className="bi bi-envelope-fill text-xl text-red-600"></i>
                            <div>
                                <h2 className="font-semibold">Email</h2>
                                <p>
                                    <a href="mailto:info@shopatb2b.com">info@shopatb2b.com</a>
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Contactus;


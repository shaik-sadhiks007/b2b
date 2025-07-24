import React from 'react';
import { useNavigate } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
import { Link } from 'react-router-dom';

const Pantulugarifooter = () => {
  const navigate = useNavigate();

  const handleRestaurantClick = (e) => {
    e.preventDefault();
    const targetWindow = openWindowWithToken(RESTAURANT_URL, ORIGIN_URL);

    if (!targetWindow) {
      navigate('/login');
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-y-10 gap-x-20">
          {/* Column 1: Pantulugari Mess + Powered by B2B */}
          <div>
            <h3 className="text-xl font-bold mb-4">Pantulugari Mess</h3>
           
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.shopatb2b.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  B2B
                </a>
              </li>
              <li>
                <Link to="/aboutb2b" className="text-gray-400 hover:text-white">
                  About B2B
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="mailto:info@shopatb2b.com">Email: info@shopatb2b.com</a>
              </li>
              <li>Phone: 9347798082</li>
              <li>
                Address: Surya grand backside, LRWA No-223, adavi seshagirirao vari veedhi, nehuru bomma
                center, lakshimi nagar, Vijayawada - 520011, Andhra Pradesh
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
             <h2 className="text-xl font-bold mb-4">POWERED BY B2B</h2>
          <p>&copy; {new Date().getFullYear()} B2B. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Pantulugarifooter;

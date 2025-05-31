import React from 'react';
import aboutUsImage from '../assets/bridge.avif';
import logo from '../assets/b2bupdate.png'; // Replace with your own image
import Footer from "./Footer"
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Full-width Banner Image with text overlay */}
      <div className="w-full h-[100vh] relative">
        <img
          src={aboutUsImage}
          alt="About Us Banner"
          className="w-full h-full object-cover"
        />
        {/* Positioned top-left */}
        <h1 className="absolute top-4 left-4 text-white font-bold text-5xl drop-shadow-lg">
          About Us
        </h1>
      </div>

      {/* Main Content Section */}
      <div className="pt-16 px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Section */}
          <div className="md:w-1/2 w-full bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <img
              src={logo}
              alt="About Us"
              className="w-full h-auto rounded-lg shadow"
            />
          </div>

          {/* Right Section with border, shadow and hover */}
          <div
            className="md:w-1/2 w-full p-6 border-l-4 border-gray-400 shadow-md transition duration-300 hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] rounded-md"
            style={{ boxShadow: '4px 0 8px -2px rgba(0, 0, 0, 0.1)' }}
          >
            <p
              className="mb-5 text-xl leading-relaxed text-gray-700 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              <strong className="text-gray-900">B2B</strong> is a platform built for small businesses to post and sell their menu items online. Retail stores, service providers, and farmers can showcase their offerings, allowing customers to browse, add to cart, and order directly—either for pickup or delivery.
            </p>

            <p
              className="mb-5 text-xl leading-relaxed text-gray-700 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              For instance, a farmer can post their produce and reach customers directly, cutting out middlemen and increasing profits. Similarly, electricians can list their services, and customers can reach out without friction.
            </p>

            <p
              className="mb-5 text-xl leading-relaxed text-gray-700 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              Our platform also provides an end-to-end solution for retail stores—handling orders, billing, accounting, inventory, customer and employee management, analytics, and more—all in one affordable system.
            </p>

            <p
              className="mb-6 text-xl leading-relaxed text-gray-700 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              Even wholesalers, distributors, and manufacturers can benefit from our mobile-friendly platform and custom websites tailored to their business needs.
            </p>

            <h2
              className="text-3xl font-bold mb-4 text-gray-800 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              Our Mission
            </h2>
            <p
              className="mb-4 text-xl text-gray-700 italic"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}
            >
              Our mission is to <span className="font-semibold">simplify digital transformation</span> for vendors through intuitive tools and robust platforms.
            </p>

            <ul className="list-disc list-inside text-lg space-y-2 text-gray-700">
              <li>Seamless e-commerce integration</li>
              <li>Customized website development</li>
              <li>Reliable technical support</li>
              <li>Secure and scalable digital infrastructure</li>
            </ul>
          </div>
        </div>

        {/* New User Types Section with border and shadow */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* User Type 1 */}
          <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700 tracking-wide">
              Small Business Owners
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg font-medium">
              <li>Easy-to-use platform to list products or services</li>
              <li>Manage orders and customer interactions efficiently</li>
              <li>Access to analytics and sales reports</li>
              <li>Custom website options tailored to your brand</li>
            </ul>
          </div>

          {/* User Type 2 */}
          <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-4 text-green-700 tracking-wide">
              Customers & Buyers
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg font-medium">
              <li>Browse a wide variety of local products and services</li>
              <li>Seamless ordering </li>
              <li>Secure and easy checkout</li>
              <li>Support small businesses directly in your community</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;

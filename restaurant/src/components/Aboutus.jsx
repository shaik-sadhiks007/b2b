import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import aboutUsImage from '../assets/bridge.avif'; 
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 pt-28 px-8">
    {/* pt-28 pushes content below the navbar */}
    <div className="flex flex-col md:flex-row">
      {/* Left Div */}
      <div className="md:w-1/2 w-full bg-gray-100 p-4">
        <h2 className="text-xl font-semibold mb-2">Bridge 2 Business</h2>
       
        <img
          src={aboutUsImage}  // replace with your image path
          alt="About Us"
          className="w-full h-auto rounded-md shadow"
        />
      </div>

      {/* Right Div */}
      <div className="md:w-1/2 w-full p-4">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>

        <p className="mb-4">
 B2B is a platform designed for the small businesses to post their menu items to sell. For example, a retail store wants to sell the groceries. Different menu items can be added into the platform. Then the customers of the small business can select the menu items, add them to the cart and order them online either to pick up or to get them delivered. It can also be used by the service providers to post their services to display. For example, an electrician can post what he can do. Then the customers can see what the electrician can do and contact him. It can be utilized by the farmers to post what they can produce. Then the customers can see what the farmers can produce, select the products, add them to the cart and order online either to pick up or to get them delivered. This way it is easy for the farmers to post, sell at a higher price to the customers than selling to the distributors, which will be sold to the retailers resulting in higher price for the customers than buying directly from the farmers. This can eliminate the commissions. It can be a win-win situation for both the farmers and the customers. It is a way to bridge the gap in their business. It is essentially a platform to bridge the gap in the small businesses. In addition to that, the retail stores can have an end to end solution to manage their business both instore and online. Instead of using multiple softwares for different needs such as orders, payments, billing, accounting, inventory management, customer management, employee management, what is selling, forecasting, customer spending patterns, promotions etc. all in one software at low cost.

It can also be used by the wholesalers, distributors and manufacturers. All the features can be accessed using a Mobile App. All of them can have their own website with customized customer experience and custom features for their business.
        </p>

        <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
        <p className="mb-2">
    Our mission is to <strong>simplify digital transformation</strong> for vendors by providing them with the tools, platforms, and guidance needed to succeed online.
  </p>
  <ul className="list-disc list-inside space-y-1">
    <li>Seamless e-commerce solutions</li>
    <li>Customized website development</li>
    <li>Reliable technical support</li>
    <li>Scalable and secure digital platforms</li>
  </ul>
      </div>
    </div>

    {/* <div className="flex justify-center mt-8">
  <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
    Contact Us
  </button>
</div> */}
  </div>

  
  );
};

export default AboutUs;
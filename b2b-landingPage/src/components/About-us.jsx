import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
import aboutUsImage from '../images/bridge.avif'; 
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

        <h2 className="text-xl font-semibold mb-2">Our Story</h2>

        <p className="mb-4">
        At B2B, we started with  powerful idea: to empower vendors by helping them establish a strong digital presence. 
        In today’s competitive world, we saw many traditional businesses struggle to adapt to digital trends. 
        That's when we decided to step in — not just as tech partners, but as collaborators in their success journey.
From creating user-friendly e-commerce websites to providing smart digital solutions, we have helped multiple vendors 
expand beyond physical boundaries and thrive in the online market.
        our company has been dedicated to providing exceptional services and products to our customers.
         We believe in innovation, quality, and customer satisfaction above all else.
         Our goal is to make business-to-business operations smoother, faster, and more reliable.
          We help partners grow by offering modern solutions by adding powerful technology.
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

    <div className="flex justify-center mt-8">
  <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
    Contact Us
  </button>
</div>
  </div>

  
  );
};

export default AboutUs;
import React from "react";
import { useEffect } from "react";
import aboutUsImage from "../assets/aboutus.png";
import logo from "../assets/b2bupdate.png";
import { FaArrowDown } from "react-icons/fa";
import { Link } from "react-router-dom"; // Changed from useNavigate to Link
import play from "../assets/play.webp";
import restaurant from "../assets/restaurant.webp";
import mess from "../assets/mess.webp";
import home from "../assets/home.webp";
import textile from "../assets/textile.webp";
import footware from "../assets/footware.webp";
import coffee from "../assets/coffee.webp";
import veg from "../assets/fruits.webp";
import superm from "../assets/superm.webp";
import med from "../assets/med.webp";
import ck from "../assets/ck.webp";
import whole from "../assets/whole.webp";
import Navbar from "./Navbar";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Card data with categories for styling
  const businessTypes = [
    { name: "Supermarket", category: "retail", image: superm },
    { name: "Restaurant", category: "retail", image: restaurant },
    { name: "Coffee Shop", category: "food", image: coffee },
    { name: "Medical Store", category: "retail", image: med },
    { name: "Cloud kitchen", category: "food", image: ck },
    { name: "Textile", category: "manufacturing", image: textile },
    { name: "Play arena", category: "fashion", image: play },
    { name: "Mess", category: "fashion", image: mess },
    { name: "Footwear Shop", category: "fashion", image: footware },
    { name: "Home Appliances", category: "electronics", image: home },
    { name: "Wholesale Business", category: "wholesale", image: whole },
    { name: "Fruits and Vegetables", category: "food", image: veg },
  ];

  // Category-based styling
  const getCategoryStyle = (category) => {
    const baseStyle =
      "w-56 h-40 rounded-xl flex flex-col items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl";

    switch (category) {
      case "retail":
        return `${baseStyle} bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300`;
      case "food":
        return `${baseStyle} bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-300`;
      case "manufacturing":
        return `${baseStyle} bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-300`;
      case "fashion":
        return `${baseStyle} bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:border-pink-300`;
      case "electronics":
        return `${baseStyle} bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:border-yellow-300`;
      case "wholesale":
        return `${baseStyle} bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 hover:border-indigo-300`;
      default:
        return `${baseStyle} bg-white border-2 border-gray-200 hover:border-gray-300`;
    }
  };

  // Split business types into two arrays for two rows
  const firstRow = businessTypes.slice(0, 6);
  const secondRow = businessTypes.slice(6, 12);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div style={{ marginTop: '30px' }}>
        <Navbar />
      </div>
      
      <div className="pt-16 px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Section */}
          <div className="md:w-1/2 w-full bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <img
              src={logo}
              alt="About Us"
              className="w-full h-auto rounded-lg shadow"
            />
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 w-full p-6 border-l-4 border-blue-400 shadow-md transition-all duration-300 hover:border-blue-600 hover:shadow-lg hover:scale-[1.01] rounded-md bg-gradient-to-br from-gray-50 to-white">
            <p className="mb-5 text-xl leading-relaxed text-gray-700">
              <strong className="text-gray-900 font-semibold">B2B</strong> is a
              platform built for small businesses to post and sell their menu
              items online.
            </p>

            {/* ... (rest of your content remains the same) ... */}

          </div>
        </div>

        {/* Business Types Card Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
            Business Types We Support
          </h2>

          {/* First Row */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {firstRow.map((item, index) => (
              <div
                key={index}
                className={`${getCategoryStyle(item.category)} hover:-translate-y-2`}
              >
                <div className="p-4 text-center flex flex-col items-center">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-gray-800 font-medium text-lg">
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap justify-center gap-8">
            {secondRow.map((item, index) => (
              <div
                key={index + 6}
                className={`${getCategoryStyle(item.category)} hover:-translate-y-2`}
              >
                <div className="p-4 text-center flex flex-col items-center">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-gray-800 font-medium text-lg">
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New User Types Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ... (your existing user type sections) ... */}
        </div>

        {/* Floating Know More Button - Now using Link */}
        <div className="flex flex-col items-center justify-center mt-16 mb-10">
          <Link 
            to="/features" 
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <FaArrowDown className="text-white text-2xl animate-bounce" />
            </div>
            <span className="mt-3 text-lg font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
              Know More
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
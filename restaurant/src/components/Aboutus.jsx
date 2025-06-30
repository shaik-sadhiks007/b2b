import React from "react";
import { useEffect } from "react";
import aboutUsImage from "../assets/aboutus.png";
import logo from "../assets/b2bupdate.png";
import { FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Features from "../components/Features";
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
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const scrollToNextSection = () => {
    navigate("/features");
  };

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
      "w-56 h-40 rounded-xl flex flex-col items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl ";

    switch (category) {
      case "retail":
        return (
          baseStyle +
          "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300"
        );
      case "food":
        return (
          baseStyle +
          "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-300"
        );
      case "manufacturing":
        return (
          baseStyle +
          "bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-300"
        );
      case "fashion":
        return (
          baseStyle +
          "bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 hover:border-pink-300"
        );
      case "electronics":
        return (
          baseStyle +
          "bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:border-yellow-300"
        );
      case "wholesale":
        return (
          baseStyle +
          "bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 hover:border-indigo-300"
        );
      default:
        return (
          baseStyle + "bg-white border-2 border-gray-200 hover:border-gray-300"
        );
    }
  };

  // Split business types into two arrays for two rows
  const firstRow = businessTypes.slice(0, 6);
  const secondRow = businessTypes.slice(6, 12);

  return (
    <div className="min-h-screen bg-white text-gray-800 mt-8">
      {/* Main Content Section */}
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
              items online. Retail stores, service providers, and farmers can
              showcase their offerings, allowing customers to browse, add to
              cart, and order directly—either for pickup or delivery.
            </p>

            <p className="mb-5 text-xl leading-relaxed text-gray-700">
              For instance, a farmer can post their produce and reach customers
              directly, cutting out middlemen and increasing profits. Similarly,
              electricians can list their services, and customers can reach out
              without friction.
            </p>

            <p className="mb-5 text-xl leading-relaxed text-gray-700">
              Our platform also provides an end-to-end solution for retail
              stores—handling orders, billing, accounting, inventory, customer
              and employee management, analytics, and more—all in one affordable
              system.
            </p>

            <p className="mb-6 text-xl leading-relaxed text-gray-700">
              Even wholesalers, distributors, and manufacturers can benefit from
              our mobile-friendly platform and custom websites tailored to their
              business needs.
            </p>

            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Our Mission
            </h2>
            <p className="mb-4 text-xl text-gray-700">
              Our mission is to{" "}
              <span className="font-semibold text-blue-600">
                simplify digital transformation
              </span>{" "}
              for vendors through intuitive tools and robust platforms.
            </p>

            <ul className="list-disc list-inside text-lg space-y-2 text-gray-700">
              <li className="hover:text-blue-600 transition-colors duration-200">
                Seamless e-commerce integration
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Customized website development
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Reliable technical support
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Secure and scalable digital infrastructure
              </li>
            </ul>
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
                className={
                  getCategoryStyle(item.category) + " hover:-translate-y-2"
                }
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
                className={
                  getCategoryStyle(item.category) + " hover:-translate-y-2"
                }
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">
              Business Owners
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
              <li className="hover:text-blue-600 transition-colors duration-200">
                Easy-to-use platform to list products or services
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Manage orders and customer interactions efficiently
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Access to analytics and sales reports
              </li>
              <li className="hover:text-blue-600 transition-colors duration-200">
                Custom website options tailored to your brand
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-4 text-green-700">
              Customers
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
              <li className="hover:text-green-600 transition-colors duration-200">
                Browse a wide variety of local products and services
              </li>
              <li className="hover:text-green-600 transition-colors duration-200">
                Seamless ordering
              </li>
              <li className="hover:text-green-600 transition-colors duration-200">
                Secure and easy checkout
              </li>
              <li className="hover:text-green-600 transition-colors duration-200">
                Support small businesses directly in your community
              </li>
            </ul>
          </div>
        </div>

        {/* Floating Know More Button */}
        <div className="flex flex-col items-center justify-center mt-16 mb-10">
          <button
            onClick={scrollToNextSection}
            className="flex flex-col items-center justify-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <FaArrowDown className="text-white text-2xl animate-bounce" />
            </div>
            <span className="mt-3 text-lg font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
              Know More
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
import React, { useState, useEffect } from 'react';
import aboutUsImage from '../assets/aboutus.png';
import logo from '../assets/b2bupdate.png'; 
import Footer from '../components/Footer';
import Header from '../components/Header';
import billing from '../assets/billing.png';
import website from '../assets/website.png';
import order from '../assets/order-management.png';
import promotion from '../assets/promotion.png';
import telugu from '../assets/telugu.webp';
import inventory from '../assets/inventory.png';
import da from '../assets/da.png';
import book from '../assets/kathabook.png';
import review from '../assets/review.png';
import person from '../assets/person.webp';
import emp  from '../assets/emp.png';
import pay from '../assets/pay.avif';
const teamMembers = [
  { name: "Digitalize your business", image: website },
  { name: "Customise your local language", image: telugu },
  { name: "Order management", image: order },
  { name: "Inventory management", image: inventory },
  { name: "Instore Billing", image: billing },
  { name: "Payment and Delivery*", image: pay },
  { name: "Promotions*", image: promotion },
  { name: "Khata Book*", image: book },
  { name: "Know your business*", image: da },
  { name: "Feedbacks and ratings*", image: review },
  { name: "Employee management*", image: emp },
  { name: "Billing & accounting*", image: billing },

];

const benefits = [
  "Customise to your business needs",
  "Digitalize your business",
  "Increase customer reach",
  "Edit and manage your products",
  "Increase sales",
  "High value",
  "Low cost",
  "No custoner waiting",
];

const Features = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />

      {/* Banner Section - Improved responsive behavior */}
      <div className="w-full h-[40vh] sm:h-[50vh] md:h-[70vh] lg:h-[100vh] relative">
        <img
          src={aboutUsImage}
          alt="About Us Banner"
          className="w-full h-full object-cover"
        />
        <h1 className="absolute top-4 left-4 text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
          About Us
        </h1>
      </div>

      {/* Main Content */}
      <div className="pt-6 md:pt-12 lg:pt-16 px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Features Section */}
        <div className="mt-8 md:mt-16 lg:mt-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-blue-700">
            Key features
          </h2>
          <h6 className="text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8 md:mb-10 text-gray-600">* features are coming soon</h6>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow hover:shadow-md transition text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 object-contain"
                />
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                  {member.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More About Features Section */}
      <div className="mt-8 md:mt-14 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-blue-700">
          More About Our Features
        </h2>

        {/* Feature Items - Improved responsive layout */}
        {[
          {
            title: "Digitalize your business",
            image: website,
            content: (
              <>
                Showcase your products and services on our website that reflects your brand identity. Reach more customers and grow your business with an easy-to-navigate, mobile-friendly design.
                <ul className="mt-2 space-y-1">
                  <li>• Enhance your customer experience</li>
                  <li>• Automate processes</li>  
                  <li>• Know your customers</li>
                  <li>• Have your store presence everywhere</li>
                </ul>
              </>
            ),
            reverse: false
          },
          {
            title: "Customise your local language",
            image: telugu,
            content: "Reach a wider audience by personalizing your platform in your local language. This feature enables businesses to connect better with local customers, making the shopping experience more comfortable and relatable. Break language barriers, enhance customer trust, and boost engagement by offering services in the language your customers speak daily.",
            reverse: true
          },
          {
            title: "Inventory Management",
            image: inventory,
            content: (
              <>
                Inventory Management helps businesses track stock levels in real-time, ensuring products are always available for customers. It reduces overstocking, minimizes shortages, and streamlines reordering processes.
                <ul className="mt-2 space-y-1">
                  <li>• Avoids stockouts and overstocking</li>
                  <li>• Reduces storage costs</li>
                  <li>• Improves cash flow</li>
                  <li>• Increases customer satisfaction</li>
                  <li>• Helps make better business decisions</li>
                </ul>
              </>
            ),
            reverse: false
          },
          {
            title: "Order Management",
            image: order,
            content: (
              <>
                Efficiently handle all your customer orders with real-time updates, stock control, and easy order tracking.
                <ul className="mt-2 space-y-1">
                  <li>• Streamlines order processing</li>
                  <li>• Reduces errors and delays</li>
                  <li>• View order history</li>
                  <li>• Provides real-time order tracking</li>
                  <li>• Improves inventory accuracy</li>
                  <li>• Facilitates better communication with customers</li>
                </ul>
              </>
            ),
            reverse: true
          },
           {
            title: "Instore Billing",
            image: billing,
            content: "In-store Billing feature enables quick and seamless checkout experiences for customers within a physical store. It allows staff to generate accurate bills using barcode scanning, apply discounts or offers, calculate taxes automatically, and accept multiple payment methods including cash, cards, and digital wallets. Integrated with the inventory system, it updates stock levels in real-time, preventing discrepancies. This feature reduces billing errors, speeds up transaction time, and improves customer satisfaction. It also supports printed and digital receipts, return processing, and bill history tracking. In-store billing is essential for efficient retail operations and ensures a smooth end-to-end sales process.",

            reverse: false
          },
          {
            title: "Payment and Delivery*",
            image: pay,
            content: "The **Payment and Delivery** feature ensures a smooth and secure transaction process from order placement to final delivery. Customers can choose from multiple payment options, including cash on delivery, credit/debit cards, UPI, and digital wallets. All payments are processed through secure gateways, ensuring data privacy. Once payment is confirmed, the delivery process is initiated, offering options like standard, express, or same-day delivery. Real-time tracking keeps customers informed of their order status. This feature enhances customer trust, reduces delays, and improves satisfaction by offering flexibility, transparency, and convenience in both payment and delivery services.",
            reverse: true
          },
          {
            title: "Promotions*",
            image: promotion,
            content: "Boost your sales with targeted promotions and discounts. Easily create offers, seasonal deals, and limited-time discounts to attract new customers and retain existing ones. The promotions feature helps increase visibility, drive customer engagement, and maximize revenue, all while giving you full control over your marketing campaigns.",
            reverse: false
          },
         
          {
            title: "Khata book*",
            image: book,
            content: "The Khatha Page feature helps businesses manage customer credit easily. When a customer makes a purchase but pays only a partial amount, the remaining balance is recorded in the Khatha Book. This balance can be paid later in one or multiple installments. Each payment made by the customer updates the outstanding amount automatically. The system keeps a clear record of all pending amounts, payment dates, and transaction history, ensuring transparency and easy tracking.",
            reverse: true
          },
          {
            title: "Know your business*",
            image: da,
            content: (
              <>
                Data Analytics empowers businesses to make informed decisions by analyzing customer behavior, sales trends, and inventory performance.
                <ul className="mt-2 space-y-1">
                  <li>• Track sales performance</li>
                  <li>• Analyze customer spending patterns</li>
                  <li>• Identify trends and patterns with live dashboards</li>
                  <li>• Mosted visisted products and services data</li>
                  <li>• Improve marketing strategies</li>
                  <li>• Track customer visits</li>
                  <li>• Boost overall business performance</li>
                  <li>• Forecasting future growth</li>
                </ul>
              </>
            ),
            reverse: false
          },
          {
            title: "Feedback and ratings*",
            image: review,
            content: "Feedback and Ratings allow customers to share their experiences, helping businesses improve services and build trust. Positive reviews attract more customers, while constructive feedback highlights areas for growth. This transparency boosts credibility, enhances customer satisfaction, and creates a loyal community that supports continuous business improvement and long-term success.",
            reverse: true
          },
          {
            title: "Employee Management*",
            image: emp,
            content: (
              <>
                The Employee Management feature streamlines the process of handling employee records and operations. It allows administrators to add, edit, or remove employee profiles, assign roles and responsibilities, track attendance, monitor performance, and manage payroll efficiently. With centralized access, it ensures transparency, accountability, and real-time updates. This feature helps businesses optimize workforce productivity by offering insights into employee performance and simplifying HR tasks. It also includes leave tracking, shift scheduling, and communication tools to keep teams connected and aligned. Overall, the employee management feature reduces administrative burden and boosts organizational efficiency through smart automation and data-driven decision-making.


              </>
            ),
            reverse: false
          },
           {
            title: "Billing & accounting*",
            image: billing,
            content: "Our Billing and Accounting feature simplifies financial management by automating invoice generation, payment tracking, and expense monitoring. It ensures accurate record-keeping, reduces manual errors, and provides detailed financial reports. Small businesses can efficiently manage cash flow, monitor profitability, and maintain transparency, enabling smarter financial decisions and streamlined business operations. we can also genewrate GST reports and other tax-related documents, ensuring compliance with local regulations and also profit and loss satements",
            reverse: true
          },

        ].map((feature, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 items-center`}
          >
            <div className="w-full md:w-1/2 p-2 sm:p-3 md:p-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                {feature.content}
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto rounded-lg shadow-md object-contain" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pb-8 sm:pb-12 md:pb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-blue-700">
          Benefits of Using B2B
        </h2>

        {/* Circular Benefits - Improved responsive behavior */}
        <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] h-[90vw] max-h-[300px] sm:max-h-[400px] md:max-h-[500px] mx-auto mb-12 sm:mb-20 md:mb-28">
          {/* Center Avatar */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <img
              src={person}
              alt="You"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border-4 border-blue-500 object-cover"
            />
            <p className="text-center text-xs sm:text-sm md:text-base lg:text-lg font-semibold mt-1 sm:mt-2">
              Business Owner
            </p>
          </div>

          {/* Circular Benefits */}
          {benefits.map((benefit, index) => {
             const isMobile = windowWidth < 768;
            const radius = isMobile ? 150 : 200;
            const centerX = isMobile ? 180 : 250;
            const centerY = isMobile ? 180 : 250;
            const angle = (index / benefits.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle) - (isMobile ? 40 : 60);
            const y = centerY + radius * Math.sin(angle) - (isMobile ? 20 : 30);
            return (
              <div
                key={index}
                className="absolute text-[10px] xs:text-xs sm:text-sm md:text-base font-medium text-center bg-white p-1 sm:p-2 md:p-3 rounded-full shadow hover:scale-105 transition-all duration-200"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: isMobile ? '70px' : windowWidth < 1024 ? '90px' : '110px',
                  height: isMobile ? '70px' : windowWidth < 1024 ? '90px' : '110px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {benefit}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
import React from 'react';
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
const teamMembers = [
  { name: "Digitalize your business", image: website },
  { name: "Customise your local language", image: telugu },
  { name: "Order management", image: order },
  { name: "Inventory management", image: inventory },
  { name: "Promotions", image: promotion },
  { name: "Billing & accounting", image: billing },
  { name: "Khata Book", image: book },
  { name: "Data analytics", image: da },
  { name: "Feedbacks and ratings", image: review },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />

      {/* Banner Section */}
      <div className="w-full h-[100vh] relative">
        <img
          src={aboutUsImage}
          alt="About Us Banner"
          className="w-full h-full object-cover"
        />
        <h1 className="absolute top-4 left-4 text-white font-bold text-5xl drop-shadow-lg">
          About Us
        </h1>
      </div>

      {/* Main Content */}
      <div className="pt-16 px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Logo Section */}
          <div className="md:w-1/2 w-full bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <img
              src={logo}
              alt="About Us"
              className="w-full h-auto rounded-lg shadow"
            />
          </div>

          {/* Text Section */}
          <div
            className="md:w-1/2 w-full p-6 border-l-4 border-gray-400 shadow-md transition duration-300 hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] rounded-md"
            style={{ boxShadow: '4px 0 8px -2px rgba(0, 0, 0, 0.1)' }}
          >
            <p className="mb-5 text-xl leading-relaxed text-gray-700 italic" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}>
              <strong className="text-gray-900">B2B</strong> is a platform built for small businesses to post and sell their menu items online. Retail stores, service providers, and farmers can showcase their offerings, allowing customers to browse, add to cart, and order directly—either for pickup or delivery.
            </p>
            <p className="mb-5 text-xl leading-relaxed text-gray-700 italic" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}>
              For instance, a farmer can post their produce and reach customers directly, cutting out middlemen and increasing profits. Similarly, electricians can list their services, and customers can reach out without friction.
            </p>

            <p className="mb-5 text-xl leading-relaxed text-gray-700 italic" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}>
              <p className="mb-5 text-xl leading-relaxed text-gray-700 italic" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}>
              For instance, a farmer can post their produce and reach customers directly, cutting out middlemen and increasing profits. Similarly, electricians can list their services, and customers can reach out without friction.
            </p>
            </p>
            <p className="text-xl leading-relaxed text-gray-700 italic" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.15)' }}>
              Our goal is to empower local businesses by giving them access to digital tools without requiring any technical knowledge. With local language support, order tracking, invoicing, and promotion options, B2B is your all-in-one partner in growth.
            </p>
          </div>
        </div>
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

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">Key features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-lg transition text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 mx-auto mb-4 object-contain"
                />
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* New Section: Image with Description */}
<div className="mt-20">
  <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">More About Our Features</h2>

  {/* Example Item */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Digitalize your business</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Showcase your products and services on website that reflects your brand identity. Reach more customers and grow your business with an easy-to-navigate, mobile-friendly design.
        <ul>
          <li className="mt-2">Enhance your customer experience</li>
          <li className="mt-2">Automate processes</li>  
          <li className="mt-2">Know your customers</li>
          <li className="mt-2">Have your store presence everywhere</li>
            
        </ul>
      </p>
    </div>

    {/* Right Image Section */}
    <div className="flex justify-center">
      <img src={website} alt="Customised Website Display" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>
  </div>

  {/* Example Item 2 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="flex justify-center">
      <img src={telugu} alt="Order Management" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>

    {/* Right Image Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Customise your local language</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Reach a wider audience by personalizing your platform in your local language. This feature enables businesses to connect better with local customers, making the shopping experience more comfortable and relatable. Break language barriers, enhance customer trust, and boost engagement by offering services in the language your customers speak daily.
       
      </p>
    </div>
  </div>

   {/* Example Item 3 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Inventory Management</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Inventory Management helps businesses track stock levels in real-time, ensuring products are always available for customers. It reduces overstocking, minimizes shortages, and streamlines reordering processes. With accurate inventory data, businesses can make informed decisions, improve efficiency, save costs, and enhance customer satisfaction through timely order fulfillment and better resource utilization.
         <ul>
          <li className="mt-2">Avoids stockouts and overstocking</li>
          <li className="mt-2">Reduces storage costs</li>
          <li className="mt-2">Improves cash flow</li>
          <li className="mt-2">Increases customer satisfaction</li>
          <li className="mt-2">Helps make better business decisions</li>
        </ul>
      </p>
    </div>

    {/* Right Image Section */}
    <div className="flex justify-center">
      <img src={inventory} alt="Customised Website Display" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>
  </div>

   {/* Example Item 4*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="flex justify-center">
      <img src={order} alt="Order Management" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>

    {/* Right Image Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Order Management</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Efficiently handle all your customer orders with real-time updates, stock control, and easy order tracking. Never miss a sale and always deliver on time.
        Order Management streamlines the entire order process, from placement to delivery, ensuring a smooth experience for both businesses and customers. It helps reduce errors, improve fulfillment speed, and enhance customer satisfaction by providing transparency and reliability in order handling.
        <ul>
          <li className="mt-2">Streamlines order processing</li>
          <li className="mt-2">Reduces errors and delays</li>
          <li className="mt-2">View order history</li>
          <li className="mt-2">Provides real-time order tracking</li>
          <li className="mt-2">Improves inventory accuracy</li>
          <li className="mt-2">Facilitates better communication with customers</li>
        </ul>
      </p>
    </div>
  </div>

   {/* Example Item 5*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Promotions</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Boost your sales with targeted promotions and discounts. Easily create offers, seasonal deals, and limited-time discounts to attract new customers and retain existing ones. The promotions feature helps increase visibility, drive customer engagement, and maximize revenue, all while giving you full control over your marketing campaigns.
      </p>
    </div>

    {/* Right Image Section */}
    <div className="flex justify-center">
      <img src={promotion} alt="Customised Website Display" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>
  </div>

     {/* Example Item 6*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="flex justify-center">
      <img src={billing} alt="Order Management" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>

    {/* Right Image Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Billing & accounting</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Our Billing and Accounting feature simplifies financial management by automating invoice generation, payment tracking, and expense monitoring. It ensures accurate record-keeping, reduces manual errors, and provides detailed financial reports. Small businesses can efficiently manage cash flow, monitor profitability, and maintain transparency, enabling smarter financial decisions and streamlined business operations.
      </p>
    </div>
  </div>

  
   {/* Example Item 7*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Khata book</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        The Khatha Book feature helps businesses manage customer credit easily. When a customer makes a purchase but pays only a partial amount, the remaining balance is recorded in the Khatha Book. This balance can be paid later in one or multiple installments. Each payment made by the customer updates the outstanding amount automatically. The system keeps a clear record of all pending amounts, payment dates, and transaction history, ensuring transparency and easy tracking. Business owners can send payment reminders, generate reports, and maintain healthy cash flow while offering flexible payment options to their trusted customers. This builds stronger customer relationships.


      </p>
    </div>

    {/* Right Image Section */}
    <div className="flex justify-center">
      <img src={book} alt="Customised Website Display" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>
  </div>

      {/* Example Item 8*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="flex justify-center">
      <img src={da} alt="Order Management" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>

    {/* Right Image Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Know your business</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Data Analytics empowers businesses to make informed decisions by analyzing customer behavior, sales trends, and inventory performance. With real-time insights, businesses can optimize operations, forecast demand, and identify growth opportunities. This feature transforms raw data into actionable intelligence, helping businesses stay competitive, efficient, and customer-focused in a dynamic market.
        <ul>
          <li className="mt-2">Track sales performance</li>
          <li className="mt-2">Analyze customer behavior</li>
          <li className="mt-2">Identify trends and patterns with live dashboards</li>
          <li className="mt-2">Make data-driven decisions</li>
          <li className="mt-2">Improve marketing strategies</li>
          <li className="mt-2">Enhance operational efficiency</li>
          <li className="mt-2">Boost overall business performance</li>
          <li className="mt-2">Compare and improve</li>

        </ul>
      </p>
    </div>
  </div>

  {/* Example Item 9*/}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
    {/* Left Text Section */}
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Feedback and ratings</h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Feedback and Ratings allow customers to share their experiences, helping businesses improve services and build trust. Positive reviews attract more customers, while constructive feedback highlights areas for growth. This transparency boosts credibility, enhances customer satisfaction, and creates a loyal community that supports continuous business improvement and long-term success.
        This valuable feedback helps businesses understand customer satisfaction, identify areas for improvement, and maintain quality standards. Positive ratings can boost credibility and attract new customers, while constructive criticism guides businesses in enhancing their offerings. Over time, consistent feedback collection builds trust, improves customer loyalty, and supports data-driven decision-making to grow and strengthen the business effectively.
      </p>
    </div>

    {/* Right Image Section */}
    <div className="flex justify-center">
      <img src={review} alt="Customised Website Display" className="w-80 h-auto rounded-lg shadow-lg" />
    </div>
  </div>
  

  {/* You can continue adding more sections similarly for other features */}
</div>


      <Footer />
    </div>
  );
};

export default AboutUs;

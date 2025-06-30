import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import aboutUsImage from '../assets/aboutus.png';
import location from '../assets/location.jpg';
import order from '../assets/order.webp';
import search from '../assets/searchp.png';
import track from '../assets/track.webp';
import history from '../assets/history.avif';
import website from '../assets/website.png';
import book from '../assets/kathabook.png';
import pay from '../assets/pay.avif';
import review from '../assets/review.jpeg';
import cancel from '../assets/cancel.webp';
import delivery from '../assets/delivery.avif';
import support from '../assets/support.webp';
import person from '../assets/person.jpg';

const teamMembers = [
  { name: "Website", image: website },
  { name: "Add Location", image: location },
  { name: "Search products", image: search },
  { name: "Order products", image: order },
  { name: "Track your order", image: track },
  { name: "View Order History", image: history },
  { name: "Khata Book*", image: book },
  { name: "Pay Online*", image: pay },
  { name: "Reviews & Feedbacks*", image: review },
  { name: "Cancel & easy returns*", image: cancel },
  { name: "Door step Delivery*", image: delivery },
  { name: "Support", image: support },
];

const benefits = [
  "View available products",
  "View in telugu",
  "Track your orders",
  "Best user experience",
  "Make order reservations",
  "No waiting at stores",
  "Multi store application",
  "Order online",
];

const Features = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
     window.scrollTo(0, 0);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="features">
      {/* Hero Banner Section */}
      <div className="w-full h-[40vh] sm:h-[50vh] md:h-[70vh] lg:h-[100vh] relative">
        <img
          src={aboutUsImage}
          alt="About Us Banner"
          className="w-full h-full object-cover"
        />
        <h1 className="absolute top-4 left-4 text-white font-bold text-3xl md:text-5xl drop-shadow-lg">
          About Us
        </h1>
      </div>

      {/* Features Section */}
      <div className="mt-10 md:mt-20 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-blue-700">
          Key features
        </h2>
        <h6 className="text-sm md:text-xl text-center mb-6 md:mb-10 text-gray-600">
          * features are upcoming ones
        </h6>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-2 md:p-4 rounded-lg md:rounded-xl shadow hover:shadow-lg transition text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 object-contain"
              />
              <h3 className="text-xs md:text-lg font-semibold text-gray-800">
                {member.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* More About Features Section */}
      <div className="mt-10 md:mt-20 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-blue-700">
          More About Our Features
        </h2>

        {/* Feature Items */}
        {[
          {
            title: "Multi store application",
            description: "B2B allows customers to access multiple stores or sellers through a single platform, offering a wide range of products and services in one place. It enhances convenience by enabling users to browse, compare, and purchase items from different vendors without switching apps. Customers benefit from a unified cart, secure checkout, and order tracking across all stores. Filters and search options make it easy to find specific products. Additionally, users can view store ratings and reviews, ensuring informed decisions. Overall, the multi-store feature provides a seamless, time-saving shopping experience with diverse choices and centralized management of orders.",
            image: website,
            reverse: false,
          },
          {
            title: "Location",
            description: "The 'Save Your Default Location' feature allows customers to quickly set and save their preferred delivery address, making future checkouts faster and more convenient. Once set, the app automatically selects the default location for deliveries, reducing the need to re-enter address details each time. Additionally, users have the flexibility to order for other locations as needed—whether it's for friends, family, or work—by simply selecting or entering a new address during checkout. This dual convenience ensures a smooth and efficient ordering process, catering to both regular personal use and one-time orders for other locations",
            image: location,
            reverse: true,
          },
          {
            title: "Search Products",
            description: "You can Search Products quickly and find exactly what they need by typing keywords into the search bar. It streamlines the shopping experience by displaying relevant results instantly, saving time and effort. Users can filter search results by category, price, rating, or availability, making it easier to narrow down choices. This feature also includes smart suggestions and autocomplete to guide users toward popular or matching items. Whether browsing broadly or looking for something specific, the product search feature enhances convenience and ensures you discover and access their desired products with ease and accuracy.",
            image: search,
            reverse: false,
          },
          {
            title: "Order online",
            description: "you can 'Order Online' from the comfort of your home using the our web app With just a few clicks, you can browse available products or services, add items to their cart, and complete the purchase securely. This feature eliminates the need to visit physical stores, saving time and effort. Customers also receive real-time order updates, including confirmation, dispatch. The seamless online ordering experience ensures convenience, accessibility, and speed, making shopping more user-friendly and efficient, especially for those with busy lifestyles or limited mobility.",
            image: order,
            reverse: true,
          },
          {
            title: "Track your orders",
            description: "You can Track Order to monitor the status of their order in real-time from the moment it is placed until it is prepared and ready for pickup. Customers receive updates such as order confirmation, processing, and readiness for collection. This feature ensures transparency and keeps users informed, reducing uncertainty and wait-time anxiety. Ideal for pickup-based or store-collection models, it allows users to plan accordingly and collect their order at the right time. It enhances the overall user experience by offering visibility and control without the need for delivery logistics.",
            image: track,
            reverse: false,
          },
          {
            title: "History",
            description: "The 'Order History' feature provides customers with a detailed record of all their past purchases within the app. Users can view previous orders, including product details, store names, order dates. This helps in quickly reordering favorite items without having to search again. It also serves as a reference for returns, complaints, or tracking spending habits. The organized and accessible order history enhances user convenience, supports better decision-making, and adds transparency to the shopping experience, making it easier for customers to manage and review their past transactions anytime.",
            image: history,
            reverse: true,
          },
          {
            title: "Khata Book*",
            description: "The 'Khata Page' feature allows customers to purchase or borrow products on credit, with the due amount recorded securely within the app. This traditional credit system is digitized to offer flexibility, especially for trusted and repeat customers. Each transaction is logged with clear details such as product name, quantity, date, and total due. Customers can view their outstanding balance anytime and make payments later through the app or in person. This feature fosters trust between stores and customers while ensuring transparency and easy repayment tracking. It's especially useful for local businesses aiming to offer personalized, credit-based shopping experiences.",
            image: book,
            reverse: false,
          },
          {
            title: "Pay online*",
            description: "The 'Pay Online' feature allows customers to complete their purchases quickly and securely through digital payment methods. It supports various options like UPI, credit/debit cards, net banking, and digital wallets, offering flexibility and convenience. This feature eliminates the need for cash handling, making the transaction process faster and more hygienic. Customers receive instant payment confirmation and digital receipts for their records. With encryption and secure gateways, the platform ensures safe transactions. 'Pay Online' enhances the overall shopping experience by making checkouts smoother, encouraging quicker order processing, and building trust through transparent and efficient payment solutions.",
            image: pay,
            reverse: true,
          },
          {
            title: "Reviews and feedbacks*",
            description: "The 'Reviews and Feedback' feature allows customers to share their experiences with products and stores after making a purchase. By leaving ratings and written feedback, users help others make informed decisions. This transparency builds trust within the platform, encouraging quality service from store owners. Positive reviews boost a store's credibility, while constructive feedback helps vendors improve their offerings. Customers can view ratings before placing orders, ensuring better choices. The feature promotes accountability, enhances user satisfaction, and creates a sense of community. Overall, it plays a crucial role in maintaining service standards and continuously improving the multi-store experience for everyone.",
            image: review,
            reverse: false,
          },
          {
            title: "Cancel & Easy returns*",
            description: "The 'Cancel and Easy Returns' feature offers customers flexibility and peace of mind while shopping. If a customer changes their mind they can easily cancel their order before it is processed. If they receive a product that is defective or not as expected, they can initiate a return request. The process is simple, with clear instructions and minimal steps through the web app. Refunds or replacements are processed promptly after verification. This feature builds trust and confidence, encouraging users to shop without hesitation. By prioritizing customer satisfaction, the platform ensures a smooth, reliable, and customer-friendly shopping experience from start to finish.",
            image: cancel,
            reverse: true,
          },
          {
            title: "Door step Delivery*",
            description: "The 'Doorstep Delivery' feature offers customers the convenience of receiving their orders directly at their preferred address. It eliminates the need to travel or pick up items, saving time and effort. Once an order is placed, the store processes it and a delivery partner brings it right to the customer's door. Real-time tracking and delivery updates ensure transparency and reliability. This feature is especially beneficial for busy individuals, elderly customers, or those with mobility issues. By providing fast, safe, and hassle-free delivery, the platform enhances the overall shopping experience and increases customer satisfaction and loyalty.",
            image: delivery,
            reverse: false,
          },
          {
            title: "Support",
            description: "The 'Support' feature provides customers with timely help and guidance whenever they face issues or have questions. It includes options like live chat, email support and helpline numbers, ensuring users can reach out easily. Whether it's about order status, payment issues, returns, or app navigation, the support team is available to assist and resolve concerns efficiently. Quick and responsive customer support enhances user satisfaction and builds trust in the platform. It also helps store owners by addressing customer problems swiftly, ensuring smooth operations. Overall, the support feature ensures a reliable and stress-free shopping experience for all users.",
            image: support,
            reverse: true,
          },
        ].map((feature, index) => (
          <div
            key={index}
            className={`grid grid-cols-1 ${
              feature.reverse ? 'md:grid-cols-2' : 'md:grid-cols-2'
            } gap-6 mb-10 md:mb-16 items-center`}
          >
            {/* Text Section - order changes based on reverse prop */}
            <div
              className={`p-4 md:p-6 ${
                feature.reverse ? 'md:order-2' : 'md:order-1'
              }`}
            >
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">
                {feature.title}
              </h3>
              <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Image Section */}
            <div
              className={`flex justify-center ${
                feature.reverse ? 'md:order-1' : 'md:order-2'
              }`}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="w-48 h-48 md:w-80 md:h-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
        ))}

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-blue-700">
          Benefits of Using B2B
        </h2>
      </div>

      {/* Circular Benefits Section */}
      <div className="mt-16 md:mt-32 px-4 flex justify-center items-center">
        <div className="relative w-[90vw] max-w-[500px] h-[90vw] max-h-[500px] mx-auto mb-16 md:mb-32">
          {/* Center Avatar */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <img
              src={person}
              alt="You"
              className="w-24 h-24 md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] rounded-full border-4 border-blue-500 object-cover"
            />
            <p className="text-center text-base md:text-lg lg:text-xl font-semibold mt-2">
              Users
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
                className="absolute text-xs sm:text-sm md:text-base lg:text-lg font-bold text-center bg-white p-2 md:p-4 rounded-full shadow-lg w-24 md:w-40 lg:w-44 transition hover:scale-105"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  fontSize: isMobile ? '0.7rem' : '',
                }}
              >
                {benefit}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;
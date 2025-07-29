import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package } from 'lucide-react';

const menuItems = [
  { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Package size={20} />, label: 'Orders', path: '/orders' },
  { icon: <Package size={20} />, label: 'My Orders', path: '/my-orders' },
  { icon: <Package size={20} />, label: 'Completed Orders', path: '/completed-orders' },
  // Add more items as needed
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="bg-white h-screen w-64 p-4 flex flex-col">
      <div className="flex-1">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 font-medium transition-colors duration-200 ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar; 
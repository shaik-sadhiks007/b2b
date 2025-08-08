import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutThunk } from '../redux/slices/authSlice';

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const baseMenuItems = [
    {
      name: 'Delivery Partners',
      icon: <Truck className="w-5 h-5" />,
      path: '/admin/delivery-partners',
      description: 'Manage delivery partners'
    },
    {
      name: 'Available Orders',
      icon: <Truck className="w-5 h-5" />,
      path: '/admin/available-orders',
      description: 'All unassigned orders'
    },
    {
      name: 'Statistics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin/stats',
      description: 'View delivery statistics'
    },
    {
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings',
      description: 'Admin settings'
    }
  ];

  // If inside a specific partner context, show partner-specific menu
  const partnerMatch = location.pathname.match(/^\/admin\/delivery-partners\/([^\/]+)/);
  const partnerId = partnerMatch ? partnerMatch[1] : null;

  const partnerMenuItems = partnerId ? [
    {
      name: 'Overview',
      icon: <Users className="w-5 h-5" />,
      path: `/admin/delivery-partners/${partnerId}`,
      description: 'Partner overview'
    },
    {
      name: 'Active Orders',
      icon: <Truck className="w-5 h-5" />,
      path: `/admin/delivery-partners/${partnerId}/orders`,
      description: 'Current assigned orders'
    },
    {
      name: 'Completed Orders',
      icon: <BarChart3 className="w-5 h-5" />,
      path: `/admin/delivery-partners/${partnerId}/completed-orders`,
      description: 'Delivered orders'
    },
  ] : [];

  const menuItems = partnerId ? partnerMenuItems : baseMenuItems;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-500">Delivery Management</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

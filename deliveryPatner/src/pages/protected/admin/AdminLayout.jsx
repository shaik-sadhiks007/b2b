import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminRoute from '../../../components/AdminRoute';

const AdminLayout = () => {
  return (
    <AdminRoute>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="min-h-screen bg-gray-50">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;

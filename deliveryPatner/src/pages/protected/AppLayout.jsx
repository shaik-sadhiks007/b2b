import React, { useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { fetchProfileThunk } from '../../redux/slices/authSlice';

const AppLayout = () => {
  
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - Only visible on lg screens and up */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout; 
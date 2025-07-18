import React, { useEffect, useState, useContext } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AdminSidebar from './AdminSidebar';
import { toast } from 'react-toastify';
import { MenuProvider } from '../context/MenuContext';

const AdminBusinessDashboard = () => {
    const { user } = useContext(AuthContext);
    const { ownerId } = useParams();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            navigate('/');
            return;
        }
        if (!ownerId) {
            toast.error('No ownerId provided');
            navigate('/business');
            return;
        }
        const fetchBusiness = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/restaurants/admin/profile-by-owner`, {
                    params: { ownerId },
                    withCredentials: true
                });
                setBusiness(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch business profile');
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [user, ownerId, navigate]);

    console.log(business,'bus in dash')

    if (!user || user.role !== 'admin') {
        return <div>Access denied. Admin privileges required.</div>;
    }

    if (loading) {
        return <div className="p-4">Loading business dashboard...</div>;
    }

    if (!business) {
        return <div className="p-4">Business not found.</div>;
    }

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <AdminSidebar />
            </div>
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Wrap Outlet in MenuProvider so useParams works for menu context */}
                        <MenuProvider>
                          <Outlet context={{ ownerId, business }} />
                        </MenuProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBusinessDashboard; 
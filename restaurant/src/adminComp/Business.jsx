import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import AdminSidebar from './AdminSidebar';
import { Building, Search, Filter, Eye, Phone, Mail, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';

const Business = () => {
    const { user } = useContext(AuthContext);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        pageSize: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showBusinessHelp, setShowBusinessHelp] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBusinesses();
        }
    }, [user, currentPage, pageSize, searchTerm, statusFilter]);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/restaurants/admin/all`, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                    search: searchTerm || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });
            setBusinesses(response.data.businesses);
            setPagination(response.data.pagination);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch businesses');
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'draft':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'review':
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'review':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'No address provided';
        return `${address.streetAddress || ''}, ${address.city || ''}, ${address.state || ''} ${address.pinCode || ''}, ${address.country || ''}`.trim();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPagination = () => {
        const { totalPages, page } = pagination;
        const pages = [];

        // Always show first page
        pages.push(
            <button
                key={1}
                className={`btn ${page === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setCurrentPage(1)}
                disabled={page === 1}
            >
                1
            </button>
        );

        // Show left ellipsis if needed
        if (page > 3) {
            pages.push(<span key="start-ellipsis" className="px-2">...</span>);
        }

        // Show pages around current page
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            if (i !== 1 && i !== totalPages) {
                pages.push(
                    <button
                        key={i}
                        className={`btn ${page === i ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </button>
                );
            }
        }

        // Show right ellipsis if needed
        if (page < totalPages - 2) {
            pages.push(<span key="end-ellipsis" className="px-2">...</span>);
        }

        // Always show last page if more than 1
        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    className={`btn ${page === totalPages ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={page === totalPages}
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                    <span className="me-2">Show:</span>
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 25, 50, 75].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="ms-2">entries</span>
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(page - 1)}
                        disabled={page === 1}
                    >
                        &lt; Previous
                    </button>
                    {pages}
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>
        );
    };

    if (!user) {
        return <div>Please login to view businesses</div>;
    }

    if (user.role !== 'admin') {
        return <div>Access denied. Admin privileges required.</div>;
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
                        <div className="flex items-center gap-2 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
                            <button 
                                onClick={() => setShowBusinessHelp(!showBusinessHelp)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Business help"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            {showBusinessHelp && (
                                <div className="absolute z-10 mt-10 ml-[-8px] bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                                    <p className="text-sm text-gray-700">
                                        This section shows all registered businesses. You can view business details, 
                                        filter by status, and search for specific businesses.
                                    </p>
                                    <button 
                                        type="button"
                                        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowBusinessHelp(false)}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search and Filter Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search businesses..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <select
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="review">Under Review</option>
                                        <option value="published">Published</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading businesses...</p>
                            </div>
                        ) : businesses.length === 0 ? (
                            <div className="text-center py-12">
                                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No businesses found</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {businesses.map((business) => (
                                        <div key={business._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        {business.profileImage ? (
                                                            <img 
                                                                src={business.profileImage} 
                                                                alt={business.restaurantName}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <Building className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h2 className="text-xl font-semibold text-gray-900">
                                                                {business.restaurantName}
                                                            </h2>
                                                            <p className="text-sm text-gray-500">
                                                                Owner: {business.ownerName}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Created: {formatDate(business.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(business.status)}
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(business.status)}`}>
                                                            {business.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Service Type</p>
                                                            <p className="font-medium capitalize">{business.serviceType}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Registration Step</p>
                                                            <p className="font-medium">Step {business.currentStep}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Owner Email</p>
                                                            <p className="font-medium">{business.owner?.email || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Owner Username</p>
                                                            <p className="font-medium">{business.owner?.username || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {business.contact && (
                                                        <div className="mt-4 mb-4">
                                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h3>
                                                            <div className="space-y-2">
                                                                {business.contact.primaryPhone && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm">{business.contact.primaryPhone}</span>
                                                                    </div>
                                                                )}
                                                                {business.contact.email && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm">{business.contact.email}</span>
                                                                    </div>
                                                                )}
                                                                {business.contact.whatsappNumber && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm">WhatsApp: {business.contact.whatsappNumber}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {business.address && (
                                                        <div className="mt-4 mb-4">
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Address</p>
                                                                    <p className="text-sm text-gray-600">{formatAddress(business.address)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {renderPagination()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Business; 
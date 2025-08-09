import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getAllDeliveryPartnersApi, 
  updateDeliveryPartnerStatusApi 
} from '../../../api/Api';
import { 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  Truck,
  User
} from 'lucide-react';

const DeliveryPartners = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [deliveryPartners, setDeliveryPartners] = useState([]);
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
  const [showHelp, setShowHelp] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [statusToChange, setStatusToChange] = useState('');

  useEffect(() => {
    if (user) {
      fetchDeliveryPartners();
    }
  }, [user, currentPage, pageSize, searchTerm, statusFilter]);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const response = await getAllDeliveryPartnersApi({
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setDeliveryPartners(response.data.deliveryPartners);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch delivery partners');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    return `${address.streetAddress || ''}, ${address.city || ''}, ${address.district || ''}, ${address.state || ''} ${address.pinCode || ''}`.trim();
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
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          page === 1 
            ? 'bg-blue-600 text-white cursor-not-allowed' 
            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
        }`}
        onClick={() => setCurrentPage(1)}
        disabled={page === 1}
      >
        1
      </button>
    );

    // Show left ellipsis if needed
    if (page > 3) {
      pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
    }

    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(
          <button
            key={i}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === i 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      }
    }

    // Show right ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
    }

    // Always show last page if more than 1
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            page === totalPages 
              ? 'bg-blue-600 text-white cursor-not-allowed' 
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
          onClick={() => setCurrentPage(totalPages)}
          disabled={page === totalPages}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <span className="text-sm text-gray-700">entries</span>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(page - 1)}
            disabled={page === 1}
          >
            &lt; Previous
          </button>
          {pages}
          <button
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(page + 1)}
            disabled={page === totalPages}
          >
            Next &gt;
          </button>
        </div>
      </div>
    );
  };

  const handleOpenStatusModal = (partner) => {
    setSelectedPartner(partner);
    setStatusToChange(partner.status);
    setShowStatusModal(true);
  };

  const updatePartnerStatus = async (partnerId, status) => {
    try {
      const response = await updateDeliveryPartnerStatusApi(partnerId, status);
      toast.success('Status updated successfully');
      setDeliveryPartners(prev =>
        prev.map(p =>
          p._id === partnerId ? { ...p, status: response.data.status } : p
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (!user) {
    return <div>Please login to view delivery partners</div>;
  }

  if (user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Partner Management</h1>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          {showHelp && (
            <div className="absolute z-10 mt-10 ml-[-8px] bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
              <p className="text-sm text-gray-700">
                This section shows all registered delivery partners. You can view partner details, 
                filter by status, and search for specific partners.
              </p>
              <button 
                type="button"
                className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                onClick={() => setShowHelp(false)}
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
                placeholder="Search delivery partners..."
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
                <option value="pending">Pending</option>
                <option value="review">Under Review</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery partners...</p>
          </div>
        ) : deliveryPartners.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No delivery partners found</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {deliveryPartners.map((partner) => (
                <div key={partner._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        {partner.photo ? (
                          <img 
                            src={partner.photo} 
                            alt={partner.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {partner.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            User: {partner.user?.username || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(partner.createdAt)}
                          </p>
                        </div>
                      </div>
                                             <div className="flex items-center gap-2">
                         {getStatusIcon(partner.status)}
                         <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(partner.status)}`}>
                           {partner.status.toUpperCase()}
                         </span>
                         <button
                           className="px-3 py-1 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                           onClick={() => handleOpenStatusModal(partner)}
                         >
                           Change Status
                         </button>
                         <button
                           className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                           title="View Partner Details"
                           onClick={() => navigate(`/admin/delivery-partners/${partner._id}`)}
                         >
                           View
                         </button>
                       </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Vehicle Type</p>
                          <p className="font-medium capitalize">{partner.vehicleType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vehicle Number</p>
                          <p className="font-medium">{partner.vehicleNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Service Location</p>
                          <p className="font-medium capitalize">{partner.serviceLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Registration Step</p>
                          <p className="font-medium">Step {partner.step}</p>
                        </div>
                      </div>

                      <div className="mt-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{partner.mobileNumber}</span>
                          </div>
                          {partner.user?.email && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{partner.user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {partner.presentAddress && (
                        <div className="mt-4 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="text-sm text-gray-600">{formatAddress(partner.presentAddress)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Online Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {partner.online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Terms Accepted:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.termsAccepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {partner.termsAccepted ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900">Change Delivery Partner Status</h5>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Select new status for <span className="font-semibold">{selectedPartner?.name}</span>:
                </p>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusToChange}
                  onChange={e => setStatusToChange(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="review">Review</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                type="button" 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  await updatePartnerStatus(selectedPartner._id, statusToChange);
                  setShowStatusModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;

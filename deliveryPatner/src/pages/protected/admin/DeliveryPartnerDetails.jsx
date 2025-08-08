import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  getDeliveryPartnerByIdApi,
  updateDeliveryPartnerStatusApi,
  updateDeliveryPartnerByAdminApi 
} from '../../../api/Api';
import { 
  ArrowLeft,
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  Truck,
  User,
  FileText,
  Edit,
  Shield
} from 'lucide-react';

const DeliveryPartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToChange, setStatusToChange] = useState('');
  const [showEditDocsModal, setShowEditDocsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    aadhaar: { front: '', back: '' },
    name: '',
    mobileNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    serviceLocation: ''
  });

  useEffect(() => {
    if (user && id) {
      fetchPartnerDetails();
    }
  }, [user, id]);

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      const response = await getDeliveryPartnerByIdApi(id);
      setPartner(response.data);
      setEditForm({
        aadhaar: {
          front: response.data?.aadhaar?.front || '',
          back: response.data?.aadhaar?.back || ''
        },
        name: response.data?.name || '',
        mobileNumber: response.data?.mobileNumber || '',
        vehicleType: response.data?.vehicleType || '',
        vehicleNumber: response.data?.vehicleNumber || '',
        serviceLocation: response.data?.serviceLocation || ''
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch delivery partner details');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenStatusModal = () => {
    setStatusToChange(partner.status);
    setShowStatusModal(true);
  };

  const updatePartnerStatus = async (partnerId, status) => {
    try {
      const response = await updateDeliveryPartnerStatusApi(partnerId, status);
      toast.success('Status updated successfully');
      setPartner(prev => ({ ...prev, status: response.data.status }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (!user) {
    return <div>Please login to view delivery partner details</div>;
  }

  if (user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery partner details...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Delivery partner not found</p>
          <button
            onClick={() => navigate('/admin/delivery-partners')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/delivery-partners')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Partner Details</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {partner.photo ? (
                  <img 
                    src={partner.photo} 
                    alt={partner.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{partner.name}</h2>
                  <p className="text-gray-600">ID: {partner._id}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {formatDate(partner.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(partner.status)}
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(partner.status)}`}>
                  {partner.status.toUpperCase()}
                </span>
                <button
                  onClick={handleOpenStatusModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Change Status
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${partner.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="text-sm font-medium">Online Status</p>
                <p className="text-xs text-gray-600">{partner.online ? 'Online' : 'Offline'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${partner.termsAccepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm font-medium">Terms</p>
                <p className="text-xs text-gray-600">{partner.termsAccepted ? 'Accepted' : 'Not Accepted'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">Registration</p>
                <p className="text-xs text-gray-600">Step {partner.step}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">Service Area</p>
                <p className="text-xs text-gray-600 capitalize">{partner.serviceLocation}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{partner.mobileNumber}</span>
                </div>
              </div>
              {partner.user?.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{partner.user.email}</span>
                  </div>
                </div>
              )}
              {partner.user?.username && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{partner.user.username}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="capitalize">{partner.vehicleType || 'Not specified'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span>{partner.vehicleNumber || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {partner.presentAddress && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Address Information
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{formatAddress(partner.presentAddress)}</p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documents & Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm mb-2">Aadhaar (Front)</p>
                {partner?.aadhaar?.front ? (
                  <img src={partner.aadhaar.front} alt="Aadhaar Front" className="rounded border" />
                ) : (
                  <p className="text-xs text-gray-500">Not uploaded</p>
                )}
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm mb-2">Aadhaar (Back)</p>
                {partner?.aadhaar?.back ? (
                  <img src={partner.aadhaar.back} alt="Aadhaar Back" className="rounded border" />
                ) : (
                  <p className="text-xs text-gray-500">Not uploaded</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowEditDocsModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Documents
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(partner.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(partner.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900">Change Status</h5>
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
                  Select new status for <span className="font-semibold">{partner.name}</span>:
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
                  await updatePartnerStatus(partner._id, statusToChange);
                  setShowStatusModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Documents Modal */}
      {showEditDocsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-gray-900">Edit Partner Details</h5>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                onClick={() => setShowEditDocsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="w-full px-3 py-2 border rounded" value={editForm.name} onChange={(e)=>setEditForm({...editForm,name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input className="w-full px-3 py-2 border rounded" value={editForm.mobileNumber} onChange={(e)=>setEditForm({...editForm,mobileNumber:e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <input className="w-full px-3 py-2 border rounded" value={editForm.vehicleType} onChange={(e)=>setEditForm({...editForm,vehicleType:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input className="w-full px-3 py-2 border rounded" value={editForm.vehicleNumber} onChange={(e)=>setEditForm({...editForm,vehicleNumber:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Location</label>
                <input className="w-full px-3 py-2 border rounded" value={editForm.serviceLocation} onChange={(e)=>setEditForm({...editForm,serviceLocation:e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Front URL</label>
                  <input className="w-full px-3 py-2 border rounded" value={editForm.aadhaar.front} onChange={(e)=>setEditForm({...editForm,aadhaar:{...editForm.aadhaar,front:e.target.value}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Back URL</label>
                  <input className="w-full px-3 py-2 border rounded" value={editForm.aadhaar.back} onChange={(e)=>setEditForm({...editForm,aadhaar:{...editForm.aadhaar,back:e.target.value}})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                type="button" 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                onClick={() => setShowEditDocsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  try {
                    await updateDeliveryPartnerByAdminApi(partner._id, editForm);
                    toast.success('Updated successfully');
                    setShowEditDocsModal(false);
                    fetchPartnerDetails();
                  } catch (e) {
                    toast.error(e.response?.data?.error || 'Update failed');
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerDetails;

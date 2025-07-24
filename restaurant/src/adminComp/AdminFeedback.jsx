import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import AdminSidebar from './AdminSidebar';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];
const CATEGORY_OPTIONS = [
  'Bug Report', 'Feature Request', 'General Feedback'
];

const AdminFeedback = () => {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [statusToChange, setStatusToChange] = useState('new');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/api/feedback`);
            setFeedbacks(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch feedback');
            setLoading(false);
        }
    };

    // Filter feedbacks by status and category
    const filteredFeedbacks = feedbacks.filter(fb => {
        const statusMatch = statusFilter === 'all' || (fb.status || 'new') === statusFilter;
        const categoryMatch = categoryFilter === 'all' || fb.category === categoryFilter;
        return statusMatch && categoryMatch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredFeedbacks.length / pageSize);
    const paginatedFeedbacks = filteredFeedbacks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleOpenStatusModal = (feedback) => {
        setSelectedFeedback(feedback);
        setStatusToChange(feedback.status || 'new');
        setShowStatusModal(true);
    };

    const patchFeedbackStatus = async (id, status) => {
        try {
            const response = await axios.patch(`${API_URL}/api/feedback/${id}/status`, { status });
            toast.success('Status updated successfully');
            setFeedbacks(prev =>
                prev.map(fb =>
                    fb._id === id ? { ...fb, status: response.data.status } : fb
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (!user) {
        return <div>Please login to view feedback</div>;
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feedback Management</h1>
                        {/* Status and Category Filter Dropdowns */}
                        <div className="mb-6 flex flex-wrap gap-4 items-center">
                            <label className="form-label mb-0 me-2">Filter by Status:</label>
                            <select
                                className="form-select w-auto"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <label className="form-label mb-0 ms-4 me-2">Filter by Category:</label>
                            <select
                                className="form-select w-auto"
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {CATEGORY_OPTIONS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading feedback...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">{error}</div>
                        ) : paginatedFeedbacks.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No feedback found</div>
                        ) : (
                            <>
                            <div className="space-y-6">
                                {paginatedFeedbacks.map((fb) => (
                                    <div key={fb._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">{fb.name || 'Anonymous'}</h2>
                                                    <p className="text-sm text-gray-500">{fb.email}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex gap-2">
                                                        {/* Category badge */}
                                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                            {fb.category || 'General Feedback'}
                                                        </span>
                                                        {/* Status badge */}
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            fb.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                            fb.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' :
                                                            fb.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                            fb.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {STATUS_OPTIONS.find(opt => opt.value === (fb.status || 'new'))?.label || 'New'}
                                                        </span>
                                                    </div>
                                                    {/* Change Status button */}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary mt-2"
                                                        onClick={() => handleOpenStatusModal(fb)}
                                                    >
                                                        Change Status
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-sm text-gray-500">Submitted: </span>
                                                <span className="text-sm text-gray-700">{new Date(fb.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-sm text-gray-500">Comments: </span>
                                                <span className="text-sm text-gray-700">{fb.comments}</span>
                                            </div>
                                            {fb.images && fb.images.length > 0 && (
                                                <div className="mb-2">
                                                    <span className="text-sm text-gray-500">Images: </span>
                                                    <div className="flex gap-2 mt-1 flex-wrap">
                                                        {fb.images.map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`feedback-img-${idx}`}
                                                                className="w-16 h-16 object-cover rounded border"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Pagination Controls */}
                            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                                    <span className="me-2">Show:</span>
                                    <select
                                        className="form-select"
                                        style={{ width: 'auto' }}
                                        value={pageSize}
                                        onChange={e => {
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
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        &lt; Previous
                                    </button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next &gt;
                                    </button>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Custom modal for status change */}
            {showStatusModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change Feedback Status</h5>
                                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-2">
                                    Select new status for <b>{selectedFeedback?.name || 'Anonymous'}</b>:
                                </div>
                                <select
                                    className="form-select"
                                    value={statusToChange}
                                    onChange={e => setStatusToChange(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={async () => {
                                        await patchFeedbackStatus(selectedFeedback._id, statusToChange);
                                        setShowStatusModal(false);
                                    }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
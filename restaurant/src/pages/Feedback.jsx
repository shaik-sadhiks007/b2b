import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { X } from 'lucide-react';

const Feedback = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [feedbackForm, setFeedbackForm] = useState({
        name: user?.username || '',
        email: user?.email || '',
        category: 'General Feedback',
        comments: '',
        images: []
    });
    const [feedbackUploading, setFeedbackUploading] = useState(false);

    useEffect(() => {
        setFeedbackForm(f => ({
            ...f,
            name: user?.username || '',
            email: user?.email || ''
        }));
    }, [user]);

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    const handleFeedbackInput = (e) => {
        const { name, value } = e.target;
        setFeedbackForm(f => ({ ...f, [name]: value }));
    };

    const handleFeedbackImage = (e) => {
        const files = Array.from(e.target.files).slice(0, 3 - feedbackForm.images.length);
        if (files.length + feedbackForm.images.length > 3) {
            toast.error('You can upload a maximum of 3 images.');
            return;
        }
        const readers = files.map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
            });
        });
        Promise.all(readers).then(imgs => {
            setFeedbackForm(f => ({ ...f, images: [...f.images, ...imgs] }));
        });
    };

    const handleRemoveFeedbackImage = (idx) => {
        setFeedbackForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackForm.comments.trim()) {
            toast.error('Comments are required.');
            return;
        }
        setFeedbackUploading(true);
        try {
            const res = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackForm)
            });
            if (res.ok) {
                toast.success('Feedback submitted!');
                setFeedbackForm({
                    name: user?.username || '',
                    email: user?.email || '',
                    category: 'General Feedback',
                    comments: '',
                    images: []
                });
                setTimeout(() => navigate('/'), 1000);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit feedback.');
            }
        } catch (err) {
            toast.error('Failed to submit feedback.');
        } finally {
            setFeedbackUploading(false);
        }
    };

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>
            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 md:p-10 relative border border-blue-100">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">We Value Your Feedback</h2>
                            <p className="text-gray-500 text-base md:text-lg">Help us improve by sharing your thoughts, suggestions, or issues below.</p>
                        </div>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={feedbackForm.name}
                                        onChange={handleFeedbackInput}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={feedbackForm.email}
                                        onChange={handleFeedbackInput}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                        placeholder="Your email"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    value={feedbackForm.category}
                                    onChange={handleFeedbackInput}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                >
                                    <option value="General Feedback">General Feedback</option>
                                    <option value="Bug Report">Bug Report</option>
                                    <option value="Feature Request">Feature Request</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comments <span className="text-red-500">*</span></label>
                                <textarea
                                    name="comments"
                                    value={feedbackForm.comments}
                                    onChange={handleFeedbackInput}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                    placeholder="Your feedback..."
                                    required
                                    rows={4}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Upload Images (max 3)</label>
                                <br />
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFeedbackImage}
                                    disabled={feedbackForm.images.length >= 3}
                                    className="mt-1 border-2 border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                />
                                <div className="flex gap-3 mt-3 flex-wrap">
                                    {feedbackForm.images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 md:w-16 md:h-16">
                                            <img src={img} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 rounded-full p-1 "
                                                onClick={() => handleRemoveFeedbackImage(idx)}
                                            >
                                                <span className="text-gray-600 text-lg">
                                                    <X size={20} />
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
                                disabled={feedbackUploading}
                            >
                                {feedbackUploading ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback; 
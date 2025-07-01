import { useContext, useState, useEffect } from 'react';
import { HotelContext } from '../contextApi/HotelContextProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';

const Feedback = () => {
    const { user } = useContext(HotelContext);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 mt-8">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">We Value Your Feedback</h2>
                <p className="text-gray-500 text-base md:text-lg">Help us improve by sharing your thoughts, suggestions, or issues below.</p>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={feedbackForm.name}
                            onChange={handleFeedbackInput}
                            className="w-full border rounded px-3 py-2 mt-1"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={feedbackForm.email}
                            onChange={handleFeedbackInput}
                            className="w-full border rounded px-3 py-2 mt-1"
                            placeholder="Your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            name="category"
                            value={feedbackForm.category}
                            onChange={handleFeedbackInput}
                            className="w-full border rounded px-3 py-2 mt-1"
                        >
                            <option value="General Feedback">General Feedback</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Feature Request">Feature Request</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Comments <span className="text-red-500">*</span></label>
                        <textarea
                            name="comments"
                            value={feedbackForm.comments}
                            onChange={handleFeedbackInput}
                            className="w-full border rounded px-3 py-2 mt-1"
                            placeholder="Your feedback..."
                            required
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Upload Images (max 3)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFeedbackImage}
                            disabled={feedbackForm.images.length >= 3}
                        />
                        <div className="flex gap-2 mt-2">
                            {feedbackForm.images.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16">
                                    <img src={img} alt="preview" className="w-16 h-16 object-cover rounded" />
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                                        onClick={() => handleRemoveFeedbackImage(idx)}
                                    >
                                        <span className="text-gray-600">&times;</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={feedbackUploading}
                    >
                        {feedbackUploading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Feedback; 
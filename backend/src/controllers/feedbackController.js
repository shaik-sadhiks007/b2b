const Feedback = require('../models/feedbackModel');
const { uploadMultipleBase64Images } = require('../utils/awsS3');

// POST /api/feedback
const submitFeedback = async (req, res) => {
  try {
    const { name, email, category, comments, images } = req.body;
    if (!comments) {
      return res.status(400).json({ message: 'Comments are required.' });
    }
    if (images && images.length > 3) {
      return res.status(400).json({ message: 'You can upload a maximum of 3 images.' });
    }
    let imageUrls = [];
    if (images && images.length > 0) {
      imageUrls = await uploadMultipleBase64Images(images);
    }
    const feedback = new Feedback({
      name,
      email,
      category,
      comments,
      images: imageUrls
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('[feedbackController.js][submitFeedback]', error);
    console.trace('[feedbackController.js][submitFeedback] Stack trace:');
    res.status(500).json({ message: 'Failed to submit feedback.' });
  }
};

// GET /api/feedback (admin)
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('[feedbackController.js][getAllFeedback]', error);
    res.status(500).json({ message: 'Failed to fetch feedback.' });
  }
};

// PATCH /api/feedback/:id/status
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'inprogress', 'resolved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

module.exports = { submitFeedback, getAllFeedback, updateFeedbackStatus };

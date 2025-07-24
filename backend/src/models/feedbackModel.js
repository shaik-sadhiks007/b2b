const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  category: {
    type: String,
    enum: ['Bug Report', 'Feature Request', 'General Feedback'],
    default: 'General Feedback'
  },
  comments: { type: String, required: true },
  images: {
    type: [String],
    validate: [arr => arr.length <= 3, 'You can upload a maximum of 3 images.']
  },
  status: {
    type: String,
    enum: ['new', 'inprogress', 'resolved', 'rejected'],
    default: 'new'
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

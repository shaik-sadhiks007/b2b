const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');

// POST /api/feedback
router.post('/', submitFeedback);

// GET /api/feedback (admin)
router.get('/', getAllFeedback);

router.patch('/:id/status', updateFeedbackStatus);

module.exports = router;

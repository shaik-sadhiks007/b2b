const mongoose = require('mongoose');

const subdomainSchema = new mongoose.Schema({
  businessCategory: {
    type: String,
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Subdomain = mongoose.models.Subdomain || mongoose.model('Subdomain', subdomainSchema);

module.exports = Subdomain;

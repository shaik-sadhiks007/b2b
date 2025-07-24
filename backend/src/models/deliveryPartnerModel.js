const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  vehicleNumber: { type: String },
  vehicleType: { type: String },
  mobileNumber: { type: String, required: true },
  photo: { type: String },
  aadhaar: {
    front: { type: String },
    back: { type: String },
  },
  presentAddress: {
    streetAddress: { type: String },
    pinCode: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String, default: 'Andhra Pradesh' },
    country: { type: String, default: 'India' },
  },
  serviceLocation: { type: String, default: 'vijayawada' },
  termsAccepted: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  status: { type: String, enum: ['inactive', 'active', 'review', 'pending'], default: 'pending' },
  step: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

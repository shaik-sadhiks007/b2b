const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema(
  {
    account: String,
    amount: Number,               
    currency: { type: String, default: 'INR' },
    notes: {},
    on_hold: Boolean,
    on_hold_until: Number,       
    transfer_id: { type: String, index: true },
    status: String
  },
  { _id: false }
);

const CardSnapshotSchema = new mongoose.Schema(
  {
    network: String,   // VISA/MASTERCARD
    last4: String,
    type: String,      // credit/debit
    issuer: String
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],

    
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    receipt: { type: String, index: true },

    
    razorpay_order_id: { type: String, index: true, unique: true, sparse: true },
    razorpay_payment_id: { type: String, index: true, unique: true, sparse: true },
    razorpay_signature: String,

    
    paymentLinkId: { type: String, index: true },     
    paymentLinkStatus: { type: String },              
    paymentIds: [{ type: String }],                


    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded', 'partially_refunded', 'pending'],
      default: 'created'
    },
    method: String,   
    email: String,
    contact: String,
    vpa: String,      

    card: CardSnapshotSchema,

    
    transfers: [TransferSchema],

    
    checkoutSnapshot: {},

    notes: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);

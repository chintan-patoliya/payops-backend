const mongoose = require('mongoose');
const { payoutStatuses, payoutModes } = require('../config/vars');

const payoutSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  mode: {
    type: String,
    enum: {
      values: payoutModes,
      message: 'Mode must be one of: UPI, IMPS, NEFT',
    },
    required: [true, 'Payment mode is required'],
  },
  note: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    enum: Object.values(payoutStatuses),
    default: payoutStatuses.DRAFT,
  },
  decision_reason: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Payout', payoutSchema);

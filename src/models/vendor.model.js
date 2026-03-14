const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
  },
  upi_id: {
    type: String,
    trim: true,
    default: null,
  },
  bank_account: {
    type: String,
    trim: true,
    default: null,
  },
  ifsc: {
    type: String,
    trim: true,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

module.exports = mongoose.model('Vendor', vendorSchema);

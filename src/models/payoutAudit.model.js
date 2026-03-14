const mongoose = require('mongoose');
const { auditActions } = require('../config/vars');

const payoutAuditSchema = new mongoose.Schema({
  payout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
    required: true,
  },
  action: {
    type: String,
    enum: Object.values(auditActions),
    required: true,
  },
  performed_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PayoutAudit', payoutAuditSchema);

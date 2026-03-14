// Payout Statuses
const PAYOUT_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// Payment Modes
const PAYMENT_MODES = {
  UPI: 'UPI',
  IMPS: 'IMPS',
  NEFT: 'NEFT',
};

// User Roles
const USER_ROLES = {
  OPS: 'OPS',
  FINANCE: 'FINANCE',
};

// Audit Actions
const AUDIT_ACTIONS = {
  CREATED: 'CREATED',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

module.exports = {
  PAYOUT_STATUSES,
  PAYMENT_MODES,
  USER_ROLES,
  AUDIT_ACTIONS,
};

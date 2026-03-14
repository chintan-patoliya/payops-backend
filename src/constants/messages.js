// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  ACCESS_DENIED: 'Access denied. Only {role} can perform this action.',
  
  // Validation
  REQUIRED_FIELD: '{field} is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_STATUS: 'Invalid status filter. Allowed: {allowed}',
  
  // Vendor
  VENDOR_NOT_FOUND: 'Vendor not found',
  VENDOR_CREATE_FAILED: 'Failed to create vendor',
  
  // Payout
  PAYOUT_NOT_FOUND: 'Payout not found',
  PAYOUT_CREATE_FAILED: 'Failed to create payout',
  INVALID_AMOUNT: 'Amount must be greater than 0',
  INVALID_VENDOR: 'Invalid vendor',
  INVALID_MODE: 'Invalid payment mode. Allowed: {allowed}',
  
  // Status Transitions
  CANNOT_SUBMIT: 'Cannot submit payout. Current status is "{status}". Only Draft payouts can be submitted.',
  CANNOT_APPROVE: 'Cannot approve payout. Current status is "{status}". Only Submitted payouts can be approved.',
  CANNOT_REJECT: 'Cannot reject payout. Current status is "{status}". Only Submitted payouts can be rejected.',
  REJECTION_REASON_REQUIRED: 'Rejection reason is required',
  
  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  
  // Vendor
  VENDOR_CREATED: 'Vendor created successfully',
  VENDOR_UPDATED: 'Vendor updated successfully',
  
  // Payout
  PAYOUT_CREATED: 'Payout created successfully',
  PAYOUT_SUBMITTED: 'Payout submitted successfully',
  PAYOUT_APPROVED: 'Payout approved successfully',
  PAYOUT_REJECTED: 'Payout rejected successfully',
};

// Helper function to replace placeholders
const formatMessage = (message, params = {}) => {
  let formatted = message;
  Object.keys(params).forEach(key => {
    formatted = formatted.replace(`{${key}}`, params[key]);
  });
  return formatted;
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  formatMessage,
};

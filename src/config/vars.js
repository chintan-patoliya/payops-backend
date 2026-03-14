const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'payops_default_secret',
    expirationDays: process.env.JWT_EXPIRATION_DAYS || 7,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  roles: {
    OPS: 'OPS',
    FINANCE: 'FINANCE',
  },
  payoutStatuses: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  },
  payoutModes: ['UPI', 'IMPS', 'NEFT'],
  auditActions: {
    CREATED: 'CREATED',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
};

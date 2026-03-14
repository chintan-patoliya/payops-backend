const express = require('express');
const authRoutes = require('./auth.route');
const vendorRoutes = require('./vendor.route');
const payoutRoutes = require('./payout.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/payouts', payoutRoutes);

module.exports = router;

const express = require('express');
const controller = require('../controllers/vendor.controller');
const { authenticate, authorize, OPS, FINANCE } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(authenticate, controller.list)
  .post(authenticate, controller.create);

module.exports = router;

const express = require('express');
const controller = require('../controllers/payout.controller');
const { authenticate, authorize, OPS, FINANCE } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(authenticate, controller.list)
  .post(authenticate, authorize(OPS), controller.create);

router
  .route('/:id')
  .get(authenticate, controller.getById);

router
  .route('/:id/submit')
  .post(authenticate, authorize(OPS), controller.submit);

router
  .route('/:id/approve')
  .post(authenticate, authorize(FINANCE), controller.approve);

router
  .route('/:id/reject')
  .post(authenticate, authorize(FINANCE), controller.reject);

module.exports = router;

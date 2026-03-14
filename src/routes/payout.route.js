const express = require('express');
const controller = require('../controllers/payout.controller');
const { authenticate, authorize, OPS, FINANCE } = require('../middleware/auth');

const router = express.Router();

/**
 * @api {get} /api/payouts List Payouts
 * @apiDescription Get list of all payouts with optional filters
 * @apiVersion 1.0.0
 * @apiName ListPayouts
 * @apiGroup Payouts
 * @apiPermission authenticated
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String} [status]    Filter by status (Draft, Submitted, Approved, Rejected)
 * @apiParam  {String} [vendor_id] Filter by vendor ID
 *
 * @apiSuccess {Boolean} success         Request success status
 * @apiSuccess {Object[]} data           Array of payout objects
 * @apiSuccess {String}  data._id        Payout's id
 * @apiSuccess {Object}  data.vendor_id  Vendor object with details
 * @apiSuccess {Number}  data.amount     Payout amount
 * @apiSuccess {String}  data.mode       Payment mode (UPI, IMPS, NEFT)
 * @apiSuccess {String}  data.status     Payout status
 * @apiSuccess {String}  data.note       Optional note
 * @apiSuccess {Date}    data.created_at Timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "_id": "507f1f77bcf86cd799439011",
 *           "vendor_id": {
 *             "_id": "507f191e810c19729de860ea",
 *             "name": "Acme Corp",
 *             "upi_id": "acme@upi"
 *           },
 *           "amount": 50000,
 *           "mode": "UPI",
 *           "status": "Draft",
 *           "note": "Monthly payment",
 *           "created_at": "2024-01-15T10:30:00.000Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError Invalid status filter
 * @apiError (Unauthorized 401) Unauthorized    Authentication required
 */

/**
 * @api {post} /api/payouts Create Payout
 * @apiDescription Create a new payout (status: Draft)
 * @apiVersion 1.0.0
 * @apiName CreatePayout
 * @apiGroup Payouts
 * @apiPermission OPS, FINANCE
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String}  vendor_id Vendor's ID (required)
 * @apiParam  {Number}  amount    Payout amount (required, must be > 0)
 * @apiParam  {String}  mode      Payment mode: UPI, IMPS, or NEFT (required)
 * @apiParam  {String}  [note]    Optional note
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "vendor_id": "507f191e810c19729de860ea",
 *       "amount": 50000,
 *       "mode": "UPI",
 *       "note": "Monthly payment"
 *     }
 *
 * @apiSuccess (Created 201) {Boolean} success Request success status
 * @apiSuccess (Created 201) {String}  message Success message
 * @apiSuccess (Created 201) {Object}  data    Created payout object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Payout created successfully",
 *       "data": {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "vendor_id": {
 *           "_id": "507f191e810c19729de860ea",
 *           "name": "Acme Corp"
 *         },
 *         "amount": 50000,
 *         "mode": "UPI",
 *         "status": "Draft",
 *         "note": "Monthly payment"
 *       }
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError  Invalid vendor, amount, or mode
 * @apiError (Unauthorized 401) Unauthorized     Authentication required
 * @apiError (Forbidden 403)    Forbidden        Only OPS and FINANCE can create payouts
 */
router
  .route('/')
  .get(authenticate, controller.list)
  .post(authenticate, authorize(OPS, FINANCE), controller.create);

/**
 * @api {get} /api/payouts/:id Get Payout Details
 * @apiDescription Get payout detail with audit trail
 * @apiVersion 1.0.0
 * @apiName GetPayout
 * @apiGroup Payouts
 * @apiPermission authenticated
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String} id Payout's unique ID
 *
 * @apiSuccess {Boolean} success           Request success status
 * @apiSuccess {Object}  data              Response data
 * @apiSuccess {Object}  data.payout       Payout object with vendor details
 * @apiSuccess {Object[]} data.audits      Array of audit trail entries
 * @apiSuccess {String}  data.audits.action Action performed (CREATED, SUBMITTED, APPROVED, REJECTED)
 * @apiSuccess {Object}  data.audits.performed_by_user_id User who performed action
 * @apiSuccess {Date}    data.audits.timestamp Action timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "payout": {
 *           "_id": "507f1f77bcf86cd799439011",
 *           "vendor_id": {
 *             "name": "Acme Corp",
 *             "upi_id": "acme@upi"
 *           },
 *           "amount": 50000,
 *           "mode": "UPI",
 *           "status": "Submitted"
 *         },
 *         "audits": [
 *           {
 *             "action": "CREATED",
 *             "performed_by_user_id": {
 *               "email": "ops@demo.com",
 *               "role": "OPS"
 *             },
 *             "timestamp": "2024-01-15T10:30:00.000Z"
 *           }
 *         ]
 *       }
 *     }
 *
 * @apiError (Not Found 404)    NotFound      Payout not found
 * @apiError (Unauthorized 401) Unauthorized  Authentication required
 */
router
  .route('/:id')
  .get(authenticate, controller.getById);

/**
 * @api {post} /api/payouts/:id/submit Submit Payout
 * @apiDescription Submit a payout for approval (Draft → Submitted)
 * @apiVersion 1.0.0
 * @apiName SubmitPayout
 * @apiGroup Payouts
 * @apiPermission OPS
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String} id Payout's unique ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String}  message Success message
 * @apiSuccess {Object}  data    Updated payout object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Payout submitted",
 *       "data": {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "status": "Submitted"
 *       }
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError Cannot submit payout (invalid status)
 * @apiError (Not Found 404)    NotFound       Payout not found
 * @apiError (Unauthorized 401) Unauthorized   Authentication required
 * @apiError (Forbidden 403)    Forbidden      Only OPS can submit payouts
 */
router
  .route('/:id/submit')
  .post(authenticate, authorize(OPS), controller.submit);

/**
 * @api {post} /api/payouts/:id/approve Approve Payout
 * @apiDescription Approve a submitted payout (Submitted → Approved)
 * @apiVersion 1.0.0
 * @apiName ApprovePayout
 * @apiGroup Payouts
 * @apiPermission FINANCE
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String} id Payout's unique ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String}  message Success message
 * @apiSuccess {Object}  data    Updated payout object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Payout approved",
 *       "data": {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "status": "Approved"
 *       }
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError Cannot approve payout (invalid status)
 * @apiError (Not Found 404)    NotFound       Payout not found
 * @apiError (Unauthorized 401) Unauthorized   Authentication required
 * @apiError (Forbidden 403)    Forbidden      Only FINANCE can approve payouts
 */
router
  .route('/:id/approve')
  .post(authenticate, authorize(FINANCE), controller.approve);

/**
 * @api {post} /api/payouts/:id/reject Reject Payout
 * @apiDescription Reject a submitted payout (Submitted → Rejected)
 * @apiVersion 1.0.0
 * @apiName RejectPayout
 * @apiGroup Payouts
 * @apiPermission FINANCE
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String} id               Payout's unique ID
 * @apiParam  {String} decision_reason  Reason for rejection (required)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "decision_reason": "Amount exceeds budget limit"
 *     }
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String}  message Success message
 * @apiSuccess {Object}  data    Updated payout object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Payout rejected",
 *       "data": {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "status": "Rejected",
 *         "decision_reason": "Amount exceeds budget limit"
 *       }
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError Cannot reject payout or reason required
 * @apiError (Not Found 404)    NotFound       Payout not found
 * @apiError (Unauthorized 401) Unauthorized   Authentication required
 * @apiError (Forbidden 403)    Forbidden      Only FINANCE can reject payouts
 */
router
  .route('/:id/reject')
  .post(authenticate, authorize(FINANCE), controller.reject);

module.exports = router;

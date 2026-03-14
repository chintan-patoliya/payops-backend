const express = require('express');
const controller = require('../controllers/vendor.controller');
const { authenticate, authorize, OPS, FINANCE } = require('../middleware/auth');

const router = express.Router();

/**
 * @api {get} /api/vendors List Vendors
 * @apiDescription Get list of all vendors
 * @apiVersion 1.0.0
 * @apiName ListVendors
 * @apiGroup Vendors
 * @apiPermission authenticated
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiSuccess {Boolean} success         Request success status
 * @apiSuccess {Object[]} data           Array of vendor objects
 * @apiSuccess {String}  data._id        Vendor's id
 * @apiSuccess {String}  data.name       Vendor's name
 * @apiSuccess {String}  data.upi_id     Vendor's UPI ID
 * @apiSuccess {String}  data.bank_account Vendor's bank account number
 * @apiSuccess {String}  data.ifsc       Vendor's IFSC code
 * @apiSuccess {Boolean} data.is_active  Vendor's active status
 * @apiSuccess {Date}    data.created_at Timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "_id": "507f1f77bcf86cd799439011",
 *           "name": "Acme Corp",
 *           "upi_id": "acme@upi",
 *           "bank_account": "1234567890",
 *           "ifsc": "SBIN0001234",
 *           "is_active": true,
 *           "created_at": "2024-01-15T10:30:00.000Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (Unauthorized 401) Unauthorized Authentication required
 */

/**
 * @api {post} /api/vendors Create Vendor
 * @apiDescription Create a new vendor
 * @apiVersion 1.0.0
 * @apiName CreateVendor
 * @apiGroup Vendors
 * @apiPermission authenticated
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam  {String}  name          Vendor's name (required)
 * @apiParam  {String}  [upi_id]      Vendor's UPI ID (optional)
 * @apiParam  {String}  [bank_account] Vendor's bank account number (optional)
 * @apiParam  {String}  [ifsc]        Vendor's IFSC code (optional)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Acme Corp",
 *       "upi_id": "acme@upi",
 *       "bank_account": "1234567890",
 *       "ifsc": "SBIN0001234"
 *     }
 *
 * @apiSuccess (Created 201) {Boolean} success Request success status
 * @apiSuccess (Created 201) {String}  message Success message
 * @apiSuccess (Created 201) {Object}  data    Created vendor object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Vendor created successfully",
 *       "data": {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "name": "Acme Corp",
 *         "upi_id": "acme@upi",
 *         "bank_account": "1234567890",
 *         "ifsc": "SBIN0001234",
 *         "is_active": true
 *       }
 *     }
 *
 * @apiError (Bad Request 400)  ValidationError  Vendor name is required
 * @apiError (Unauthorized 401) Unauthorized     Authentication required
 */
router
  .route('/')
  .get(authenticate, controller.list)
  .post(authenticate, controller.create);

module.exports = router;

const express = require('express');
const controller = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @api {post} /api/auth/login Login
 * @apiDescription Authenticate user and return JWT token
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String{3..128}} password  User's password
 *
 * @apiSuccess {Boolean} success         Request success status
 * @apiSuccess {Object}  data            Response data
 * @apiSuccess {String}  data.token      JWT authorization token
 * @apiSuccess {Object}  data.user       User object
 * @apiSuccess {String}  data.user.id    User's id
 * @apiSuccess {String}  data.user.email User's email
 * @apiSuccess {String}  data.user.role  User's role (OPS or FINANCE)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *         "user": {
 *           "id": "507f1f77bcf86cd799439011",
 *           "email": "ops@demo.com",
 *           "role": "OPS"
 *         }
 *       }
 *     }
 *
 * @apiError (Bad Request 400)   ValidationError   Email and password are required
 * @apiError (Unauthorized 401)  Unauthorized      Invalid email or password
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Invalid email or password"
 *     }
 */
router.route('/login')
  .post(controller.login);

module.exports = router;

const httpStatus = require('http-status');
const Payout = require('../models/payout.model');
const Vendor = require('../models/vendor.model');
const PayoutAudit = require('../models/payoutAudit.model');
const APIError = require('../utils/APIError');
const { payoutStatuses, payoutModes, auditActions, roles } = require('../config/vars');
const { ERROR_MESSAGES, formatMessage } = require('../constants/messages');
const { PAYOUT_STATUSES } = require('../constants');

/**
 * Create audit trail entry
 */
const createAudit = async (payoutId, action, userId) => {
  await PayoutAudit.create({
    payout_id: payoutId,
    action,
    performed_by_user_id: userId,
  });
};

/**
 * GET /api/payouts
 * List all payouts with optional filters (status, vendor)
 */
exports.list = async (req, res, next) => {
  try {
    const { status, vendor_id } = req.query;
    const filter = {};

    if (status) {
      if (!Object.values(payoutStatuses).includes(status)) {
        throw new APIError({
          message: formatMessage(ERROR_MESSAGES.INVALID_STATUS, { allowed: Object.values(payoutStatuses).join(', ') }),
          status: httpStatus.BAD_REQUEST,
        });
      }
      filter.status = status;
    }

    if (vendor_id) {
      filter.vendor_id = vendor_id;
    }

    const payouts = await Payout.find(filter)
      .populate('vendor_id', 'name upi_id bank_account ifsc')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payouts/:id
 * Get payout detail with audit trail
 */
exports.getById = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('vendor_id', 'name upi_id bank_account ifsc');

    if (!payout) {
      throw new APIError({
        message: 'Payout not found',
        status: httpStatus.NOT_FOUND,
      });
    }

    const audits = await PayoutAudit.find({ payout_id: payout._id })
      .populate('performed_by_user_id', 'email role')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      data: {
        payout,
        audits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payouts
 * Create a new payout (OPS only, status: Draft)
 */
exports.create = async (req, res, next) => {
  try {
    const { vendor_id, amount, mode, note } = req.body;

    // Validate vendor exists
    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      throw new APIError({
        message: ERROR_MESSAGES.VENDOR_NOT_FOUND,
        status: httpStatus.BAD_REQUEST,
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new APIError({
        message: ERROR_MESSAGES.INVALID_AMOUNT,
        status: httpStatus.BAD_REQUEST,
      });
    }

    // Validate mode
    if (!payoutModes.includes(mode)) {
      throw new APIError({
        message: formatMessage(ERROR_MESSAGES.INVALID_MODE, { allowed: payoutModes.join(', ') }),
        status: httpStatus.BAD_REQUEST,
      });
    }

    const payout = new Payout({
      vendor_id,
      amount,
      mode,
      note: note || null,
      status: payoutStatuses.DRAFT,
    });

    await payout.save();

    // Create audit trail
    await createAudit(payout._id, auditActions.CREATED, req.user._id);

    const populated = await Payout.findById(payout._id)
      .populate('vendor_id', 'name upi_id bank_account ifsc');

    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Payout created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payouts/:id/submit
 * Submit a payout (OPS only, Draft → Submitted)
 */
exports.submit = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      throw new APIError({
        message: ERROR_MESSAGES.PAYOUT_NOT_FOUND,
        status: httpStatus.NOT_FOUND,
      });
    }

    if (payout.status !== payoutStatuses.DRAFT) {
      throw new APIError({
        message: formatMessage(ERROR_MESSAGES.CANNOT_SUBMIT, { status: payout.status }),
        status: httpStatus.BAD_REQUEST,
      });
    }

    payout.status = payoutStatuses.SUBMITTED;
    await payout.save();

    await createAudit(payout._id, auditActions.SUBMITTED, req.user._id);

    const populated = await Payout.findById(payout._id)
      .populate('vendor_id', 'name upi_id bank_account ifsc');

    res.json({
      success: true,
      message: 'Payout submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payouts/:id/approve
 * Approve a payout (FINANCE only, Submitted → Approved)
 */
exports.approve = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      throw new APIError({
        message: 'Payout not found',
        status: httpStatus.NOT_FOUND,
      });
    }

    if (payout.status !== payoutStatuses.SUBMITTED) {
      throw new APIError({
        message: `Cannot approve payout. Current status is "${payout.status}". Only Submitted payouts can be approved.`,
        status: httpStatus.BAD_REQUEST,
      });
    }

    payout.status = payoutStatuses.APPROVED;
    await payout.save();

    await createAudit(payout._id, auditActions.APPROVED, req.user._id);

    const populated = await Payout.findById(payout._id)
      .populate('vendor_id', 'name upi_id bank_account ifsc');

    res.json({
      success: true,
      message: 'Payout approved successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payouts/:id/reject
 * Reject a payout (FINANCE only, Submitted → Rejected)
 */
exports.reject = async (req, res, next) => {
  try {
    const { decision_reason } = req.body;

    if (!decision_reason || !decision_reason.trim()) {
      throw new APIError({
        message: 'Rejection reason is required',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      throw new APIError({
        message: 'Payout not found',
        status: httpStatus.NOT_FOUND,
      });
    }

    if (payout.status !== payoutStatuses.SUBMITTED) {
      throw new APIError({
        message: `Cannot reject payout. Current status is "${payout.status}". Only Submitted payouts can be rejected.`,
        status: httpStatus.BAD_REQUEST,
      });
    }

    payout.status = payoutStatuses.REJECTED;
    payout.decision_reason = decision_reason.trim();
    await payout.save();

    await createAudit(payout._id, auditActions.REJECTED, req.user._id);

    const populated = await Payout.findById(payout._id)
      .populate('vendor_id', 'name upi_id bank_account ifsc');

    res.json({
      success: true,
      message: 'Payout rejected',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

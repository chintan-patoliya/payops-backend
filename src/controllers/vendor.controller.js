const httpStatus = require('http-status');
const Vendor = require('../models/vendor.model');
const APIError = require('../utils/APIError');

/**
 * GET /api/vendors
 * List all vendors
 */
exports.list = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    const filter = {};

    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    }

    const vendors = await Vendor.find(filter).sort({ created_at: -1 });

    res.json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/vendors
 * Create a new vendor
 */
exports.create = async (req, res, next) => {
  try {
    const { name, upi_id, bank_account, ifsc } = req.body;

    if (!name || !name.trim()) {
      throw new APIError({
        message: 'Vendor name is required',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const vendor = new Vendor({
      name: name.trim(),
      upi_id: upi_id || null,
      bank_account: bank_account || null,
      ifsc: ifsc || null,
    });

    await vendor.save();

    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig, roles } = require('../config/vars');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.OPS, roles.FINANCE],
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

/**
 * Compare password with stored hash
 */
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

/**
 * Generate JWT token
 */
userSchema.methods.generateToken = function () {
  const payload = {
    sub: this._id,
    role: this.role,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: `${jwtConfig.expirationDays}d`,
  });
};

/**
 * Return safe user object (no password)
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model('User', userSchema);

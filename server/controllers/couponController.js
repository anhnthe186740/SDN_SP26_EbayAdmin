const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/Coupons
// @access  Public
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single coupon
// @route   GET /api/Coupons/:id
// @access  Public
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ id: req.params.id }) || await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    res.status(200).json(coupon);
  } catch (err) {
    next(err);
  }
};

// @desc    Create coupon
// @route   POST /api/Coupons
// @access  Public
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

// @desc    Update coupon
// @route   PUT /api/Coupons/:id
// @access  Public
exports.updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findOne({ id: req.params.id }) || await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    coupon = await Coupon.findByIdAndUpdate(coupon._id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(coupon);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/Coupons/:id
// @access  Public
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ id: req.params.id }) || await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    await Coupon.findByIdAndDelete(coupon._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

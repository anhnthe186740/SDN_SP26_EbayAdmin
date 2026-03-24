const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Public
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    order = await Order.findByIdAndUpdate(order._id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    await Order.findByIdAndDelete(order._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

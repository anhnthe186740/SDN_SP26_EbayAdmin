const OrderItem = require('../models/OrderItem');

exports.getOrderItems = async (req, res, next) => {
  try {
    const items = await OrderItem.find();
    res.status(200).json(items);
  } catch (err) { next(err); }
};

exports.getOrderItem = async (req, res, next) => {
  try {
    const item = await OrderItem.findOne({ id: req.params.id }) || await OrderItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(item);
  } catch (err) { next(err); }
};

exports.createOrderItem = async (req, res, next) => {
  try {
    const item = await OrderItem.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.updateOrderItem = async (req, res, next) => {
  try {
    let item = await OrderItem.findOne({ id: req.params.id }) || await OrderItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    item = await OrderItem.findByIdAndUpdate(item._id, req.body, { new: true, runValidators: true });
    res.status(200).json(item);
  } catch (err) { next(err); }
};

exports.deleteOrderItem = async (req, res, next) => {
  try {
    const item = await OrderItem.findOne({ id: req.params.id }) || await OrderItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    await OrderItem.findByIdAndDelete(item._id);
    res.status(200).json({});
  } catch (err) { next(err); }
};

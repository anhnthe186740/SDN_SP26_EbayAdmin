const Dispute = require('../models/Dispute');

exports.getDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find();
    res.status(200).json(disputes);
  } catch (err) {
    next(err);
  }
};

exports.getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ id: req.params.id }) || await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, error: 'Dispute not found' });
    res.status(200).json(dispute);
  } catch (err) {
    next(err);
  }
};

exports.createDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.create(req.body);
    res.status(201).json(dispute);
  } catch (err) {
    next(err);
  }
};

exports.updateDispute = async (req, res, next) => {
  try {
    let dispute = await Dispute.findOne({ id: req.params.id }) || await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, error: 'Dispute not found' });
    dispute = await Dispute.findByIdAndUpdate(dispute._id, req.body, { new: true, runValidators: true });
    res.status(200).json(dispute);
  } catch (err) {
    next(err);
  }
};

exports.deleteDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ id: req.params.id }) || await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, error: 'Dispute not found' });
    await Dispute.findByIdAndDelete(dispute._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

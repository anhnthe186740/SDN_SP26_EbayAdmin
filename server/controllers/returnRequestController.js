const ReturnRequest = require('../models/ReturnRequest');

exports.getReturnRequests = async (req, res, next) => {
  try {
    const requests = await ReturnRequest.find();
    res.status(200).json(requests);
  } catch (err) { next(err); }
};

exports.getReturnRequest = async (req, res, next) => {
  try {
    const request = await ReturnRequest.findOne({ id: req.params.id }) || await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(request);
  } catch (err) { next(err); }
};

exports.createReturnRequest = async (req, res, next) => {
  try {
    const request = await ReturnRequest.create(req.body);
    res.status(201).json(request);
  } catch (err) { next(err); }
};

exports.updateReturnRequest = async (req, res, next) => {
  try {
    let request = await ReturnRequest.findOne({ id: req.params.id }) || await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Not found' });
    request = await ReturnRequest.findByIdAndUpdate(request._id, req.body, { new: true, runValidators: true });
    res.status(200).json(request);
  } catch (err) { next(err); }
};

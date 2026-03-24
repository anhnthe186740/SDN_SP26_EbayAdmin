const Log = require('../models/Log');

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await Log.find();
    res.status(200).json(logs);
  } catch (err) { next(err); }
};

exports.getLog = async (req, res, next) => {
  try {
    const log = await Log.findOne({ id: req.params.id }) || await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(log);
  } catch (err) { next(err); }
};

exports.createLog = async (req, res, next) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json(log);
  } catch (err) { next(err); }
};

exports.deleteLog = async (req, res, next) => {
  try {
    const log = await Log.findOne({ id: req.params.id }) || await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, error: 'Not found' });
    await Log.findByIdAndDelete(log._id);
    res.status(200).json({});
  } catch (err) { next(err); }
};

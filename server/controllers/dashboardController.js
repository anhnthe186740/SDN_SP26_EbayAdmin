const DashboardConfig = require('../models/DashboardConfig');

exports.getConfigs = async (req, res, next) => {
  try {
    const configs = await DashboardConfig.find();
    res.status(200).json(configs);
  } catch (err) { next(err); }
};

exports.getConfig = async (req, res, next) => {
  try {
    const config = await DashboardConfig.findOne({ id: req.params.id }) || await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(config);
  } catch (err) { next(err); }
};

exports.createConfig = async (req, res, next) => {
  try {
    const config = await DashboardConfig.create(req.body);
    res.status(201).json(config);
  } catch (err) { next(err); }
};

exports.updateConfig = async (req, res, next) => {
  try {
    let config = await DashboardConfig.findOne({ id: req.params.id }) || await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, error: 'Not found' });
    config = await DashboardConfig.findByIdAndUpdate(config._id, req.body, { new: true, runValidators: true });
    res.status(200).json(config);
  } catch (err) { next(err); }
};

exports.deleteConfig = async (req, res, next) => {
  try {
    const config = await DashboardConfig.findOne({ id: req.params.id }) || await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ success: false, error: 'Not found' });
    await DashboardConfig.findByIdAndDelete(config._id);
    res.status(200).json({});
  } catch (err) { next(err); }
};

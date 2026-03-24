const Statistic = require('../models/Statistic');

exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await Statistic.find();
    res.status(200).json(stats);
  } catch (err) { next(err); }
};

exports.getStatistic = async (req, res, next) => {
  try {
    const stat = await Statistic.findOne({ id: req.params.id }) || await Statistic.findById(req.params.id);
    if (!stat) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(stat);
  } catch (err) { next(err); }
};

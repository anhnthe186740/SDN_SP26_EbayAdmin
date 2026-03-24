const Admin = require('../models/Admin');

exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) { next(err); }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ id: req.params.id }) || await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json(admin);
  } catch (err) { next(err); }
};

const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params.id }) || await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ id: req.params.id }) || await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user = await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params.id }) || await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await User.findByIdAndDelete(user._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Public
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    product = await Product.findByIdAndUpdate(product._id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    await Product.findByIdAndDelete(product._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

const express = require('express');
const { getAdmins, getAdmin } = require('../controllers/adminController');
const router = express.Router();
router.route('/').get(getAdmins);
router.route('/:id').get(getAdmin);
module.exports = router;

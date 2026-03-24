const express = require('express');
const { getConfigs, getConfig, createConfig, updateConfig, deleteConfig } = require('../controllers/dashboardController');
const router = express.Router();
router.route('/').get(getConfigs).post(createConfig);
router.route('/:id').get(getConfig).put(updateConfig).delete(deleteConfig);
module.exports = router;

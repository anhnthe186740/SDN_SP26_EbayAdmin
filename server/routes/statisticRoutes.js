const express = require('express');
const { getStatistics, getStatistic } = require('../controllers/statisticController');
const router = express.Router();
router.route('/').get(getStatistics);
router.route('/:id').get(getStatistic);
module.exports = router;

const express = require('express');
const { getHistory } = require('../controllers/historyController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getHistory);

module.exports = router;

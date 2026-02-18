const express = require('express');
const { getRoutes, createRoute, getRoute } = require('../controllers/routeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getRoutes)
    .post(protect, authorize('admin'), createRoute);

router.route('/:id')
    .get(getRoute);

module.exports = router;

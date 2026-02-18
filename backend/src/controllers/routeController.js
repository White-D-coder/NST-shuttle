const Route = require('../models/Route');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
exports.getRoutes = async (req, res, next) => {
    try {
        const routes = await Route.find();
        res.status(200).json({ success: true, count: routes.length, data: routes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Admin only)
exports.createRoute = async (req, res, next) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json({ success: true, data: route });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
exports.getRoute = async (req, res, next) => {
    try {
        const route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({ success: false, error: 'Route not found' });
        }

        res.status(200).json({ success: true, data: route });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: 'Server Error' });
    }
};

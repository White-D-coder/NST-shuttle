const BusStopHistory = require('../models/BusStopHistory');
const Stop = require('../models/Stop');

// @desc    Get all bus stop history
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const history = await BusStopHistory.find()
            .populate('busId', 'name')
            .sort({ date: -1 });

        // Augment with stop names (since we might not have Stop model relations fully set up in populate if separate)
        // But Stop is a collection.
        // Let's manually map stopIds to names if needed, or rely on frontend if stops are loaded there.
        // Better: Fetch all stops and map name.

        const stops = await Stop.find();
        const stopMap = {};
        stops.forEach(s => stopMap[s.stopId] = s.name);

        const data = history.map(h => ({
            ...h._doc,
            stopName: stopMap[h.stopId] || h.stopId,
            driverName: h.busId ? h.busId.name : 'Unknown'
        }));

        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

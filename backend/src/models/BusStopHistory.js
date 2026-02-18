const mongoose = require('mongoose');

const BusStopHistorySchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming driver/bus is a User for now
        required: true
    },
    stopId: {
        type: String,
        required: true,
        ref: 'Stop'
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    departureTime: {
        type: Date
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BusStopHistory', BusStopHistorySchema);

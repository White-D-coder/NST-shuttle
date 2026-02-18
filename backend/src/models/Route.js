const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    arrivalRadius: {
        type: Number,
        default: 50 // meters
    }
});

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a route name'],
        unique: true
    },
    stops: [StopSchema],
    schedule: [String], // Array of departure times e.g. ["08:00", "09:00"]
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Route', RouteSchema);

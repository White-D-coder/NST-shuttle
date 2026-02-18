const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    heading: Number,
    speed: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const TripSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    currentLocation: {
        lat: Number,
        lng: Number,
        heading: Number,
        speed: Number,
        lastUpdated: Date
    },
    locationHistory: [LocationSchema] // Optional: for analytics/playback
});

module.exports = mongoose.model('Trip', TripSchema);

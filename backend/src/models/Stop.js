const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
    stopId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String, // Don't do { location: { type: String } }
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    radius: {
        type: Number,
        default: 15 // meters
    },
    sequence: {
        type: Number,
        required: true
    }
});

// Create a geospatial index for efficient proximity queries
StopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', StopSchema);

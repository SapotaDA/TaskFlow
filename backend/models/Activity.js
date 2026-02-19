const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String, // e.g., 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'LOGIN', 'LOGOUT', 'UPDATE_PROFILE'
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Optional data like task ID or device info
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for fast user-specific lookup
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

const Activity = require('../models/Activity');

/**
 * Log a user activity to the database
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action code (e.g., 'TASK_INITIALIZED')
 * @param {string} details - Human-readable description
 * @param {object} metadata - Optional additional data
 */
const logActivity = async (userId, action, details, metadata = {}) => {
    try {
        await Activity.create({
            user: userId,
            action,
            details,
            metadata
        });
    } catch (err) {
        console.error('Activity Logging Failure:', err.message);
        // Non-blocking catch
    }
};

module.exports = logActivity;

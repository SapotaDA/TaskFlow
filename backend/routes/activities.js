const express = require('express');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/activities
 * @desc    Get recent activity logs for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'System error: Unable to retrieve logs' });
    }
});

/**
 * @route   DELETE /api/activities
 * @desc    Clear activity history for the authenticated user
 * @access  Private
 */
router.delete('/', auth, async (req, res) => {
    try {
        await Activity.deleteMany({ user: req.user });
        res.json({ message: 'History purged successfully' });
    } catch (error) {
        res.status(500).json({ message: 'System error: Purge failed' });
    }
});

module.exports = router;

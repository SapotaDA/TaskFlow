const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const { getNotificationTemplate } = require('./emailTemplates');
const logActivity = require('./logger');

const checkUserActivity = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('Running Inactivity Protocol Verification...');

        try {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

            // Find users who were last seen > 2 hours ago AND haven't been notified for the latest inactivity
            // Or haven't been notified in the last 24 hours
            const idleUsers = await User.find({
                lastSeen: { $lt: twoHoursAgo },
                $or: [
                    { inactivityNotifiedAt: null },
                    { inactivityNotifiedAt: { $lt: twoHoursAgo } }
                ]
            });

            for (const user of idleUsers) {
                // Check if user has pending tasks
                const pendingTasksCount = await Task.countDocuments({
                    user: user._id,
                    status: { $ne: 'completed' }
                });

                if (pendingTasksCount > 0) {
                    // 1. Create In-App Notification
                    await Notification.create({
                        user: user._id,
                        title: 'Workspace Pulse: Tasks Awaiting',
                        message: `It looks like you've been away. You have ${pendingTasksCount} tasks synchronization pending. Log back in to stay on track.`,
                        type: 'system'
                    });

                    // 2. Send Email Notification
                    if (user.email) {
                        const emailHtml = getNotificationTemplate(
                            'Workflow Interrupted',
                            `Hello ${user.name}, your workspace has been idle for over 2 hours. You have <strong style="color: #3b82f6;">${pendingTasksCount} tasks</strong> awaiting your attention. Re-synchronize with TaskFlow to maintain peak productivity.`,
                            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                            'Re-engage Workspace'
                        );

                        await sendEmail({
                            email: user.email,
                            subject: 'Reminder: Continue Your Tasks',
                            html: emailHtml
                        });
                    }

                    // 3. Mark as notified
                    user.inactivityNotifiedAt = Date.now();

                    // Log the activity
                    await logActivity(user._id, 'INACTIVITY_REMINDER', 'System dispatched inactivity reminder via email.');

                    await user.save();

                    console.log(`Inactivity notification dispatched to: ${user.email}`);
                }
            }
        } catch (error) {
            console.error('Inactivity Checker Error:', error);
        }
    });
};

module.exports = checkUserActivity;

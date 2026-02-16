const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const { getNotificationTemplate } = require('./emailTemplates');

const initDeadlineChecker = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running deadline check...');
        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find tasks due within the next 24 hours that haven't been completed
            const upcomingTasks = await Task.find({
                dueDate: { $gte: new Date(), $lte: tomorrow },
                status: { $ne: 'completed' }
            }).populate('user', 'email name');

            for (const task of upcomingTasks) {
                // Check if a notification already exists for this task deadline (to avoid duplicates)
                const existingNotification = await Notification.findOne({
                    user: task.user._id,
                    relatedTask: task._id,
                    type: 'deadline',
                    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                });

                if (!existingNotification) {
                    // Create in-app notification
                    await Notification.create({
                        user: task.user._id,
                        title: 'Upcoming Deadline',
                        message: `Task "${task.title}" is due soon (${new Date(task.dueDate).toLocaleDateString()}).`,
                        type: 'deadline',
                        relatedTask: task._id
                    });

                    // Send email notification (DISABLED per user request for only 'complete' emails)
                    /*
                    if (task.user && task.user.email) {
                        const emailHtml = getNotificationTemplate(
                            'Upcoming Deadline',
                            `Hello ${task.user.name}, your task <strong style="color: #3b82f6;">"${task.title}"</strong> is due for completion by <span style="color: #ffffff;">${new Date(task.dueDate).toLocaleDateString()}</span>. Synchronize your workflow to avoid delays.`,
                            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                            'Go to Dashboard'
                        );

                        await sendEmail({
                            email: task.user.email,
                            subject: `Task Deadline: ${task.title}`,
                            html: emailHtml
                        });
                    }
                    */

                    console.log(`Notification & Email sent for task: ${task.title}`);
                }
            }
        } catch (error) {
            console.error('Error in deadline checker:', error);
        }
    });
};

module.exports = initDeadlineChecker;

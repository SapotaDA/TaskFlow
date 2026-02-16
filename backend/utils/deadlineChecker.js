const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const initDeadlineChecker = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running deadline check...');
        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find tasks due within the next 24 hours that haven't been notified yet
            // For simplicity, we'll check tasks where dueDate is between now and tomorrow
            const upcomingTasks = await Task.find({
                dueDate: { $gte: now, $lte: tomorrow },
                status: { $ne: 'completed' }
            });

            for (const task of upcomingTasks) {
                // Check if a notification already exists for this task deadline (to avoid duplicates)
                const existingNotification = await Notification.findOne({
                    user: task.user,
                    relatedTask: task._id,
                    type: 'deadline',
                    createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } // Only check if notified today
                });

                if (!existingNotification) {
                    await Notification.create({
                        user: task.user,
                        title: 'Upcoming Deadline',
                        message: `Task "${task.title}" is due soon (${new Date(task.dueDate).toLocaleDateString()}).`,
                        type: 'deadline',
                        relatedTask: task._id
                    });
                    console.log(`Notification created for task: ${task.title}`);
                }
            }
        } catch (error) {
            console.error('Error in deadline checker:', error);
        }
    });
};

module.exports = initDeadlineChecker;

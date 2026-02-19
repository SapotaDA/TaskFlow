const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { getNotificationTemplate } = require('../utils/emailTemplates');
const logActivity = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = { user: req.user };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Operational failure: Database retrieval error' });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, priority, dueDate, category, tags, subtasks } = req.body;

  try {
    const task = new Task({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      category: category || 'general',
      tags: tags || [],
      subtasks: subtasks || [],
      user: req.user,
    });

    await task.save();

    // Create a notification for task creation
    await Notification.create({
      user: req.user,
      title: 'Sequence Initialized',
      message: `System has registered new objective: "${task.title}".`,
      type: 'task',
      relatedTask: task._id
    });

    // Send email notification for task creation
    const taskUser = await User.findById(req.user);
    if (taskUser && taskUser.email) {
      const emailHtml = getNotificationTemplate(
        'Objective Initialized',
        `Operator ${taskUser.name}, the system has successfully registered your new objective: <strong style="color: #3b82f6;">"${task.title}"</strong>. <br><br>Status: <span style="color: #ffffff;">${task.status.toUpperCase()}</span><br>Priority: <span style="color: #ffffff;">${task.priority.toUpperCase()}</span>`,
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
        'Access Dashboard'
      );

      // We don't await this to avoid blocking the response
      sendEmail({
        email: taskUser.email,
        subject: `System Alert: New Objective "${task.title}"`,
        html: emailHtml
      }).catch(err => console.error('Email dispatch failed:', err));
    }

    // Log the activity
    await logActivity(req.user, 'TASK_INITIALIZED', `New objective registered: "${task.title}"`, { taskId: task._id });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Initialization failure: Sequence could not be saved' });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
], async (req, res) => {
  const { title, description, status, priority, dueDate, category, tags, subtasks } = req.body;

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user });
    if (!task) return res.status(404).json({ message: 'Target mismatch: Objective not found' });

    const oldStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (subtasks !== undefined) task.subtasks = subtasks;

    await task.save();

    // Log the activity
    await logActivity(req.user, 'TASK_SYNCHRONIZED', `Objective updated: "${task.title}"`, { taskId: task._id, status: task.status });

    if (oldStatus !== 'completed' && task.status === 'completed') {
      const foundUser = await User.findById(req.user);
      if (foundUser?.email) {
        const emailHtml = getNotificationTemplate(
          'Objective Finalized',
          `System alert: User ${foundUser.name} has successfully terminated objective <strong style="color: #10b981;">"${task.title}"</strong>. Operational efficiency has improved.`,
          `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
          'View Logs'
        );

        await sendEmail({
          email: foundUser.email,
          subject: `System: ${task.title} Finalized`,
          html: emailHtml
        });
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Update failure: Data modification denied' });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!task) return res.status(404).json({ message: 'Target mismatch: Objective not found' });

    // Log the activity
    await logActivity(req.user, 'TASK_PURGED', `Objective deleted: "${task.title}"`);

    res.json({ message: 'Target neutralized: Data purged' });
  } catch (error) {
    res.status(500).json({ message: 'Purge failure: Deletion sequence aborted' });
  }
});

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics with high performance aggregation
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    const daysRange = parseInt(req.query.days) || 7;
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysRange + 1);
    startDate.setHours(0, 0, 0, 0);

    const [statsResult, activityResult, categoryResult] = await Promise.all([
      Task.aggregate([
        { $match: { user: userId } },
        {
          $facet: {
            basic: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                  inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                  completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                  highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
                }
              }
            ],
            overdue: [
              {
                $match: {
                  status: { $ne: 'completed' },
                  dueDate: { $ne: null, $lt: now }
                }
              },
              { $count: 'count' }
            ]
          }
        }
      ]),
      Task.aggregate([
        { $match: { user: userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
    ]);

    const result = statsResult[0];
    const basicStats = result.basic[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0
    };
    const overdueCount = result.overdue[0]?.count || 0;

    const stats = {
      ...basicStats,
      overdue: overdueCount,
      categories: {}
    };

    categoryResult.forEach(c => {
      stats.categories[c._id || 'general'] = c.count;
    });

    const activityMap = new Map();
    activityResult.forEach(a => activityMap.set(a._id, a.count));

    const activityData = [];
    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      activityData.push({
        name: daysRange > 14
          ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: activityMap.get(dateStr) || 0
      });
    }

    stats.activity = activityData;
    res.json(stats);
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

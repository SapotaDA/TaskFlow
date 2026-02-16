const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { getNotificationTemplate } = require('../utils/emailTemplates');


const router = express.Router();

// Get all tasks for the authenticated user with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = { user: req.user };

    // Apply filters if provided
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
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
      title: 'New Task Created',
      message: `You created a new task: "${task.title}".`,
      type: 'task',
      relatedTask: task._id
    });

    // Immediate deadline check for the new task
    const now = new Date();
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    if (task.dueDate && task.dueDate >= now && task.dueDate <= tomorrow) {
      await Notification.create({
        user: req.user,
        title: 'Priority: Near Deadline',
        message: `Warning: Your new task "${task.title}" is due within 24 hours!`,
        type: 'deadline',
        relatedTask: task._id
      });
    }

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, priority, dueDate, category, tags, subtasks } = req.body;

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (subtasks !== undefined) task.subtasks = subtasks;

    await task.save();

    // Send email ONLY when task is completed
    if (oldStatus !== 'completed' && task.status === 'completed') {
      const foundUser = await User.findById(req.user);
      if (foundUser && foundUser.email) {
        const emailHtml = getNotificationTemplate(
          'Task Completed',
          `Congratulations ${foundUser.name}! You've successfully finalized <strong style="color: #10b981;">"${task.title}"</strong>. Your focus and efficiency are paying off. Check your updated stats in the dashboard.`,
          `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
          'View My Progress'
        );

        await sendEmail({
          email: foundUser.email,
          subject: `Victory: ${task.title} Finalized`,
          html: emailHtml
        });
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user });

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      mediumPriority: tasks.filter(t => t.priority === 'medium').length,
      lowPriority: tasks.filter(t => t.priority === 'low').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
      categories: {},
    };

    // Count tasks by category
    tasks.forEach(task => {
      const cat = task.category || 'general';
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
    });

    // Dynamic Activity Scan (Days based on query parameter)
    const daysRange = parseInt(req.query.days) || 7;
    const activityData = [];

    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = tasks.filter(t => {
        const createDate = new Date(t.createdAt);
        return createDate >= d && createDate < nextD;
      }).length;

      activityData.push({
        name: daysRange > 14
          ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : d.toLocaleDateString(undefined, { weekday: 'short' }),
        count
      });
    }

    stats.activity = activityData;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const initDeadlineChecker = require('./utils/deadlineChecker');
const initActivityChecker = require('./utils/activityChecker');

const sanitize = require('./middleware/sanitize');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');


dotenv.config();

// Set default JWT secret if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  console.log('Database connected successfully');
  // Initialize background jobs
  initDeadlineChecker();
  initActivityChecker();

}).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://grainy-gradients.vercel.app"],
      connectSrc: ["'self'", process.env.FRONTEND_URL, "https://task-flow-chi-nine.vercel.app", "https://taskiflow.vercel.app", "http://localhost:5173"].filter(Boolean),
    },
  },
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: function (origin, callback) {
    const isAllowed = !origin ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost:') ||
      origin === process.env.FRONTEND_URL ||
      origin === 'https://taskiflow.vercel.app';

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for origin:', origin);
      callback(new Error('CORS Not Allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply sanitization middleware
app.use(sanitize);

// Apply global rate limiting to all API routes
app.use('/api', apiLimiter);

const path = require('path');

// ... existing code ...

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle API 404s explicitly before catch-all
  app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  // SPA catch-all
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON format', error: err.message });
  }

  console.error('Server Error:', err.message);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

module.exports = app;

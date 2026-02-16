const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

/**
 * Custom sanitization middleware
 * Sanitizes user input to prevent XSS and NoSQL injection attacks
 */
const sanitize = (req, res, next) => {
  try {
    // Sanitize against NoSQL injection (guard against undefined body/query)
    if (req.body && typeof req.body === 'object') {
      mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    if (req.query && typeof req.query === 'object') {
      mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    }

    // Sanitize string inputs against XSS
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return xss(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };

    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
  } catch (err) {
    return next(err);
  }
  next();
};

module.exports = sanitize;

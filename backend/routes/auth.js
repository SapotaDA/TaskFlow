const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { getNotificationTemplate } = require('../utils/emailTemplates');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');



const router = express.Router();

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 */
router.post('/register', authLimiter, [

  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
router.post('/login', authLimiter, [

  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @desc    Forgot password - Email Link
 * @route   POST /api/auth/forgot-password
 */
router.post('/forgot-password', passwordResetLimiter, [

  body('email').isEmail().withMessage('Please provide a valid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If an account exists, a reset link has been sent' });

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://localhost:5173`;
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. Please click: \n\n ${resetUrl}`;

    try {
      // DEV SIMULATION MODE
      if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
        console.log('--- DEV SIMULATION: EMAIL RESET LINK ---');
        console.log(`To: ${user.email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('----------------------------------------');
        return res.json({ message: 'DEV MODE: Reset link logged to server console' });
      }

      const emailHtml = getNotificationTemplate(
        'Password Reset Protocol',
        `Hello ${user.name}, we received a request to synchronize your security credentials. Click the button below to initialize the password reset sequence.`,
        resetUrl,
        'Reset Password'
      );

      await sendEmail({
        email: user.email,
        subject: 'Security: Password Reset Protocol - TaskFlow',
        html: emailHtml
      });
      res.json({ message: 'Reset link sent to your email' });
    } catch (err) {
      console.error('Nodemailer Error:', err.message);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      res.status(500).json({ message: 'Email could not be sent', error: err.message });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @desc    Forgot Password - Send OTP (Email Only)
 * @route   POST /api/auth/send-otp-email
 */
router.post('/send-otp-email', passwordResetLimiter, [

  body('email').isEmail().withMessage('A valid email address is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If an account exists, an OTP will be sent' });
    }

    const otp = user.getOTP();
    await user.save();

    try {
      // Send OTP via email (DEV SIMULATION MODE)
      if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
        console.log('\n=== DEV SIMULATION: EMAIL OTP ===');
        console.log(`To: ${user.email}`);
        console.log(`OTP: ${otp}`);
        console.log(`Expires: 10 minutes`);
        console.log('===================================\n');
        return res.json({ message: 'DEV MODE: OTP logged to server console' });
      }

      const emailHtml = getNotificationTemplate(
        'Verification OTP',
        `Hello ${user.name}, your TaskFlow security code is: <strong style="color: #3b82f6; font-size: 24px;">${otp}</strong>. This code is valid for 10 minutes. Use it to finalize your session validation.`,
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
        'Return to Dashboard'
      );

      await sendEmail({
        email: user.email,
        subject: 'Security: Verification OTP - TaskFlow',
        html: emailHtml
      });
      res.json({ message: 'OTP sent to your email' });
    } catch (err) {
      console.error('Send OTP Error:', err.message);
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      res.status(500).json({ message: 'Email service authentication failed', error: err.message });
    }
  } catch (error) {
    console.error('Forgot Password OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
/**
 * @desc    Verify OTP (Email Only)
 * @route   POST /api/auth/verify-otp-identifier
 */
router.post('/verify-otp-identifier', passwordResetLimiter, [

  body('identifier').isEmail().withMessage('Email is required'),
  body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { identifier, otp } = req.body;

  try {
    const user = await User.findOne({
      email: identifier,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Generate a temporary reset token to allow password change
    const resetToken = user.getResetPasswordToken();
    await user.save();

    console.log(`OTP verified for user: ${identifier}`);
    res.json({ message: 'OTP verified successfully', resetToken });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 */
router.post('/reset-password', passwordResetLimiter, [

  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token, password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password; // Password will be hashed by pre-save middleware
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc    Get Current User
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc    Update Profile
 * @route   PUT /api/auth/me
 */
// Update Profile
router.put('/me', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    let emailChangePending = false;

    // Check if email is being changed
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });

      // Init email change verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.newEmail = email;
      user.newEmailOtp = otp;
      user.newEmailOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
      emailChangePending = true;

      // DEV SIMULATION FOR EMAIL CHANGE
      if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
        console.log('\n=== DEV SIMULATION: EMAIL CHANGE OTP ===');
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('==========================================\n');
      } else {
        // Send verification email to NEW email
        const emailHtml = getNotificationTemplate(
          'Email Change Verification',
          `Hello ${user.name}, you requested to change your network address to this email. Your verification code is: <strong style="color: #3b82f6; font-size: 24px;">${otp}</strong>.`,
          '#',
          'Verify in App'
        );

        await sendEmail({
          email: email, // Send to new email
          subject: 'Verify New Email Address - TaskFlow',
          html: emailHtml
        }).catch(err => console.error('Email change OTP failed:', err));
      }
    }

    await user.save();

    res.json({
      message: emailChangePending ? 'Profile updated. Verification required for new email.' : 'Profile updated successfully',
      emailChangePending,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email Change
router.post('/verify-email-change', auth, [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { otp } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify pending change existence
    if (!user.newEmail || !user.newEmailOtp || !user.newEmailOtpExpire) {
      console.log('Verify Email Change Failed: No pending change', {
        newEmail: user.newEmail,
        hasOtp: !!user.newEmailOtp,
        hasExpire: !!user.newEmailOtpExpire
      });
      return res.status(400).json({ message: 'No email change pending.' });
    }

    // Verify OTP value and expiration
    const isOtpValid = user.newEmailOtp === otp.trim();
    const isNotExpired = user.newEmailOtpExpire > Date.now();

    if (!isOtpValid || !isNotExpired) {
      console.log('Verify Email Change Failed:', {
        inputOtp: otp,
        storedOtp: user.newEmailOtp,
        isOtpValid,
        isNotExpired,
        expireTime: user.newEmailOtpExpire,
        now: Date.now()
      });
      return res.status(400).json({ message: isOtpValid ? 'Verification code expired.' : 'Invalid verification code.' });
    }

    // Commit change
    user.email = user.newEmail;
    user.newEmail = null;
    user.newEmailOtp = null;
    user.newEmailOtpExpire = null;

    await user.save();

    res.json({
      message: 'Email address updated successfully.',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Verify Email Change Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc    Send OTP for Account Deletion (Email Only)
 * @route   POST /api/auth/delete-account-otp
 */
router.post('/delete-account-otp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate OTP
    const otp = user.getOTP();
    await user.save();

    // DEV SIMULATION MODE
    if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
      console.log('\n=== DEV SIMULATION: DELETE ACCOUNT OTP ===');
      console.log(`To: ${user.email}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires: 10 minutes`);
      console.log('==========================================\n');
      return res.json({ message: 'DEV MODE: OTP logged to server console' });
    }

    const emailHtml = getNotificationTemplate(
      'Account Deletion Alert',
      `Hello ${user.name}, you are attempting to permanently erase your TaskFlow account. Your verification code is: <strong style="color: #ef4444; font-size: 24px;">${otp}</strong>. This action is IRREVERSIBLE.`,
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
      'Abort Deletion'
    );

    await sendEmail({
      email: user.email,
      subject: 'Urgent: Account Deletion OTP - TaskFlow',
      html: emailHtml
    });
    return res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Delete Account OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @desc    Delete Account (verify OTP and delete)
 * @route   POST /api/auth/delete-account
 */
router.post('/delete-account', auth, [
  body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { otp } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify OTP
    if (user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user);

    console.log(`Account deleted for user: ${user.email}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/test-inactivity-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailHtml = getNotificationTemplate(
      'System Dormancy Detected',
      `Operator ${user.name}, your account has been flagged as inactive for over 7 days. <br><br>
      Consistent activity is required to maintain optimal workflow synchronization. Please access your terminal to refresh your session status.`,
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
      'Reinitialize Session'
    );

    // Force send regardless of actual status
    if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
      console.log('\n=== DEV SIMULATION: INACTIVITY EMAIL ===');
      console.log(`To: ${user.email}`);
      console.log('--- Content ---');
      console.log('Subject: Action Required: Inactivity Alert');
      console.log('System Dormancy Detected...');
      console.log('========================================\n');
      return res.json({ message: 'DEV MODE: Test email logged to server console.' });
    }

    await sendEmail({
      email: user.email,
      subject: 'Action Required: Inactivity Alert',
      html: emailHtml
    });

    res.json({ message: 'Test inactivity warning dispatched.' });
  } catch (error) {
    console.error('Test Email Error:', error);
    res.status(500).json({ message: 'Dispatch failed.' });
  }
});

module.exports = router;

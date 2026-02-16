const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporterConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), // Remove spaces automatically
        },
    };

    // Auto-detect Gmail service
    if (process.env.EMAIL_HOST?.includes('gmail') || process.env.EMAIL_USER?.endsWith('@gmail.com')) {
        delete transporterConfig.host;
        delete transporterConfig.port;
        delete transporterConfig.secure;
        transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Define email options
    const mailOptions = {
        from: `TaskFlow <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Nodemailer Error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            host: process.env.EMAIL_HOST,
            user: process.env.EMAIL_USER ? 'Present' : 'Missing'
        });
        throw error;
    }
};

module.exports = sendEmail;

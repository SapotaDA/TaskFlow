const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    };

    // If using Gmail, it's often more reliable to use the 'service' property
    if (process.env.EMAIL_HOST?.includes('gmail')) {
        delete transporterConfig.host;
        delete transporterConfig.port;
        delete transporterConfig.secure;
        transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Define email options
    const mailOptions = {
        from: `TaskFlow <${process.env.EMAIL_FROM}>`,
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

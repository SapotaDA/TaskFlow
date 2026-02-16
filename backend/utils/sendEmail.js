const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporterConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug logging
        logger: true // Log to console
    };

    console.log(`MAILER_INIT: User=${process.env.EMAIL_USER}, PassLen=${process.env.EMAIL_PASS?.replace(/\s/g, '').length}`);
    const transporter = nodemailer.createTransport(transporterConfig);

    // Define email options
    const mailOptions = {
        from: `TaskFlow <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Send the email with a strict internal timeout
    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SERVER_MAIL_TIMEOUT: Google is taking too long to respond. Check your Render firewall or Gmail settings.')), 10000)
        );

        // Race the email sending against a 10-second timeout
        await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise
        ]);

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Nodemailer Error:', {
            message: error.message,
            code: error.code
        });
        throw error;
    }
};

module.exports = sendEmail;

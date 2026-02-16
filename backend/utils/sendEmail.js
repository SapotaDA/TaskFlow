const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Use 'service: gmail' which handles host/port automatically
    const transporterConfig = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
        },
        family: 4, // Force IPv4 to prevent ENETUNREACH errors on Render
        // Connection settings to prevent hangs
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        debug: true,
        logger: true
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

    // Send the email with a generous internal timeout (30 seconds)
    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SERVER_MAIL_TIMEOUT: Google is taking too long (30s+). Check your Render firewall or Gmail settings.')), 30000)
        );

        // Race the email sending against a 30-second timeout
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

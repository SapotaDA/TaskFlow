const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporterConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: false
        }
    };

    console.log(`Initialising mail server: ${process.env.EMAIL_USER} (Pass length: ${process.env.EMAIL_PASS?.length})`);
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

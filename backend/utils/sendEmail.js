const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Use 'service: gmail' which handles host/port automatically
    const emailUser = process.env.EMAIL_USER || '';
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

    const transporterConfig = {
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            rejectUnauthorized: false,
        },
        family: 4,
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 25000,
        debug: true,
        logger: true
    };

    console.log(`MAILER_INIT: User=${emailUser}, PassLen=${emailPass.length}`);
    const transporter = nodemailer.createTransport(transporterConfig);

    // Define email options
    const mailOptions = {
        from: `TaskFlow <${process.env.EMAIL_FROM || emailUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Send the email with a timeout shorter than Render's gateway (30s)
    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('MAIL_TIMEOUT: SMTP handshake exceeded 25s. Action Required: Check your Google App Password and 2FA settings.')), 25000)
        );

        await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise
        ]);

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Nodemailer Error:', error.message);
        throw error;
    }
};

module.exports = sendEmail;

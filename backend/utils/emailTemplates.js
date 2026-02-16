const getNotificationTemplate = (title, message, actionUrl, actionText) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                background-color: #050608;
                font-family: 'Outfit', 'Inter', sans-serif;
            }
            .wrapper {
                width: 100%;
                background-color: #050608;
                padding: 40px 0;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #0f1115 0%, #050608 100%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 32px;
                overflow: hidden;
                box-shadow: 0 40px 100px rgba(0,0,0,0.5);
            }
            .content {
                padding: 48px;
            }
            .header {
                display: flex;
                align-items: center;
                margin-bottom: 40px;
            }
            .logo-mark {
                width: 44px;
                height: 44px;
                background: #ffffff;
                border-radius: 14px;
                display: inline-block;
                text-align: center;
                line-height: 44px;
                color: #000000;
                font-weight: 900;
                font-size: 18px;
                margin-right: 14px;
            }
            .brand-name {
                color: #ffffff;
                font-weight: 700;
                font-size: 20px;
                letter-spacing: -0.02em;
            }
            .title {
                font-size: 36px;
                font-weight: 900;
                color: #ffffff;
                margin: 0 0 20px 0;
                line-height: 1.1;
                letter-spacing: -0.03em;
            }
            .message {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.5);
                line-height: 1.7;
                margin-bottom: 40px;
                font-weight: 400;
            }
            .button-container {
                margin-bottom: 40px;
            }
            .btn {
                display: inline-block;
                background: #3b82f6;
                color: #ffffff !important;
                padding: 20px 40px;
                border-radius: 18px;
                text-decoration: none;
                font-weight: 800;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3);
            }
            .footer {
                padding: 40px 48px;
                background: rgba(255, 255, 255, 0.02);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                text-align: center;
            }
            .footer-text {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.2);
                line-height: 1.8;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-weight: 700;
            }
            .highlight {
                color: #3b82f6;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="email-container">
                <div class="content">
                    <div class="header">
                        <span class="logo-mark">TF</span>
                        <span class="brand-name">TaskFlow</span>
                    </div>
                    
                    <h1 class="title">${title}</h1>
                    <p class="message">${message}</p>
                    
                    <div class="button-container">
                        <a href="${actionUrl}" class="btn">${actionText}</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p class="footer-text">
                        Automated sync via Protocol_09<br>
                        &copy; ${new Date().getFullYear()} TaskFlow Global. Managed by SapotaDA.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    getNotificationTemplate
};

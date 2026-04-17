const nodemailer = require('nodemailer');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('WARNING: EMAIL_USER or EMAIL_PASS not found in environment variables!');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"Auth Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4f46e5;">Password Reset</h2>
                <p>You have requested a password reset. Use the following OTP to verify your identity.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p style="font-size: 12px; color: #666; margin-top: 40px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    };

    try {
        console.log(`Sending email to ${email}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email send error details:');
        console.error('Code:', error.code);
        console.error('Response:', error.response);
        console.error('Message:', error.message);
        return false;
    }
};

module.exports = { sendOTP };

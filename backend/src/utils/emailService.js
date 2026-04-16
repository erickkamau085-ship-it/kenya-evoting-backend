const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendOTPEmail = async (to, otp, fullName) => {
    const mailOptions = {
        from: `"IEBC Kenya" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '🔐 IEBC Kenya - Your OTP Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #BE3F34 0%, #000000 50%, #008C51 100%); padding: 20px; text-align: center;">
                    <h1 style="color: #F3A900; margin: 0;">🇰🇪 IEBC Kenya</h1>
                    <p style="color: white; margin: 5px 0 0;">2027 General Elections</p>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333;">Hello ${fullName},</h2>
                    <p style="color: #555; font-size: 16px;">Your OTP verification code is:</p>
                    <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #BE3F34; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #555;">This code will expire in <strong>5 minutes</strong>.</p>
                    <p style="color: #777; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0;">Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p style="color: #999; font-size: 11px; margin: 5px 0 0;">Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
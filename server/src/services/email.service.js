import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anuragbasuri@gmail.com',
        pass: 'xdsqcwcmtyqbytfj',
    },
});

export const sendRegistrationEmail = async ({ to, name, eventName, eventDate, eventTime, qrUrl }) => {
    const mailOptions = {
        from: `"RaveYard 2025" <${process.env.MAIL_USER}>`,
        to,
        subject: `💀 Your Soul Pass for ${eventName} is Confirmed!`,
        html: `
        <div style="background: radial-gradient(circle at 30% 40%, #2d1b69 0%, #1a0630 40%, #0a0015 70%, #000000 100%); color: #fff; font-family: 'Segoe UI', 'Arial', sans-serif; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 36px auto; background: rgba(20,0,30,0.98); border-radius: 26px; box-shadow: 0 0 40px #2d1b69; border: 3px solid #ff1744; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #8B0000 0%, #2d1b69 100%); padding: 36px 0 18px 0;">
                    <h1 style="margin: 0; font-size: 2.6rem; font-weight: bold; letter-spacing: 2px; color: #fff; text-shadow: 0 2px 12px #000;">
                        <span style="color: #ff1744;">RaveYard 2025</span> <span style="font-size:2rem;">💀</span>
                    </h1>
                    <h2 style="margin: 0; font-size: 1.35rem; color: #ffb3b3; font-weight: 600; letter-spacing: 1px;">The Haunted Resurrection</h2>
                </div>
                <div style="padding: 36px 40px 28px 40px;">
                    <p style="font-size: 1.18rem; color: #ffb3b3; margin-bottom: 0.7em;">Greetings, <b>${name}</b>!</p>
                    <p style="font-size: 1.16rem; color: #fff; margin-bottom: 1.3em;">
                        Congratulations! You have <b>secured your <span style="color:#ff1744;">Soul Pass</span></b> for <span style="color:#ff1744;">${eventName}</span>.
                    </p>
                    <div style="background: #1a0630; border-radius: 14px; padding: 20px 0; margin-bottom: 1.7em; text-align: center;">
                        <p style="color: #ff1744; font-weight: bold; margin-bottom: 12px; font-size: 1.1rem;">Present this QR code at the crypt gates for entry:</p>
                        <img src="${qrUrl}" alt="QR Code" style="width:190px; height:auto; border: 4px solid #ff1744; border-radius: 14px; background: #fff; box-shadow: 0 0 16px #ff1744;" />
                    </div>
                    <div style="background: #2d1b69; border-radius: 12px; padding: 16px 20px; margin-bottom: 1.3em;">
                        <p style="font-size: 1.08rem; color: #ffb3b3; margin: 0;">
                            <strong>Event Date:</strong> <span style="color:#fff;">${eventDate}</span><br>
                            <strong>Time:</strong> <span style="color:#fff;">${eventTime || '5:00 PM'}</span><br>
                            <strong>Venue:</strong> <span style="color:#fff;">Baldevraj Mittal Auditorium</span>
                        </p>
                    </div>
                    <div style="margin-bottom: 1.2em;">
                        <p style="font-size: 1.08rem; color: #ffb3b3; margin: 0;">
                            <span style="color:#ff1744; font-weight:bold;">Prepare yourself...</span><br>
                            The night will echo with haunted beats, ghostly lights, and memories that will linger beyond the grave.<br>
                            <span style="color:#ff1744;">Entry is sealed once the souls are full!</span>
                        </p>
                    </div>
                    <div style="margin: 1.5em 0 0.5em 0; text-align: center;">
                        <span style="display:inline-block; background: #ff1744; color: #fff; font-weight: bold; border-radius: 8px; padding: 6px 18px; font-size: 1.08rem; letter-spacing: 1px; box-shadow: 0 2px 8px #2d1b69;">
                            This pass is your only way in. Guard it well!
                        </span>
                    </div>
                    <p style="font-size: 1.08rem; color: #fff; margin-top: 32px;">
                        Awaiting your arrival in the shadows,<br>
                        <span style="color:#ff1744; font-weight:bold;">— Team RaveYard</span>
                    </p>
                </div>
                <div style="background: linear-gradient(90deg, #8B0000 0%, #2d1b69 100%); padding: 14px 0; text-align: center;">
                    <span style="color: #ffb3b3; font-size: 1.05rem; letter-spacing: 1px;">#RaveYard2025 &nbsp;|&nbsp; Glow. Scream. Survive.</span>
                </div>
            </div>
        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new ApiError(500, 'Failed to send registration email: ' + error.message);
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
        from: `"Vibranta Club" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h3>Password Reset</h3>
            <p>Click the link below to reset your password. This link is valid for 15 minutes:</p>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            <br /><br />
            <p>If you did not request this, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Password reset email failed:', error);
        throw new ApiError(500, 'Failed to send password reset email: ' + error.message);
    }
};
